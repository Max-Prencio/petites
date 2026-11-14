import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { FlatList, View } from 'react-native';

import { EmptyState, ErrorState, Header, LoadingState, PressableScale, Screen, Text } from '@/components/ui';
import { notificationHref, useMarkNotificationsRead, useNotifications } from '@/features/notifications';
import { errorMessage } from '@/utils/errors';
import { formatRelative } from '@/utils/format';

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotifications();
  const markRead = useMarkNotificationsRead();
  const hasUnread = notifications.data?.some((n) => !n.read_at) ?? false;

  return (
    <Screen>
      <Header
        title="Notificaciones"
        right={
          hasUnread ? (
            <Text className="font-semibold text-primary" onPress={() => markRead.mutate(undefined)}>
              Marcar leídas
            </Text>
          ) : null
        }
      />
      {notifications.isPending ? (
        <LoadingState />
      ) : notifications.isError ? (
        <ErrorState
          message={errorMessage(notifications.error)}
          onRetry={() => void notifications.refetch()}
        />
      ) : (
        <FlatList
          data={notifications.data}
          keyExtractor={(n) => n.id}
          contentContainerClassName="gap-2 px-5 pb-10"
          refreshing={notifications.isRefetching}
          onRefresh={() => void notifications.refetch()}
          renderItem={({ item }) => (
            <PressableScale
              onPress={() => {
                if (!item.read_at) markRead.mutate([item.id]);
                const href = notificationHref(item.data);
                if (href) router.push(href);
              }}
              className={`flex-row gap-3 rounded-3xl border p-4 ${item.read_at ? 'border-line bg-surface' : 'border-primary-light bg-primary-light/60'}`}
            >
              {!item.read_at ? <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
              <View className="flex-1 gap-0.5">
                <Text variant="label">{item.title}</Text>
                <Text variant="caption">{item.body}</Text>
                <Text className="text-[11px] text-ink-faint">{formatRelative(item.created_at)}</Text>
              </View>
            </PressableScale>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={Bell}
              title="Todo al día"
              message="Aquí verás mensajes nuevos, cambios en tus solicitudes y en tu lista."
            />
          }
        />
      )}
    </Screen>
  );
}
