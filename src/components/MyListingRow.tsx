import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FileText, MoreHorizontal, Pencil, PawPrint, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { listingStatusLabel, listingTypeLabel } from '@/constants/labels';
import { colors } from '@/constants/theme';
import { coverUrl } from '@/features/animals';
import { useDeleteListing, useSetListingStatus } from '@/features/listings';
import { toast } from '@/stores/uiStore';
import type { Enums, ListingCard } from '@/types/models';
import { errorMessage } from '@/utils/errors';
import { formatPrice } from '@/utils/format';
import { ListingStatusSheet } from './ListingStatusSheet';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { IconButton } from './ui/IconButton';
import { Modal } from './ui/Modal';
import { PressableScale } from './ui/PressableScale';
import { Text } from './ui/Text';

const statusTone: Record<
  Enums<'listing_status'>,
  'success' | 'warning' | 'neutral' | 'secondary' | 'danger'
> = {
  available: 'success',
  reserved: 'warning',
  sold: 'secondary',
  adopted: 'secondary',
  paused: 'neutral',
  draft: 'neutral',
  withdrawn: 'danger',
};

export function MyListingRow({ card }: { card: ListingCard }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [statusSheet, setStatusSheet] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const setStatus = useSetListingStatus();
  const remove = useDeleteListing();
  const image = coverUrl(card);
  const hidden = card.moderation_status === 'hidden';

  const changeStatus = (status: Enums<'listing_status'>) =>
    setStatus.mutate(
      { listingId: card.id, status },
      {
        onSuccess: () => {
          toast.success(`Estado: ${listingStatusLabel[status]}`);
          setStatusSheet(false);
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  return (
    <>
      <PressableScale
        onPress={() => router.push(`/animals/${card.id}`)}
        className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-3"
      >
        <View className="h-16 w-16 overflow-hidden rounded-2xl bg-primary-light">
          {image ? (
            <Image source={{ uri: image }} style={{ width: 64, height: 64 }} contentFit="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <PawPrint size={24} color={colors.primary} />
            </View>
          )}
        </View>
        <View className="flex-1 gap-1">
          <Text variant="label" numberOfLines={1}>
            {card.animal_name ?? card.breed_name ?? card.category_name}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {listingTypeLabel[card.listing_type]}
            {card.listing_type === 'sale' ? ` · ${formatPrice(card.price, card.currency)}` : ''}
          </Text>
          <View className="flex-row gap-1">
            <Badge label={listingStatusLabel[card.status]} tone={statusTone[card.status]} />
            {hidden ? <Badge label="Oculta por moderación" tone="danger" /> : null}
          </View>
        </View>
        <IconButton icon={MoreHorizontal} label="Opciones" variant="ghost" onPress={() => setMenu(true)} />
      </PressableScale>

      <Modal visible={menu} onClose={() => setMenu(false)} title="Gestionar publicación">
        <Button
          title="Cambiar estado"
          variant="secondary"
          onPress={() => {
            setMenu(false);
            setStatusSheet(true);
          }}
          fullWidth
        />
        <Button
          title="Editar"
          icon={Pencil}
          variant="outline"
          onPress={() => {
            setMenu(false);
            router.push(`/listings/edit/${card.id}`);
          }}
          fullWidth
        />
        <Button
          title="Documentos veterinarios"
          icon={FileText}
          variant="outline"
          onPress={() => {
            setMenu(false);
            router.push(`/listings/documents/${card.animal_id}`);
          }}
          fullWidth
        />
        <Button
          title="Eliminar"
          icon={Trash2}
          variant="ghost"
          onPress={() => {
            setMenu(false);
            setConfirmDelete(true);
          }}
          fullWidth
        />
      </Modal>

      <ListingStatusSheet
        visible={statusSheet}
        onClose={() => setStatusSheet(false)}
        listingType={card.listing_type}
        current={card.status}
        loading={setStatus.isPending}
        onSelect={changeStatus}
      />

      <ConfirmDialog
        visible={confirmDelete}
        title="¿Eliminar publicación?"
        message="Se borrarán la publicación, sus fotos y documentos. Las conversaciones asociadas también se cerrarán. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        tone="danger"
        loading={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          remove.mutate(card.id, {
            onSuccess: () => {
              toast.success('Publicación eliminada');
              setConfirmDelete(false);
            },
            onError: (e) => toast.error(errorMessage(e)),
          })
        }
      />
    </>
  );
}
