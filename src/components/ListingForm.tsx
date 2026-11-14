import { zodResolver } from '@hookform/resolvers/zod';
import { HeartHandshake, Tag } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { fadeUp } from '@/constants/motion';
import { sexLabel, sizeLabel, triStateLabel } from '@/constants/labels';
import { colors } from '@/constants/theme';
import { useBreeds, useCategories, useProvinces } from '@/features/animals';
import { listingSchema, type ListingInput } from '@/schemas/listing';
import { FormChips, FormInput, FormSelect, FormToggle } from './form';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { ImagePicker } from './ui/ImagePicker';
import { Input } from './ui/Input';
import { PressableScale } from './ui/PressableScale';
import { Stepper } from './ui/Stepper';
import { Text } from './ui/Text';

const steps = ['Modalidad y fotos', 'Sobre el animal', 'Salud', 'Publicación'] as const;

const stepFields: FieldPath<ListingInput>[][] = [
  ['listingType', 'images'],
  ['name', 'categoryId', 'breedId', 'ageValue', 'ageUnit', 'sex', 'size', 'description', 'personalityTags'],
  ['vaccinated', 'vaccinationComplete', 'dewormed', 'sterilized', 'hasVetDocuments', 'medicalNotes'],
  [
    'price',
    'currency',
    'provinceId',
    'city',
    'conditions',
    'contractTerms',
    'transferFee',
    'allowsDelivery',
    'allowsPickup',
    'deliveryWindow',
  ],
];

const tri = (['yes', 'no', 'unknown'] as const).map((v) => ({ value: v, label: triStateLabel[v] }));
const suggestedTags = [
  'Juguetón',
  'Cariñoso',
  'Tranquilo',
  'Sociable',
  'Activo',
  'Independiente',
  'Bueno con niños',
  'Bueno con otras mascotas',
];

interface Props {
  initial: ListingInput;
  submitting: boolean;
  submitLabel: string;
  allowDraft?: boolean;
  onSubmit: (input: ListingInput, asDraft: boolean) => void;
}

