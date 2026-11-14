import { History } from 'lucide-react-native';
import { FlatList } from 'react-native';

import { Card, EmptyState, ErrorState, Header, LoadingState, Screen, Text } from '@/components/ui';
import { useAuditLog } from '@/features/administration';
import { errorMessage } from '@/utils/errors';
import { formatDateTime } from '@/utils/format';

const actionLabel: Record<string, string> = {
  listing_moderation: 'Moderó una publicación',
  user_suspend: 'Suspendió una cuenta',
  user_unsuspend: 'Reactivó una cuenta',
  report_open: 'Reabrió un reporte',
  report_reviewing: 'Puso un reporte en revisión',
  report_resolved: 'Resolvió un reporte',
  report_dismissed: 'Descartó un reporte',
  conversation_read: 'Revisó una conversación reportada',
  conversation_close: 'Cerró una conversación',
  insert: 'Creó un registro de catálogo',
  update: 'Actualizó el catálogo',
};

export default function AdminAuditScreen() {
  const log = useAuditLog();
  return (
    <Screen>
      <Header title="Auditoría" />
      {log.isPending ? (
        <LoadingState />
      ) : log.isError ? (
        <ErrorState message={errorMessage(log.error)} onRetry={() => void log.refetch()} />
      ) : (
        <FlatList
          data={log.data}
          keyExtractor={(e) => String(e.id)}
          contentContainerClassName="gap-2 px-5 pb-10"
          refreshing={log.isRefetching}
          onRefresh={() => void log.refetch()}
          renderItem={({ item }) => (
            <Card>
              <Text variant="label">{actionLabel[item.action] ?? item.action}</Text>
              <Text variant="caption">
                {item.admin?.full_name ?? 'Sistema'} · {item.target_table} · {formatDateTime(item.created_at)}
              </Text>
              {item.target_id ? <Text className="text-[11px] text-ink-faint">{item.target_id}</Text> : null}
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon={History} title="Sin acciones registradas" />}
        />
      )}
    </Screen>
  );
}
