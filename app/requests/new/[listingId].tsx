import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lightbulb, ScrollText } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { fadeUp } from '@/constants/motion';
import { FormChips, FormInput, FormToggle } from '@/components/form';
import {
  Button,
  Card,
  ChipGroup,
  ErrorState,
  Header,
  InfoRow,
  LoadingState,
  Screen,
  Stepper,
  Text,
} from '@/components/ui';
import { cta, microTips } from '@/constants/brand';
import { deliveryMethodLabel, housingTypeLabel } from '@/constants/labels';
import { colors } from '@/constants/theme';
import { useListingDetail } from '@/features/animals';
import { useMyProfile } from '@/features/auth';
import { useCreateRequest } from '@/features/requests';
import { requestSchema, type RequestInput } from '@/schemas/request';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';
import { formatPrice } from '@/utils/format';

const steps = ['Tu hogar', 'Tu experiencia', 'Llegada', 'Acuerdo'] as const;
const stepFields: FieldPath<RequestInput>[][] = [
  ['housingType', 'hasYard', 'otherPets', 'household'],
  ['experience', 'commitment'],
  ['deliveryMethod', 'preferredDate', 'preferredWindow', 'deliveryAddress'],
  ['contractAccepted'],
];

export default function NewRequestScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const listing = useListingDetail(listingId);
  const me = useMyProfile();
  const create = useCreateRequest();
  const [step, setStep] = useState(0);
  const [tip] = useState(() => microTips[Math.floor(Math.random() * microTips.length)]);

  const l = listing.data;
  const { control, handleSubmit, trigger, setValue } = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
    values: {
      housingType: 'apartment',
      hasYard: false,
      otherPets: '',
      household: '',
      experience: '',
      commitment: '',
      deliveryMethod: l && !l.allows_delivery ? 'pickup' : 'delivery',
      preferredDate: '',
      preferredWindow: '',
      deliveryAddress: me.data?.private?.address_line ?? '',
      contractAccepted: false,
    },
    resetOptions: { keepDirtyValues: true },
  });
  const method = useWatch({ control, name: 'deliveryMethod' });

  if (listing.isPending || me.isPending) return <LoadingState />;
  if (listing.isError || !l)
    return <ErrorState message={errorMessage(listing.error)} onRetry={() => router.back()} />;

  const name = l.animal.name ?? 'esta mascota';
  const isAdoption = l.listing_type === 'adoption';
  const methods = (['delivery', 'pickup'] as const).filter((m) =>
    m === 'delivery' ? l.allows_delivery : l.allows_pickup,
  );

  const next = async () => {
    if (await trigger(stepFields[step] ?? [])) setStep((s) => s + 1);
  };

  const submit = handleSubmit((input) =>
    create.mutate(
      { listingId, input },
      {
        onSuccess: (id) => {
          toast.success('¡Solicitud recibida! Estamos presentando tu hogar a su cuidador.');
          router.replace(`/requests/${id}`);
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    ),
  );

  return (
    <Screen
      footer={
        <View className="flex-row gap-3">
          {step > 0 ? (
            <Button
              title="Atrás"
              variant="outline"
              className="flex-1"
              onPress={() => setStep((s) => s - 1)}
            />
          ) : null}
          {step < steps.length - 1 ? (
            <Button
              testID="request-next"
              title="Continuar"
              className="flex-[2]"
              onPress={() => void next()}
            />
          ) : (
            <Button
              testID="request-submit"
              title={cta.confirmHome}
              className="flex-[2]"
              loading={create.isPending}
              onPress={() => void submit()}
            />
          )}
        </View>
      }
    >
      <Header title={isAdoption ? cta.requestAdoption : cta.requestArrival} subtitle={name} />
      <View className="px-5 pb-3">
        <Stepper steps={steps} current={step} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-5 px-5 pb-8">
        <Animated.View key={step} entering={fadeUp()} className="gap-5">
          {step === 0 ? (
            <>
              <Text variant="title">Cuéntanos de tu hogar</Text>
              <FormChips
                control={control}
                name="housingType"
                label="Tipo de vivienda"
                options={(['apartment', 'house', 'farm', 'other'] as const).map((v) => ({
                  value: v,
                  label: housingTypeLabel[v],
                }))}
              />
              <FormToggle control={control} name="hasYard" label="Tengo patio o espacio exterior seguro" />
              <FormInput
                control={control}
                name="otherPets"
                label="¿Tienes otras mascotas? (opcional)"
                placeholder="Ej. una gata de 3 años, esterilizada"
              />
              <FormInput
                control={control}
                name="household"
                label="¿Quiénes viven contigo? (opcional)"
                placeholder="Ej. mi pareja y una niña de 6 años"
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Text variant="title">Tu experiencia</Text>
              <FormInput
                testID="request-experience"
                control={control}
                name="experience"
                label="¿Has cuidado mascotas antes?"
                multiline
                placeholder="Cuéntanos sobre tus experiencias con animales"
              />
              <FormInput
                testID="request-commitment"
                control={control}
                name="commitment"
                label={`¿Por qué quieres darle un hogar a ${name}?`}
                multiline
                placeholder="Tu motivación y cómo será su día a día contigo"
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text variant="title">¿Cómo llegará a casa?</Text>
              <Controller
                control={control}
                name="deliveryMethod"
                render={({ field }) => (
                  <ChipGroup
                    options={methods.map((m) => ({ value: m, label: deliveryMethodLabel[m] }))}
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                      if (v === 'pickup') setValue('deliveryAddress', '');
                    }}
                  />
                )}
              />
              {l.delivery_window ? (
                <View className="rounded-2xl bg-secondary-light p-3">
                  <Text variant="caption" className="text-secondary">
                    Horario de entregas del cuidador: {l.delivery_window}
                  </Text>
                </View>
              ) : null}
              <FormInput
                control={control}
                name="preferredDate"
                label="Fecha preferida (opcional)"
                placeholder="AAAA-MM-DD"
                keyboardType="numbers-and-punctuation"
              />
              <FormInput
                control={control}
                name="preferredWindow"
                label="Franja horaria preferida (opcional)"
                placeholder="Ej. sábado en la mañana"
              />
              {method === 'delivery' ? (
                <FormInput
                  testID="request-address"
                  control={control}
                  name="deliveryAddress"
                  label="Dirección de entrega"
                  multiline
                  hint="Solo la verá el cuidador de esta mascota."
                />
              ) : null}
              <Text variant="caption">
                El traslado se hace con personal de confianza o transporte acondicionado, nunca en mochilas de
                comida ni paquetería común.
              </Text>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Text variant="title">Acuerdo de tenencia responsable</Text>
              <Card>
                <View className="flex-row items-center gap-2">
                  <ScrollText size={18} color={colors.secondary} />
                  <Text variant="label">Términos de {l.owner.full_name}</Text>
                </View>
                <Text>
                  {l.contract_terms ??
                    'Me comprometo a brindarle cuidados responsables, alimento, atención veterinaria y un hogar seguro.'}
                </Text>
              </Card>
              <Card title="Resumen">
                <InfoRow label="Mascota" value={name} />
                <InfoRow label="Llegada" value={deliveryMethodLabel[method]} />
                {!isAdoption ? <InfoRow label="Precio" value={formatPrice(l.price, l.currency)} /> : null}
                {l.transfer_fee !== null ? (
                  <InfoRow label="Tarifa de traslado / aporte" value={formatPrice(l.transfer_fee, 'DOP')} />
                ) : null}
                <Text className="text-[11px] text-ink-faint">
                  Los montos se coordinan directamente con el cuidador. Petites no cobra ni procesa pagos.
                </Text>
              </Card>
              <FormToggle
                testID="request-accept"
                control={control}
                name="contractAccepted"
                label="Acepto el acuerdo"
                description="Equivale a tu firma digital."
              />
              {tip ? (
                <View className="flex-row gap-2 rounded-2xl bg-primary-light p-3">
                  <Lightbulb size={18} color={colors.primaryDark} />
                  <Text className="flex-1 text-[13px] text-primary-dark">{tip}</Text>
                </View>
              ) : null}
            </>
          ) : null}
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}
