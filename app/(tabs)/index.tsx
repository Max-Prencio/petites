import { useRouter } from 'expo-router';
import { Bell, ChevronRight, Heart, Search, Truck } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { fadeUp } from '@/constants/motion';
import { AnimalCard } from '@/components/AnimalCard';
import { CategoryIcon } from '@/components/CategoryIcon';
import { IconButton, PressableScale, Screen, Skeleton, Text } from '@/components/ui';
import { brand } from '@/constants/brand';
import { terminalStatuses } from '@/constants/requestStatus';
import { colors } from '@/constants/theme';
import { coverUrl, useCatalog, useCategories } from '@/features/animals';
import { useMyProfile } from '@/features/auth';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites';
import { useUnreadNotificationsCount } from '@/features/notifications';
import { useFollowUps, useMyRequests } from '@/features/requests';
import { defaultFilters, useFiltersStore } from '@/stores/filtersStore';
import type { ListingCard } from '@/types/models';

function Section({
  title,
  onSeeAll,
  cards,
}: {
  title: string;
  onSeeAll: () => void;
  cards: ListingCard[] | undefined;
}) {
  const router = useRouter();
  const favorites = useFavoriteIds();
  const toggle = useToggleFavorite();
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between px-5">
        <Text variant="subtitle">{title}</Text>
        <Pressable onPress={onSeeAll} className="flex-row items-center" accessibilityRole="link">
          <Text className="font-semibold text-primary">Ver todo</Text>
          <ChevronRight size={16} color={colors.primary} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-3.5">
        {cards === undefined
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="m-1.5 h-64 w-44" />)
          : cards.map((card, i) => (
              <View key={card.id} className="w-48">
                <AnimalCard
                  card={card}
                  index={i}
                  imageUrl={coverUrl(card)}
                  isFavorite={favorites.data?.has(card.id)}
                  onPress={() => router.push(`/animals/${card.id}`)}
                  onToggleFavorite={() =>
                    toggle.mutate({ listingId: card.id, isFavorite: favorites.data?.has(card.id) ?? false })
                  }
                />
              </View>
            ))}
        {cards?.length === 0 ? (
          <Text className="px-2 py-6 text-ink-muted">Pronto habrá nuevas patitas aquí.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const me = useMyProfile();
  const categories = useCategories();
  const setFilters = useFiltersStore((s) => s.setFilters);
  const unreadNotifications = useUnreadNotificationsCount();
  const myRequests = useMyRequests();
  const followUps = useFollowUps();

  const recentFilters = useMemo(() => ({ ...defaultFilters }), []);
  const adoptionFilters = useMemo(
    () => ({
      ...defaultFilters,
      listingType: 'adoption' as const,
      provinceId: me.data?.profile.province_id ?? null,
    }),
    [me.data?.profile.province_id],
  );
  const recent = useCatalog(recentFilters);
  const adoptions = useCatalog(adoptionFilters);

  const activeRequest = myRequests.data?.find((r) => !terminalStatuses.includes(r.status));
  const pendingFollowUp = followUps.data?.find((f) => !f.answered_at && new Date(f.due_at) <= new Date());
  const firstName = me.data?.profile.full_name.split(' ')[0] ?? '';

  const explore = (patch: Parameters<typeof setFilters>[0]) => {
    setFilters({ ...defaultFilters, ...patch });
    router.push('/explore');
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-6 pb-32">
        <View className="flex-row items-center justify-between px-5 pt-2">
          <View className="flex-1">
            <Text variant="caption">Hola, {firstName} 👋</Text>
            <Text variant="title">{brand.slogan}</Text>
          </View>
          <View className="flex-row gap-2">
            <IconButton icon={Heart} label="Mi lista" onPress={() => router.push('/profile/favorites')} />
            <View>
              <IconButton
                icon={Bell}
                label="Notificaciones"
                onPress={() => router.push('/profile/notifications')}
              />
              {unreadNotifications > 0 ? (
                <View className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              ) : null}
            </View>
          </View>
        </View>

        <PressableScale
          testID="home-search"
          onPress={() => router.push('/explore')}
          className="mx-5 h-12 flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4"
          accessibilityRole="search"
        >
          <Search size={18} color={colors.inkFaint} />
          <Text className="text-ink-faint">Busca por nombre, raza o características</Text>
        </PressableScale>

        {activeRequest ? (
          <Animated.View entering={fadeUp()} className="mx-5">
            <PressableScale
              onPress={() => router.push(`/requests/${activeRequest.id}`)}
              className="flex-row items-center gap-3 rounded-3xl bg-secondary p-4"
            >
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <Truck size={22} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-white">Seguir sus patitas</Text>
                <Text className="text-[13px] text-white/80" numberOfLines={1}>
                  {activeRequest.listing.animal.name ?? 'Tu solicitud'} · toca para ver su recorrido
                </Text>
              </View>
              <ChevronRight size={20} color="#FFFFFF" />
            </PressableScale>
          </Animated.View>
        ) : null}

        {pendingFollowUp ? (
          <PressableScale
            onPress={() => router.push('/requests')}
            className="mx-5 rounded-3xl bg-primary-light p-4"
          >
            <Text className="font-bold text-primary-dark">
              ¿Cómo está {pendingFollowUp.animalName ?? 'tu mascota'}?
            </Text>
            <Text variant="caption">Cuéntanos cómo va su adaptación. Solo toma un minuto.</Text>
          </PressableScale>
        ) : null}

        <View className="flex-row gap-3 px-5">
          <PressableScale
            testID="home-adopt"
            onPress={() => explore({ listingType: 'adoption' })}
            className="flex-1 rounded-3xl bg-secondary p-4"
          >
            <Text className="text-[17px] font-extrabold text-white">Adoptar</Text>
            <Text className="text-[12px] text-white/80">Dales un hogar</Text>
          </PressableScale>
          <PressableScale
            testID="home-buy"
            onPress={() => explore({ listingType: 'sale' })}
            className="flex-1 rounded-3xl bg-primary p-4"
          >
            <Text className="text-[17px] font-extrabold text-white">Encontrar</Text>
            <Text className="text-[12px] text-white/80">Criadores y tiendas</Text>
          </PressableScale>
        </View>

        <View className="gap-2">
          <Text variant="subtitle" className="px-5">
            Categorías
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 px-5"
          >
            {(categories.data ?? []).map((c) => (
              <PressableScale
                key={c.id}
                onPress={() => explore({ categoryId: c.id })}
                className="items-center gap-1.5"
              >
                <View className="h-16 w-16 items-center justify-center rounded-3xl border border-line bg-surface">
                  <CategoryIcon name={c.icon} size={26} color={colors.secondary} />
                </View>
                <Text className="text-[12px] font-semibold">{c.name}</Text>
              </PressableScale>
            ))}
          </ScrollView>
        </View>

        <Section
          title="Recién llegados"
          cards={recent.data?.pages[0]?.slice(0, 8)}
          onSeeAll={() => explore({})}
        />
        <Section
          title={me.data?.profile.province_id ? 'En adopción cerca de ti' : 'En adopción'}
          cards={adoptions.data?.pages[0]?.slice(0, 8)}
          onSeeAll={() => explore(adoptionFilters)}
        />
      </ScrollView>
    </Screen>
  );
}
