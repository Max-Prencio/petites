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
} from '@/components/ui';
import { partnerTypeLabel } from '@/constants/labels';
import { useAdminUsers, useSuspendUser, type AdminUser } from '@/features/administration';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { moderationReasonSchema } from '@/schemas/catalog';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';
import { memberSince } from '@/utils/format';

export default function AdminUsersScreen() {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search);
  const users = useAdminUsers(debounced);
  const suspend = useSuspendUser();
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState('');

  const apply = () => {
    if (!target) return;
    const suspending = !target.suspended_at;
    if (suspending) {
      const parsed = moderationReasonSchema.safeParse({ reason });
      if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? 'Indica el motivo');
    }
    suspend.mutate(
      { userId: target.id, suspend: suspending, reason },
      {
        onSuccess: () => {
          toast.success(suspending ? 'Cuenta suspendida' : 'Cuenta reactivada');
          setTarget(null);
          setReason('');
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  return (
    <Screen>
      <Header title="Usuarios" />
      <View className="px-5 pb-3">
        <Input icon={Search} placeholder="Buscar por nombre" value={search} onChangeText={setSearch} />
      </View>
      {users.isPending ? (
        <LoadingState />
      ) : users.isError ? (
        <ErrorState message={errorMessage(users.error)} onRetry={() => void users.refetch()} />
      ) : (
        <FlatList
          data={users.data}
          keyExtractor={(u) => u.id}
          contentContainerClassName="gap-3 px-5 pb-10"
          renderItem={({ item }) => (
            <Card>
              <View className="flex-row items-center justify-between">
                <Text variant="label">{item.full_name}</Text>
                {item.suspended_at ? <Badge label="Suspendida" tone="danger" /> : null}
              </View>
              <Text variant="caption">
                {partnerTypeLabel[item.partner_type]} · {memberSince(item.created_at)}
              </Text>
              <Text variant="caption">
                {item.listings_count} publicaciones · {item.reports_count} reportes recibidos
              </Text>
              {item.suspension_reason ? (
                <Text variant="caption">Motivo: {item.suspension_reason}</Text>
              ) : null}
              <Button
                title={item.suspended_at ? 'Reactivar' : 'Suspender'}
                size="sm"
                variant={item.suspended_at ? 'secondary' : 'danger'}
                onPress={() => setTarget(item)}
              />
            </Card>
          )}
          ListEmptyComponent={<EmptyState title="Sin resultados" />}
        />
      )}
      <Modal
        visible={target !== null}
        onClose={() => setTarget(null)}
        title={target?.suspended_at ? 'Reactivar cuenta' : 'Suspender cuenta'}
        footer={
          <Button
            title="Confirmar"
            variant={target?.suspended_at ? 'secondary' : 'danger'}
            loading={suspend.isPending}
            onPress={apply}
            fullWidth
          />
        }
      >
        <Text className="text-ink-muted">
          {target?.suspended_at
            ? 'La persona podrá volver a publicar, escribir y solicitar.'
            : 'Sus publicaciones dejarán de ser visibles y no podrá publicar, escribir ni solicitar.'}
        </Text>
        <Input label="Motivo" value={reason} onChangeText={setReason} multiline />
      </Modal>
    </Screen>
  );
}
