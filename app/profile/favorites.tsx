import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { FlatList, View } from 'react-native';

import { AnimalCard } from '@/components/AnimalCard';
import { Button, EmptyState, ErrorState, Header, LoadingState, Screen, Text } from '@/components/ui';
import { coverUrl } from '@/features/animals';
import { useFavorites, useToggleFavorite } from '@/features/favorites';
import { errorMessage } from '@/utils/errors';

export default function FavoritesScreen() {
  const router = useRouter();
  const favorites = useFavorites();
  const toggle = useToggleFavorite();

  return (
    <Screen>
      <Header title="Mi lista" subtitle="Tus flechazos guardados" />
      {favorites.isPending ? (
        <LoadingState />
      ) : favorites.isError ? (
        <ErrorState message={errorMessage(favorites.error)} onRetry={() => void favorites.refetch()} />
      ) : (
        <FlatList
          data={favorites.data}
          numColumns={2}
          keyExtractor={(f) => f.listingId}
          contentContainerClassName="px-3.5 pb-10"
          refreshing={favorites.isRefetching}
          onRefresh={() => void favorites.refetch()}
          renderItem={({ item, index }) =>
            item.card ? (
              <View className="w-1/2">
                <AnimalCard
                  card={item.card}
                  index={index}
                  imageUrl={coverUrl(item.card)}
                  isFavorite
                  onPress={() => router.push(`/animals/${item.listingId}`)}
                  onToggleFavorite={() => toggle.mutate({ listingId: item.listingId, isFavorite: true })}
                />
              </View>
            ) : (
              <View className="w-1/2 p-1.5">
                <View className="aspect-[4/5] items-center justify-center gap-2 rounded-3xl border border-dashed border-line bg-surface p-3">
                  <Text className="text-center font-semibold">Ya no está disponible</Text>
                  <Button
                    title="Quitar"
                    size="sm"
                    variant="outline"
                    onPress={() => toggle.mutate({ listingId: item.listingId, isFavorite: true })}
                  />
                </View>
              </View>
            )
          }
          ListEmptyComponent={
            <EmptyState
              icon={Heart}
              title="Tu lista está vacía"
              message="Toca el corazón en una mascota para guardarla aquí."
              actionLabel="Explorar"
              onAction={() => router.push('/explore')}
            />
          }
        />
      )}
    </Screen>
  );
}
