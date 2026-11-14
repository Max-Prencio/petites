import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageCircle, PartyPopper, PawPrint, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { Share, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { duration, fadeUp } from '@/constants/motion';
import { RequestTimeline } from '@/components/RequestTimeline';
import {
  Avatar,
  Button,
  Card,
  ErrorState,
  Header,
  InfoRow,
  Input,
  LoadingState,
  Modal,
  Screen,
  Text,
} from '@/components/ui';
import { brand } from '@/constants/brand';
import { deliveryMethodLabel, housingTypeLabel } from '@/constants/labels';
import { requestStatusCopy, type RequestStatus } from '@/constants/requestStatus';
import { colors } from '@/constants/theme';
import { useStartConversation } from '@/features/messaging';
import { useRequest, useUpdateRequestStatus } from '@/features/requests';
import { useSessionStore } from '@/stores/sessionStore';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';
import { formatDate, formatPrice } from '@/utils/format';
import { actionsFor } from '@/utils/requestFlow';

const needsNote: RequestStatus[] = ['rejected', 'videocall_requested'];

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  const { detail, events } = useRequest(id);
  const update = useUpdateRequestStatus(id);
  const startConversation = useStartConversation();
  const [pending, setPending] = useState<RequestStatus | null>(null);
  const [note, setNote] = useState('');

  if (detail.isPending) return <LoadingState />;
  if (detail.isError)
    return <ErrorState message={errorMessage(detail.error)} onRetry={() => void detail.refetch()} />;

  const r = detail.data;
  const isOwner = r.owner_id === userId;
  const actor = isOwner ? 'owner' : 'requester';
  const actions = actionsFor(r.status, actor, r.delivery_method);
  const animalName = r.listing.animal.name ?? 'tu mascota';
  const counterpart = isOwner
    ? { name: r.requester.full_name, avatar: r.requesterAvatarUrl, role: 'Solicitante' }
    : { name: r.owner.full_name, avatar: r.ownerAvatarUrl, role: 'Cuidador' };

  const runAction = (status: RequestStatus, withNote?: string) =>
    update.mutate(
      { status, note: withNote },
      {
        onSuccess: () => {
          toast.success(requestStatusCopy[status].label);
          setPending(null);
          setNote('');
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  const openChat = () => {
    if (r.conversation_id) {
      router.push(`/messages/${r.conversation_id}`);
      return;
    }
    startConversation.mutate(r.listing_id, {
      onSuccess: (conversationId) => router.push(`/messages/${conversationId}`),
      onError: (e) => toast.error(errorMessage(e)),
    });
  };

  return (
    <Screen scroll>
      <Header title={isOwner ? 'Solicitud recibida' : 'Seguir sus patitas'} subtitle={animalName} />

      <View className="flex-row items-center gap-3">
        <View className="h-16 w-16 overflow-hidden rounded-2xl bg-primary-light">
          {r.coverUrl ? (
            <Image source={{ uri: r.coverUrl }} style={{ width: 64, height: 64 }} contentFit="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <PawPrint size={26} color={colors.primary} />
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text variant="subtitle">{animalName}</Text>
          <Text variant="caption">{requestStatusCopy[r.status].message}</Text>
        </View>
      </View>

      {r.status === 'delivered' ? (
        <Animated.View
          entering={fadeUp(0, duration.slow)}
          className="items-center gap-2 rounded-3xl bg-secondary p-5"
        >
          <PartyPopper size={36} color="#FFFFFF" />
          <Text className="text-center text-[18px] font-extrabold text-white">¡Llegó a casa!</Text>
          <Text className="text-center text-white/80">Hoy comienza su nueva historia juntos.</Text>
          {!isOwner ? (
            <Button
              title="Compartir la experiencia"
              icon={Share2}
              variant="outline"
              size="sm"
              onPress={() =>
                void Share.share({
                  message: `¡${animalName} llegó a casa! 🐾 Gracias, ${brand.name}: ${brand.slogan}.`,
                })
              }
            />
          ) : null}
        </Animated.View>
      ) : null}

      <Card title="Recorrido">
        <RequestTimeline status={r.status} method={r.delivery_method} events={events.data ?? []} />
        {r.owner_note && (r.status === 'rejected' || r.status === 'videocall_requested') ? (
          <View className="rounded-2xl bg-ivory p-3">
            <Text variant="caption">Nota del cuidador</Text>
            <Text>{r.owner_note}</Text>
          </View>
        ) : null}
      </Card>

      <Card>
        <View className="flex-row items-center gap-3">
          <Avatar uri={counterpart.avatar} name={counterpart.name} size={44} />
          <View className="flex-1">
            <Text variant="label">{counterpart.name}</Text>
            <Text variant="caption">{counterpart.role}</Text>
          </View>
          <Button
            title="Chat"
            icon={MessageCircle}
            size="sm"
            variant="secondary"
            loading={startConversation.isPending}
            onPress={openChat}
          />
        </View>
      </Card>

      <Card title={isOwner ? 'Ficha del hogar' : 'Tu solicitud'}>
        <InfoRow label="Vivienda" value={housingTypeLabel[r.housing_type]} />
        <InfoRow label="Patio / exterior" value={r.has_yard ? 'Sí' : 'No'} />
        {r.other_pets ? <InfoRow label="Otras mascotas" value={r.other_pets} /> : null}
        {r.household ? <InfoRow label="Convive con" value={r.household} /> : null}
        <View className="gap-1 pt-1">
          <Text variant="caption">Experiencia</Text>
          <Text>{r.experience}</Text>
        </View>
        <View className="gap-1">
          <Text variant="caption">Compromiso</Text>
          <Text>{r.commitment}</Text>
        </View>
        <InfoRow label="Llegada" value={deliveryMethodLabel[r.delivery_method]} />
        {r.preferred_date ? <InfoRow label="Fecha preferida" value={formatDate(r.preferred_date)} /> : null}
        {r.preferred_window ? <InfoRow label="Franja" value={r.preferred_window} /> : null}
        {r.delivery_address ? <InfoRow label="Dirección" value={r.delivery_address} /> : null}
        {r.price_snapshot !== null ? (
          <InfoRow label="Precio acordado" value={formatPrice(r.price_snapshot, r.currency_snapshot)} />
        ) : null}
        {r.transfer_fee !== null ? (
          <InfoRow label="Tarifa de traslado" value={formatPrice(r.transfer_fee, 'DOP')} />
        ) : null}
        <InfoRow label="Acuerdo firmado" value={formatDate(r.contract_accepted_at)} />
      </Card>

      {actions.length > 0 ? (
        <View className="gap-2">
          {actions.map((action) => (
            <Button
              key={action.status}
              testID={`request-action-${action.status}`}
              title={action.label}
              variant={action.tone === 'danger' ? 'ghost' : action.tone}
              loading={update.isPending && pending === null}
              onPress={() =>
                needsNote.includes(action.status) || action.status === 'cancelled'
                  ? setPending(action.status)
                  : runAction(action.status)
              }
              fullWidth
            />
          ))}
        </View>
      ) : null}

      <Modal
        visible={pending !== null}
        onClose={() => setPending(null)}
        title={pending ? requestStatusCopy[pending].label : ''}
        footer={
          <Button
            title="Confirmar"
            variant={pending === 'rejected' || pending === 'cancelled' ? 'danger' : 'primary'}
            loading={update.isPending}
            onPress={() => pending && runAction(pending, note)}
            fullWidth
          />
        }
      >
        <Text className="text-ink-muted">
          {pending === 'rejected'
            ? 'Cuéntale con amabilidad por qué esta vez no fue posible (opcional).'
            : pending === 'videocall_requested'
              ? 'Propón día y hora para conocerse por videollamada. Luego coordínenla por el chat.'
              : '¿Seguro que quieres cancelar tu solicitud?'}
        </Text>
        {pending !== 'cancelled' ? (
          <Input value={note} onChangeText={setNote} multiline placeholder="Escribe una nota" />
        ) : null}
      </Modal>
    </Screen>
  );
}
