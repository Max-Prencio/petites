import { useRouter } from 'expo-router';
import { PlusCircle } from 'lucide-react-native';
import { FlatList } from 'react-native';

import { MyListingRow } from '@/components/MyListingRow';
import { EmptyState, ErrorState, Header, IconButton, LoadingState, Screen } from '@/components/ui';
import { useMyListings } from '@/features/listings';
import { errorMessage } from '@/utils/errors';

export default function MyListingsScreen() {
  const router = useRouter();
  const listings = useMyListings();
  return (
    <Screen>
      <Header
        title="Mis publicaciones"
        right={
          <IconButton
            icon={PlusCircle}
            label="Nueva publicación"
            onPress={() => router.push('/listings/new')}
          />
        }
      />
      {listings.isPending ? (
        <LoadingState />
      ) : listings.isError ? (
        <ErrorState message={errorMessage(listings.error)} onRetry={() => void listings.refetch()} />
      ) : (
        <FlatList
          data={listings.data}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 px-5 pb-10"
          renderItem={({ item }) => <MyListingRow card={item} />}
          refreshing={listings.isRefetching}
          onRefresh={() => void listings.refetch()}
          ListEmptyComponent={
            <EmptyState
              title="Aún no tienes publicaciones"
              message="Publica una mascota en adopción o en venta en menos de 3 minutos."
              actionLabel="Publicar"
              onAction={() => router.push('/listings/new')}
            />
          }
        />
      )}
    </Screen>
  );
}