export function ListingForm({ initial, submitting, submitLabel, allowDraft = false, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [tagDraft, setTagDraft] = useState('');
  const categories = useCategories();
  const provinces = useProvinces();
  const { control, handleSubmit, trigger, setValue } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: initial,
    mode: 'onTouched',
  });

  const listingType = useWatch({ control, name: 'listingType' });
  const categoryId = useWatch({ control, name: 'categoryId' });
  const vaccinated = useWatch({ control, name: 'vaccinated' });
  const allowsDelivery = useWatch({ control, name: 'allowsDelivery' });
  const breeds = useBreeds(categoryId || null);
  const isSale = listingType === 'sale';

  const next = async () => {
    const fields = stepFields[step] ?? [];
    if (await trigger(fields)) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const submit = (asDraft: boolean) => handleSubmit((input) => onSubmit(input, asDraft))();

  return (
    <View className="flex-1">
      <View className="px-5 pb-3">
        <Stepper steps={steps} current={step} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-5 px-5 pb-8">
        <Animated.View key={step} entering={fadeUp()} className="gap-5">
          {step === 0 ? (
            <>
              <Text variant="title">¿Qué quieres publicar?</Text>
              <Controller
                control={control}
                name="listingType"
                render={({ field }) => (
                  <View className="flex-row gap-3">
                    {(
                      [
                        {
                          value: 'adoption',
                          title: 'Adopción',
                          hint: 'Sin precio, con requisitos',
                          icon: HeartHandshake,
                        },
                        { value: 'sale', title: 'Venta', hint: 'Con precio y condiciones', icon: Tag },
                      ] as const
                    ).map((opt) => {
                      const selected = field.value === opt.value;
                      return (
                        <PressableScale
                          key={opt.value}
                          testID={`type-${opt.value}`}
                          onPress={() => {
                            field.onChange(opt.value);
                            if (opt.value === 'adoption') {
                              setValue('price', null);
                              setValue('currency', null);
                            } else {
                              setValue('currency', 'DOP');
                            }
                          }}
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                          className={`flex-1 gap-2 rounded-3xl border-2 p-4 ${selected ? 'border-primary bg-primary-light' : 'border-line bg-surface'}`}
                        >
                          <opt.icon size={26} color={selected ? colors.primary : colors.secondary} />
                          <Text variant="subtitle">{opt.title}</Text>
                          <Text variant="caption">{opt.hint}</Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                )}
              />
              <Controller
                control={control}
                name="images"
                render={({ field, fieldState }) => (
                  <ImagePicker
                    label="Fotos"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <FormInput
                testID="listing-name"
                control={control}
                name="name"
                label="Nombre (opcional)"
                placeholder="¿Cómo se llama?"
              />
              <FormSelect
                testID="listing-category"
                control={control}
                name="categoryId"
                label="Tipo de animal"
                placeholder="Elige el tipo"
                options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
              />
              <FormSelect
                control={control}
                name="breedId"
                label="Raza (opcional)"
                placeholder={categoryId ? 'Elige la raza' : 'Elige primero el tipo'}
                searchable
                clearable
                disabled={!categoryId}
                options={(breeds.data ?? []).map((b) => ({ value: b.id, label: b.name }))}
              />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormInput
                    testID="listing-age"
                    control={control}
                    name="ageValue"
                    label="Edad"
                    numeric
                    placeholder="0"
                  />
                </View>
                <View className="flex-[1.3] justify-end">
                  <FormChips
                    control={control}
                    name="ageUnit"
                    options={[
                      { value: 'months', label: 'Meses' },
                      { value: 'years', label: 'Años' },
                    ]}
                  />
                </View>
              </View>
              <FormChips
                control={control}
                name="sex"
                label="Sexo"
                options={(['male', 'female', 'unknown'] as const).map((v) => ({
                  value: v,
                  label: sexLabel[v],
                }))}
              />
              <FormChips
                control={control}
                name="size"
                label="Tamaño"
                options={(['small', 'medium', 'large', 'giant'] as const).map((v) => ({
                  value: v,
                  label: sizeLabel[v],
                }))}
              />
              <FormInput
                testID="listing-description"
                control={control}
                name="description"
                label="Descripción"
                multiline
                placeholder="Personalidad, rutinas, qué le encanta... Mejor alegre que triste."
              />
              <Controller
                control={control}
                name="personalityTags"
                render={({ field }) => {
                  const toggle = (tag: string) =>
                    field.onChange(
                      field.value.includes(tag)
                        ? field.value.filter((t) => t !== tag)
                        : [...field.value, tag].slice(0, 8),
                    );
                  return (
                    <View className="gap-2">
                      <Text variant="label">Personalidad</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {[...new Set([...suggestedTags, ...field.value])].map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            selected={field.value.includes(tag)}
                            onPress={() => toggle(tag)}
                          />
                        ))}
                      </View>
                      <Input
                        placeholder="Agregar otra (Enter)"
                        value={tagDraft}
                        onChangeText={setTagDraft}
                        onSubmitEditing={() => {
                          const t = tagDraft.trim();
                          if (t.length >= 2 && !field.value.includes(t)) toggle(t);
                          setTagDraft('');
                        }}
                        returnKeyType="done"
                      />
                    </View>
                  );
                }}
              />
              <Controller
                control={control}
                name="goodForApartment"
                render={({ field }) => (
                  <View className="gap-2">
                    <Text variant="label">¿Ideal para apartamento?</Text>
                    <View className="flex-row gap-2">
                      <Chip label="Sí" selected={field.value === true} onPress={() => field.onChange(true)} />
                      <Chip
                        label="No"
                        selected={field.value === false}
                        onPress={() => field.onChange(false)}
                      />
                      <Chip
                        label="No sé"
                        selected={field.value === null}
                        onPress={() => field.onChange(null)}
                      />
                    </View>
                  </View>
                )}
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <View className="rounded-2xl bg-secondary-light p-3">
                <Text variant="caption" className="text-secondary">
                  Esta información es declarada por ti y se mostrará como tal: no equivale a una certificación
                  veterinaria.
                </Text>
              </View>
              <FormChips control={control} name="vaccinated" label="¿Está vacunado?" options={tri} />
              {vaccinated === 'yes' ? (
                <FormChips
                  control={control}
                  name="vaccinationComplete"
                  label="¿Tiene el esquema completo?"
                  options={tri}
                />
              ) : null}
              <FormChips control={control} name="dewormed" label="¿Está desparasitado?" options={tri} />
              <FormChips control={control} name="sterilized" label="¿Está esterilizado?" options={tri} />
              <FormToggle
                control={control}
                name="hasVetDocuments"
                label="Tiene carnet o documentación veterinaria"
                description="Podrás subirla de forma privada después de publicar."
              />
              <FormInput
                control={control}
                name="medicalNotes"
                label="Condición médica conocida (opcional)"
                multiline
                placeholder="Alergias, tratamientos, cuidados especiales..."
              />
            </>
          ) : null}

          {step === 3 ? (
            <>
              {isSale ? (
                <View className="flex-row gap-3">
                  <View className="flex-[2]">
                    <FormInput
                      testID="listing-price"
                      control={control}
                      name="price"
                      label="Precio"
                      numeric
                      placeholder="0"
                    />
                  </View>
                  <View className="flex-1">
                    <FormSelect
                      control={control}
                      name="currency"
                      label="Moneda"
                      options={[
                        { value: 'DOP', label: 'RD$' },
                        { value: 'USD', label: 'US$' },
                      ]}
                    />
                  </View>
                </View>
              ) : null}
              <FormInput
                testID="listing-conditions"
                control={control}
                name="conditions"
                label={isSale ? 'Condiciones de venta (opcional)' : 'Requisitos de adopción'}
                multiline
                placeholder={
                  isSale
                    ? 'Qué incluye, garantías, kit de bienvenida...'
                    : 'Mayor de edad, visita previa, compromiso de esterilización...'
                }
              />
              <FormSelect
                testID="listing-province"
                control={control}
                name="provinceId"
                label="Provincia"
                placeholder="Elige la provincia"
                searchable
                options={(provinces.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
              />
              <FormInput
                testID="listing-city"
                control={control}
                name="city"
                label="Ciudad o sector"
                hint="Se muestra como ubicación aproximada."
              />

              <Text variant="subtitle">Entrega</Text>
              <FormToggle
                control={control}
                name="allowsDelivery"
                label="Traslado pet-friendly"
                description="Personal de confianza o transporte acondicionado. Nunca paquetería común."
              />
              <FormToggle
                control={control}
                name="allowsPickup"
                label="Recogida con cita"
                description="La persona pasa a buscarlo en un horario acordado."
              />
              <FormInput
                control={control}
                name="deliveryWindow"
                label="Horario de entregas"
                placeholder="Ej. Lun–Sáb · 10:00 AM – 5:00 PM"
              />
              {allowsDelivery || !isSale ? (
                <FormInput
                  control={control}
                  name="transferFee"
                  label={
                    isSale
                      ? 'Costo de traslado (opcional, RD$)'
                      : 'Tarifa de traslado o aporte (opcional, RD$)'
                  }
                  numeric
                  hint="Se muestra de forma transparente. Petites no procesa pagos: se coordina entre las partes."
                />
              ) : null}
              <FormInput
                control={control}
                name="contractTerms"
                label="Acuerdo de tenencia responsable"
                multiline
                hint="Quien solicite deberá aceptarlo antes de enviar su solicitud."
              />
            </>
          ) : null}
        </Animated.View>
      </ScrollView>

      <View className="gap-2 border-t border-line bg-ivory px-5 pb-6 pt-3">
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
              testID="listing-next"
              title="Continuar"
              className="flex-[2]"
              onPress={() => void next()}
            />
          ) : (
            <Button
              testID="listing-submit"
              title={submitLabel}
              className="flex-[2]"
              loading={submitting}
              onPress={() => void submit(false)}
            />
          )}
        </View>
        {allowDraft && step === steps.length - 1 ? (
          <Button
            title="Guardar como borrador"
            variant="ghost"
            disabled={submitting}
            onPress={() => void submit(true)}
          />
        ) : null}
      </View>
    </View>
  );
}
