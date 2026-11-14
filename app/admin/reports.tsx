import { useRouter } from 'expo-router';
import { Flag } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Header,
  Input,
  LoadingState,
  Modal,
  Screen,
  Text,
} from '@/components/ui';
import { reportReasonLabel, reportStatusLabel } from '@/constants/labels';
import {
  useAdminReports,
  useCloseConversation,
  useModerateListing,
  useReportedConversation,
  useResolveReport,
  useSuspendUser,
  type AdminReport,
} from '@/features/administration';
import { toast } from '@/stores/uiStore';
import type { Enums } from '@/types/models';
import { errorMessage } from '@/utils/errors';
import { formatDateTime, formatRelative } from '@/utils/format';

const filters: (Enums<'report_status'> | 'all')[] = ['open', 'reviewing', 'resolved', 'dismissed', 'all'];

export default function AdminReportsScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<Enums<'report_status'> | 'all'>('open');
  const reports = useAdminReports(status);
  const [selected, setSelected] = useState<AdminReport | null>(null);
  const [note, setNote] = useState('');
  const [viewChat, setViewChat] = useState<string | null>(null);
  const resolve = useResolveReport();
  const moderate = useModerateListing();
  const suspend = useSuspendUser();
  const closeConversation = useCloseConversation();
  const chat = useReportedConversation(viewChat);

  const onError = (e: unknown) => toast.error(errorMessage(e));
  const finish = (s: Enums<'report_status'>) =>
    selected &&
    resolve.mutate(
      { id: selected.id, status: s, note },
      {
        onSuccess: () => {
          toast.success(`Reporte ${reportStatusLabel[s].toLowerCase()}`);
          setSelected(null);
          setNote('');
        },
        onError,
      },
    );

  return (
    <Screen>
      <Header title="Reportes" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-5 pb-3"
        className="flex-grow-0"
      >
        {filters.map((f) => (
          <Chip
            key={f}
            label={f === 'all' ? 'Todos' : reportStatusLabel[f]}
            selected={status === f}
            onPress={() => setStatus(f)}
          />
        ))}
      </ScrollView>
      {reports.isPending ? (
        <LoadingState />
      ) : reports.isError ? (
        <ErrorState message={errorMessage(reports.error)} onRetry={() => void reports.refetch()} />
      ) : (
        <FlatList
          data={reports.data}
          keyExtractor={(r) => r.id}
          contentContainerClassName="gap-3 px-5 pb-10"
          refreshing={reports.isRefetching}
          onRefresh={() => void reports.refetch()}
          renderItem={({ item }) => (
            <Card>
              <View className="flex-row items-center justify-between">
                <Badge label={reportReasonLabel[item.reason]} tone="danger" />
                <Text className="text-[11px] text-ink-faint">{formatRelative(item.created_at)}</Text>
              </View>
              <Text variant="label">
                {item.target_type === 'listing'
                  ? `Publicación: ${item.listing?.animal.name ?? 'sin nombre'}`
                  : item.target_type === 'user'
                    ? `Usuario: ${item.reported_user?.full_name ?? ''}`
                    : 'Conversación'}
              </Text>
              {item.details ? <Text className="text-ink-muted">{item.details}</Text> : null}
              <Text variant="caption">Reportado por {item.reporter.full_name}</Text>
              <View className="flex-row items-center justify-between">
                <Badge
                  label={reportStatusLabel[item.status]}
                  tone={item.status === 'open' ? 'warning' : 'neutral'}
                />
                <Button title="Gestionar" size="sm" variant="secondary" onPress={() => setSelected(item)} />
              </View>
            </Card>
          )}
          ListEmptyComponent={<EmptyState icon={Flag} title="Sin reportes en esta vista" />}
        />
      )}

      <Modal visible={selected !== null} onClose={() => setSelected(null)} title="Gestionar reporte">
        {selected ? (
          <>
            <Text>{reportReasonLabel[selected.reason]}</Text>
            {selected.resolution_note ? (
              <Text variant="caption">Nota previa: {selected.resolution_note}</Text>
            ) : null}
            {selected.listing ? (
              <View className="gap-2">
                <Button
                  title="Ver publicación"
                  variant="outline"
                  onPress={() => router.push(`/animals/${selected.listing?.id ?? ''}`)}
                  fullWidth
                />
                <Button
                  title={
                    selected.listing.moderation_status === 'hidden'
                      ? 'Restaurar publicación'
                      : 'Ocultar publicación'
                  }
                  variant={selected.listing.moderation_status === 'hidden' ? 'secondary' : 'danger'}
                  loading={moderate.isPending}
                  onPress={() =>
                    selected.listing &&
                    moderate.mutate(
                      {
                        listingId: selected.listing.id,
                        status: selected.listing.moderation_status === 'hidden' ? 'visible' : 'hidden',
                        reason: note || reportReasonLabel[selected.reason],
                      },
                      { onSuccess: () => toast.success('Moderación aplicada'), onError },
                    )
                  }
                  fullWidth
                />
              </View>
            ) : null}
            {selected.reported_user ? (
              <Button
                title={selected.reported_user.suspended_at ? 'Reactivar usuario' : 'Suspender usuario'}
                variant={selected.reported_user.suspended_at ? 'secondary' : 'danger'}
                loading={suspend.isPending}
                onPress={() =>
                  selected.reported_user &&
                  suspend.mutate(
                    {
                      userId: selected.reported_user.id,
                      suspend: !selected.reported_user.suspended_at,
                      reason: note || reportReasonLabel[selected.reason],
                    },
                    { onSuccess: () => toast.success('Cuenta actualizada'), onError },
                  )
                }
                fullWidth
              />
            ) : null}
            {selected.conversation_id ? (
              <View className="gap-2">
                <Button
                  title="Revisar mensajes (queda auditado)"
                  variant="outline"
                  onPress={() => setViewChat(selected.id)}
                  fullWidth
                />
                <Button
                  title="Cerrar conversación"
                  variant="danger"
                  loading={closeConversation.isPending}
                  onPress={() =>
                    selected.conversation_id &&
                    closeConversation.mutate(
                      {
                        conversationId: selected.conversation_id,
                        reason: note || reportReasonLabel[selected.reason],
                      },
                      { onSuccess: () => toast.success('Conversación cerrada'), onError },
                    )
                  }
                  fullWidth
                />
              </View>
            ) : null}
            <Input
              label="Nota de resolución"
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="Qué se hizo y por qué"
            />
            <View className="flex-row gap-2">
              <Button
                title="En revisión"
                variant="outline"
                className="flex-1"
                onPress={() => finish('reviewing')}
              />
              <Button
                title="Descartar"
                variant="outline"
                className="flex-1"
                onPress={() => finish('dismissed')}
              />
            </View>
            <Button
              title="Marcar resuelto"
              loading={resolve.isPending}
              onPress={() => finish('resolved')}
              fullWidth
            />
          </>
        ) : null}
      </Modal>

      <Modal visible={viewChat !== null} onClose={() => setViewChat(null)} title="Conversación reportada">
        {chat.isPending ? (
          <LoadingState />
        ) : chat.isError ? (
          <Text className="text-danger">{errorMessage(chat.error)}</Text>
        ) : (
          (chat.data ?? []).map((m) => (
            <View key={m.id} className="rounded-2xl bg-surface p-3">
              <Text variant="label">{m.sender_name}</Text>
              <Text>{m.content}</Text>
              <Text className="text-[11px] text-ink-faint">{formatDateTime(m.created_at)}</Text>
            </View>
          ))
        )}
      </Modal>
    </Screen>
  );
}
