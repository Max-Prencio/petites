import { useRouter } from 'expo-router';
import { Inbox } from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import { FollowUpCard } from '@/components/FollowUpCard';
import { RequestRow } from '@/components/RequestRow';
import { EmptyState, ErrorState, Header, LoadingState, Screen, Text } from '@/components/ui';
import { scheduleFollowUpReminder } from '@/features/notifications';
import { useFollowUps, useMyRequests } from '@/features/requests';
import { errorMessage } from '@/utils/errors';

export default function MyRequestsScreen() {
  const router = useRouter();
  const requests = useMyRequests();
  const followUps = useFollowUps();

  // Programa recordatorios locales para los seguimientos futuros.
  useEffect(() => {
    for (const f of followUps.data ?? []) {
      if (!f.answered_at)
        void scheduleFollowUpReminder(f.id, f.animalName ?? 'tu mascota', new Date(f.due_at)).catch(
          () => undefined,
        );
    }
  }, [followUps.data]);

  return (
    <Screen>
      <Header title="Mis solicitudes" />
      {requests.isPending ? (
        <LoadingState />
      ) : requests.isError ? (
        <ErrorState message={errorMessage(requests.error)} onRetry={() => void requests.refetch()} />
      ) : (
        <ScrollView contentContainerClassName="gap-3 px-5 pb-10">
          {(followUps.data ?? []).length > 0 ? (
            <View className="gap-3">
              <Text variant="subtitle">Seguimiento</Text>
              {followUps.data?.map((f) => (
                <FollowUpCard key={f.id} followUp={f} />
              ))}
            </View>
          ) : null}
          {(requests.data ?? []).length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Aún no has enviado solicitudes"
              message="Cuando encuentres a tu compañero ideal, pide su adopción desde su perfil."
              actionLabel="Explorar"
              onAction={() => router.push('/explore')}
            />
          ) : (
            <>
              <Text variant="subtitle">Solicitudes</Text>
              {requests.data?.map((r) => (
                <RequestRow
                  key={r.id}
                  item={r}
                  perspective="requester"
                  onPress={() => router.push(`/requests/${r.id}`)}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
