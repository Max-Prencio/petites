import { View } from 'react-native';

import { listingStatusLabel } from '@/constants/labels';
import type { Enums } from '@/types/models';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Text } from './ui/Text';

interface Props {
  visible: boolean;
  onClose: () => void;
  listingType: Enums<'listing_type'>;
  current: Enums<'listing_status'>;
  loading?: boolean;
  onSelect: (status: Enums<'listing_status'>) => void;
}

const hints: Partial<Record<Enums<'listing_status'>, string>> = {
  available: 'Visible en el catálogo y abierta a solicitudes.',
  reserved: 'Visible pero marcada como reservada.',
  paused: 'Oculta temporalmente; puedes reactivarla cuando quieras.',
  sold: 'Cierra la publicación: ya encontró hogar.',
  adopted: 'Cierra la publicación: fue adoptada.',
  withdrawn: 'La retira del catálogo de forma definitiva.',
};

export function ListingStatusSheet({ visible, onClose, listingType, current, loading, onSelect }: Props) {
  const options: Enums<'listing_status'>[] = [
    'available',
    'reserved',
    'paused',
    listingType === 'sale' ? 'sold' : 'adopted',
    'withdrawn',
  ];
  return (
    <Modal visible={visible} onClose={onClose} title="Estado de la publicación">
      {options.map((status) => (
        <View key={status} className="gap-1">
          <Button
            title={listingStatusLabel[status]}
            variant={status === current ? 'secondary' : 'outline'}
            disabled={status === current}
            loading={loading}
            onPress={() => onSelect(status)}
            fullWidth
          />
          <Text variant="caption" className="px-1">
            {hints[status]}
          </Text>
        </View>
      ))}
    </Modal>
  );
}
