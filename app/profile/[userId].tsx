import { useLocalSearchParams, useRouter } from 'expo-router';
import { BadgeCheck, Flag, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AnimalCard } from '@/components/AnimalCard';
import { ReportModal } from '@/components/ReportModal';
import { Avatar, Card, EmptyState, ErrorState, Header, LoadingState, Screen, Text } from '@/components/ui';
import { partnerTypeLabel } from '@/constants/labels';
import { colors } from '@/constants/theme';
import { coverUrl } from '@/features/animals';
import { usePublicProfile } from '@/features/auth';
import { useSessionStore } from '@/stores/sessionStore';
import { errorMessage } from '@/utils/errors';
import { memberSince } from '@/utils/format';

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const me = useSessionStore((s) => s.session?.user.id ?? null);
  const profile = usePublicProfile(userId);
  const [reporting, setReporting] = useState(false);

  if (profile.isPending) return <LoadingState />;
  if (profile.isError)
    return <ErrorState message={errorMessage(profile.error)} onRetry={() => void profile.refetch()} />;
  const { profile: p, avatarUrl, provinceName, contactVerified, listings } = profile.data;

  return (
    <Screen scroll>
      <Header title="Perfil" />
      <Card className="items-center">
        <Avatar uri={avatarUrl} name={p.full_name} size={88} />
        <Text variant="title" className="text-center">
          {p.full_name}
        </Text>
        <Text variant="caption">{partnerTypeLabel[p.partner_type]}</Text>
        {p.city || provinceName ? (
          <View className="flex-row items-center gap-1">
            <MapPin size={13} color={colors.inkMuted} />
            <Text variant="caption">{[p.city, provinceName].filter(Boolean).join(', ')}</Text>
          </View>
        ) : null}
        <Text variant="caption">{memberSince(p.created_at)}</Text>
        {contactVerified ? (
          <View className="flex-row items-center gap-1 rounded-full bg-secondary-light px-3 py-1">
            <BadgeCheck size={14} color={colors.secondary} />
            <Text className="text-[12px] font-semibold text-secondary">Correo verificado</Text>
          </View>
        ) : null}
        {p.bio ? <Text className="text-center">{p.bio}</Text> : null}
      </Card>
      <Text variant="subtitle">Publicaciones activas</Text>
      {listings.length === 0 ? (
        <EmptyState title="Sin publicaciones activas" />
      ) : (
        <View className="-mx-1.5 flex-row flex-wrap">
          {listings.map((card, i) => (
            <View key={card.id} className="w-1/2">
              <AnimalCard
                card={card}
                index={i}
                imageUrl={coverUrl(card)}
                onPress={() => router.push(`/animals/${card.id}`)}
              />
            </View>
          ))}
        </View>
      )}
      {me !== userId ? (
        <Pressable
          onPress={() => setReporting(true)}
          className="flex-row items-center justify-center gap-2 py-2"
        >
          <Flag size={14} color={colors.inkMuted} />
          <Text variant="caption">Reportar usuario</Text>
        </Pressable>
      ) : null}
      <ReportModal
        visible={reporting}
        onClose={() => setReporting(false)}
        target={{ type: 'user', id: userId }}
        title="Reportar usuario"
      />
    </Screen>
  );
}
