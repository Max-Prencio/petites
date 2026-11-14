import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AnimalCard } from '@/components/AnimalCard';
import { FiltersSheet } from '@/components/FiltersSheet';
import { TAB_BAR_CLEARANCE } from '@/components/TabBar';
import { Chip, EmptyState, ErrorState, IconButton, Input, Screen, Skeleton, Text } from '@/components/ui';
import { colors } from '@/constants/theme';
import { coverUrl, useCatalog } from '@/features/animals';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { activeFilterCount, useFiltersStore } from '@/stores/filtersStore';
import { errorMessage } from '@/utils/errors';

export default function ExploreScreen() {
  const router = useRouter();
  const filters = useFiltersStore((s) => s.filters);
  const setFilter = useFiltersStore((s) => s.setFilter);
  const reset = useFiltersStore((s) => s.reset);
  // El texto vive en el store (se conserva al volver); la consulta usa el valor con debounce.
  const debouncedSearch = useDebouncedValue(filters.search);
  const [showFilters, setShowFilters] = useState(false);
  const favorites = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const queryFilters = useMemo(() => ({ ...filters, search: debouncedSearch }), [filters, debouncedSearch]);
  const catalog = useCatalog(queryFilters);
  const items = useMemo(() => catalog.data?.pages.flat() ?? [], [catalog.data]);
  const count = activeFilterCount(filters);

  return (
    <Screen>
      <View className="gap-3 px-5 pb-2 pt-2">
        <Text variant="title">Explorar</Text>
        <View className="flex-row items-center gap-2">
          <Input
            testID="explore-search"
            containerClassName="flex-1"
            icon={Search}
            placeholder="Nombre, raza o características"
            value={filters.search}
            onChangeText={(t) => setFilter('search', t)}
            returnKeyType="search"
            autoCorrect={false}
          />
          <View>
            <IconButton
              testID="open-filters"
              icon={SlidersHorizontal}
              label="Filtros"
              onPress={() => setShowFilters(true)}
            />
            {count > 0 ? (
              <View className="absolute -right-1 -top-1 h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1">
                <Text className="text-[11px] font-bold text-white">{count}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2">
          <Chip
            label="Todas"
            selected={filters.listingType === null}
            onPress={() => setFilter('listingType', null)}
          />
          <Chip
            testID="chip-adoption"
            label="En adopción"
            selected={filters.listingType === 'adoption'}
            onPress={() => setFilter('listingType', 'adoption')}
          />
          <Chip
            label="En venta"
            selected={filters.listingType === 'sale'}
            onPress={() => setFilter('listingType', 'sale')}
          />
          {count > 0 ? <Chip label="Limpiar" icon={X} onPress={reset} /> : null}
        </View>
      </View>

      {catalog.isPending ? (
        <View className="flex-row flex-wrap px-3.5">
          {[0, 1, 2, 3].map((i) => (
            <View key={i} className="w-1/2 p-1.5">
              <Skeleton className="h-72" />
            </View>
          ))}
        </View>
      ) : catalog.isError ? (
        <ErrorState message={errorMessage(catalog.error)} onRetry={() => void catalog.refetch()} />
      ) : (
        <FlashList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: TAB_BAR_CLEARANCE }}
          renderItem={({ item, index }) => (
            <AnimalCard
              card={item}
              index={index}
              imageUrl={coverUrl(item)}
              isFavorite={favorites.data?.has(item.id)}
              onPress={() => router.push(`/animals/${item.id}`)}
              onToggleFavorite={() =>
                toggleFavorite.mutate({
                  listingId: item.id,
                  isFavorite: favorites.data?.has(item.id) ?? false,
                })
              }
            />
          )}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (catalog.hasNextPage && !catalog.isFetchingNextPage) void catalog.fetchNextPage();
          }}
          refreshing={catalog.isRefetching && !catalog.isFetchingNextPage}
          onRefresh={() => void catalog.refetch()}
          ListEmptyComponent={
            <EmptyState
              icon={SearchX}
              title="No encontramos patitas con esos filtros"
              message="Prueba ampliando la ubicación o quitando algunos filtros."
              actionLabel="Limpiar filtros"
              onAction={reset}
            />
          }
          ListFooterComponent={
            catalog.isFetchingNextPage ? <ActivityIndicator color={colors.primary} className="py-4" /> : null
          }
        />
      )}
      <FiltersSheet visible={showFilters} onClose={() => setShowFilters(false)} />
    </Screen>
  );
}
