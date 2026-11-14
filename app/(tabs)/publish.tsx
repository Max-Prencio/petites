import { useRouter } from 'expo-router';
import { ChevronRight, HeartHandshake, Inbox, Tag } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { MyListingRow } from '@/components/MyListingRow';
import { PressableScale, Screen, Skeleton, Text } from '@/components/ui';
import { terminalStatuses } from '@/constants/requestStatus';
import { colors } from '@/constants/theme';
import { useMyListings } from '@/features/listings';
import { useReceivedRequests } from '@/features/requests';

export default function PublishScreen() {
  const router = useRouter();
  const listings = useMyListings();
  const received = useReceivedRequests();
  const pending = received.data?.filter((r) => !terminalStatuses.includes(r.status)).length ?? 0;

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-5 px-5 pb-32 pt-2" showsVerticalScrollIndicator={false}>
        <View className="gap-1">
          <Text variant="title">Publicar</Text>
          <Text className="text-ink-muted">Muéstrale al mundo quién está buscando hogar.</Text>
        </View>

        <PressableScale
          testID="publish-adoption"
          onPress={() => router.push({ pathname: '/listings/new', params: { type: 'adoption' } })}
          className="flex-row items-center gap-4 rounded-3xl bg-secondary p-5"
        >
          <HeartHandshake size={32} color="#FFFFFF" />
          <View className="flex-1">
            <Text className="text-[18px] font-extrabold text-white">Dar en adopción</Text>
            <Text className="text-[13px] text-white/80">
              Sin precio, con requisitos y acuerdo responsable
            </Text>
          </View>
          <ChevronRight size={22} color="#FFFFFF" />
        </PressableScale>
        <PressableScale
          testID="publish-sale"
          onPress={() => router.push({ pathname: '/listings/new', params: { type: 'sale' } })}
          className="flex-row items-center gap-4 rounded-3xl bg-primary p-5"
        >
          <Tag size={32} color="#FFFFFF" />
          <View className="flex-1">
            <Text className="text-[18px] font-extrabold text-white">Publicar en venta</Text>
            <Text className="text-[13px] text-white/80">Criadores responsables y tiendas aliadas</Text>
          </View>
          <ChevronRight size={22} color="#FFFFFF" />
        </PressableScale>

        <PressableScale
          onPress={() => router.push('/requests/received')}
          className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-4"
        >
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-light">
            <Inbox size={22} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text variant="label">Solicitudes recibidas</Text>
            <Text variant="caption">
              {pending > 0 ? `${pending} esperando tu respuesta` : 'Aprueba, coordina y sigue cada entrega'}
            </Text>
          </View>
          {pending > 0 ? (
            <View className="h-6 min-w-[24px] items-center justify-center rounded-full bg-primary px-1.5">
              <Text className="text-[12px] font-bold text-white">{pending}</Text>
            </View>
          ) : null}
          <ChevronRight size={20} color={colors.inkFaint} />
        </PressableScale>

        <View className="flex-row items-center justify-between">
          <Text variant="subtitle">Mis publicaciones</Text>
          {(listings.data?.length ?? 0) > 3 ? (
            <Text className="font-semibold text-primary" onPress={() => router.push('/listings/mine')}>
              Ver todas
            </Text>
          ) : null}
        </View>
        {listings.isPending ? (
          <Skeleton className="h-24" />
        ) : listings.data && listings.data.length > 0 ? (
          <View className="gap-3">
            {listings.data.slice(0, 3).map((card) => (
              <MyListingRow key={card.id} card={card} />
            ))}
          </View>
        ) : (
          <Text className="text-ink-muted">
            Aún no has publicado. ¡Tu primera publicación toma menos de 3 minutos!
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}
