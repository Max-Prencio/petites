import { useRouter } from 'expo-router';
import { Inbox } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { RequestRow } from '@/components/RequestRow';
import { Chip, EmptyState, ErrorState, Header, LoadingState, Screen } from '@/components/ui';
import { terminalStatuses } from '@/constants/requestStatus';
import { useReceivedRequests } from '@/features/requests';
import { errorMessage } from '@/utils/errors';

export default function ReceivedRequestsScreen() {
  const router = useRouter();
  const requests = useReceivedRequests();
  const [tab, setTab] = useState<'active' | 'closed'>('active');
  const items = useMemo(
    () =>
      (requests.data ?? []).filter((r) =>
        tab === 'active' ? !terminalStatuses.includes(r.status) : terminalStatuses.includes(r.status),
      ),
    [requests.data, tab],
  );

  return (
    <Screen>
      <Header title="Solicitudes recibidas" />
      <View className="flex-row gap-2 px-5 pb-3">
        <Chip label="Activas" selected={tab === 'active'} onPress={() => setTab('active')} />
        <Chip label="Cerradas" selected={tab === 'closed'} onPress={() => setTab('closed')} />
      </View>
      {requests.isPending ? (
        <LoadingState />
      ) : requests.isError ? (
        <ErrorState message={errorMessage(requests.error)} onRetry={() => void requests.refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(r) => r.id}
          contentContainerClassName="gap-3 px-5 pb-10"
          refreshing={requests.isRefetching}
          onRefresh={() => void requests.refetch()}
          renderItem={({ item }) => (
            <RequestRow item={item} perspective="owner" onPress={() => router.push(`/requests/${item.id}`)} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={Inbox}
              title={tab === 'active' ? 'Sin solicitudes activas' : 'Sin solicitudes cerradas'}
              message="Aquí verás las fichas de hogar de quienes quieren a tus mascotas."
            />
          }
        />
      )}
    </Screen>
  );
}
