import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Header,
  Input,
  LoadingState,
  Modal,
  Screen,
  Text,
  Toggle,
} from '@/components/ui';
import { listingStatusLabel, listingTypeLabel } from '@/constants/labels';
import { useAdminListings, useModerateListing } from '@/features/administration';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { moderationReasonSchema } from '@/schemas/catalog';
import { toast } from '@/stores/uiStore';
import type { ListingCard } from '@/types/models';
import { errorMessage } from '@/utils/errors';

export default function AdminListingsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [onlyHidden, setOnlyHidden] = useState(false);
  const debounced = useDebouncedValue(search);
  const listings = useAdminListings(debounced, onlyHidden);
  const moderate = useModerateListing();
  const [target, setTarget] = useState<ListingCard | null>(null);
  const [reason, setReason] = useState('');

  const apply = () => {
    if (!target) return;
    const hiding = target.moderation_status === 'visible';
    if (hiding) {
      const parsed = moderationReasonSchema.safeParse({ reason });
      if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? 'Indica el motivo');
    }
    moderate.mutate(
      { listingId: target.id, status: hiding ? 'hidden' : 'visible', reason },
      {
        onSuccess: () => {
          toast.success(hiding ? 'Publicación ocultada' : 'Publicación restaurada');
          setTarget(null);
          setReason('');
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <Screen>
      <Header title="Publicaciones" />
      <View className="gap-3 px-5 pb-3">
        <Input
          icon={Search}
          placeholder="Animal, raza o publicador"
          value={search}
          onChangeText={setSearch}
        />
        <Toggle label="Solo ocultas" value={onlyHidden} onChange={setOnlyHidden} />
      </View>
      {listings.isPending ? (
        <LoadingState />
      ) : listings.isError ? (
        <ErrorState message={errorMessage(listings.error)} onRetry={() => void listings.refetch()} />
      ) : (
        <FlatList
          data={listings.data}
          keyExtractor={(l) => l.id}
          contentContainerClassName="gap-3 px-5 pb-10"
          renderItem={({ item }) => (
            <Card>
              <Text variant="label">{item.animal_name ?? item.breed_name ?? item.category_name}</Text>
              <Text variant="caption">
                {listingTypeLabel[item.listing_type]} · {item.owner_name} · {item.city}
              </Text>
              <View className="flex-row gap-1">
                <Badge label={listingStatusLabel[item.status]} />
                {item.moderation_status === 'hidden' ? <Badge label="Oculta" tone="danger" /> : null}
              </View>
              <View className="flex-row gap-2">
                <Button
                  title="Ver"
                  size="sm"
                  variant="outline"
                  onPress={() => router.push(`/animals/${item.id}`)}
                />
                <Button
                  title={item.moderation_status === 'hidden' ? 'Restaurar' : 'Ocultar'}
                  size="sm"
                  variant={item.moderation_status === 'hidden' ? 'secondary' : 'danger'}
                  onPress={() => setTarget(item)}
                />
              </View>
            </Card>
          )}
          ListEmptyComponent={<EmptyState title="Sin publicaciones" />}
        />
      )}
      <Modal
        visible={target !== null}
        onClose={() => setTarget(null)}
        title={target?.moderation_status === 'hidden' ? 'Restaurar publicación' : 'Ocultar publicación'}
        footer={<Button title="Confirmar" loading={moderate.isPending} onPress={apply} fullWidth />}
      >
        <Text className="text-ink-muted">
          La acción queda registrada en la auditoría y se notifica al publicador.
        </Text>
        <Input label="Motivo" value={reason} onChangeText={setReason} multiline />
      </Modal>
    </Screen>
  );
}
