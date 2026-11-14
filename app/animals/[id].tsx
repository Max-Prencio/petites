import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  BadgeCheck,
  ChevronLeft,
  Flag,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  PawPrint,
  Pencil,
  Share2,
  Stethoscope,
  Truck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Share, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReportModal } from '@/components/ReportModal';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ErrorState,
  Glass,
  IconButton,
  InfoRow,
  LoadingState,
  Text,
} from '@/components/ui';
import { brand, cta } from '@/constants/brand';
import {
  listingStatusLabel,
  listingTypeLabel,
  partnerTypeLabel,
  sexLabel,
  sizeLabel,
  triStateLabel,
} from '@/constants/labels';
import { colors } from '@/constants/theme';
import { useListingDetail } from '@/features/animals';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites';
import { useStartConversation } from '@/features/messaging';
import { useSessionStore } from '@/stores/sessionStore';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';
import { formatAge, formatPrice, memberSince } from '@/utils/format';

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  const listing = useListingDetail(id);
  const favorites = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const startConversation = useStartConversation();
  const [imageIndex, setImageIndex] = useState(0);
  const [reporting, setReporting] = useState(false);

  if (listing.isPending) return <LoadingState />;
  if (listing.isError) {
    return (
      <SafeAreaView className="flex-1 bg-ivory">
        <ErrorState message="Esta publicación ya no está disponible." onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  const l = listing.data;
  const a = l.animal;
  const isOwner = l.owner_id === userId;
  const isFavorite = favorites.data?.has(l.id) ?? false;
  const available = l.status === 'available';
  const title = a.name ?? a.breed?.name ?? a.category.name;
  const isAdoption = l.listing_type === 'adoption';

  const ask = () =>
    startConversation.mutate(l.id, {
      onSuccess: (conversationId) => router.push(`/messages/${conversationId}`),
      onError: (e) => toast.error(errorMessage(e)),
    });

  const share = () =>
    void Share.share({
      message: `Conoce a ${title} en ${brand.name} 🐾 ${listingTypeLabel[l.listing_type]} en ${l.city}. ${brand.slogan}.`,
    });

  return (
    <View className="flex-1 bg-ivory">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32">
        <View style={{ width, height: width }} className="bg-primary-light">
          {a.images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            >
              {a.images.map((img) => (
                <Image
                  key={img.id}
                  source={{ uri: img.url }}
                  style={{ width, height: width }}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="memory-disk"
                  priority="high"
                  accessibilityLabel={`Foto de ${title}`}
                />
              ))}
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <PawPrint size={64} color={colors.primary} />
            </View>
          )}
          <SafeAreaView
            edges={['top']}
            className="absolute left-0 right-0 top-0 flex-row justify-between px-4"
          >
            <IconButton icon={ChevronLeft} label="Volver" variant="glass" onPress={() => router.back()} />
            <View className="flex-row gap-2">
              <IconButton icon={Share2} label="Compartir" variant="glass" onPress={share} />
              {!isOwner ? (
                <IconButton
                  testID="detail-favorite"
                  icon={Heart}
                  label={isFavorite ? 'Quitar de mi lista' : cta.saveToList}
                  variant="glass"
                  color={colors.primary}
                  fill={isFavorite ? colors.primary : 'transparent'}
                  onPress={() => toggleFavorite.mutate({ listingId: l.id, isFavorite })}
                />
              ) : null}
            </View>
          </SafeAreaView>
          {a.images.length > 1 ? (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
              {a.images.map((img, i) => (
                <View
                  key={img.id}
                  className={`h-2 rounded-full ${i === imageIndex ? 'w-5 bg-white' : 'w-2 bg-white/60'}`}
                />
              ))}
            </View>
          ) : null}
        </View>

        <Animated.View
          entering={FadeInUp.duration(350)}
          className="-mt-6 gap-4 rounded-t-3xl bg-ivory px-5 pt-5"
        >
          <View className="flex-row flex-wrap gap-2">
            <Badge label={listingTypeLabel[l.listing_type]} tone={isAdoption ? 'adoption' : 'sale'} />
            {!available ? <Badge label={listingStatusLabel[l.status]} tone="warning" /> : null}
            {l.moderation_status === 'hidden' ? <Badge label="Oculta por moderación" tone="danger" /> : null}
          </View>
          <View className="gap-1">
            <Text variant="display">{title}</Text>
            <Text className="text-ink-muted">
              {[a.category.name, a.breed?.name].filter(Boolean).join(' · ')}
            </Text>
            <View className="flex-row items-center gap-1">
              <MapPin size={14} color={colors.inkMuted} />
              <Text variant="caption">
                {l.city}, {l.province?.name}
              </Text>
            </View>
          </View>
          <Text className="text-[24px] font-extrabold text-primary">
            {isAdoption ? 'Adopción responsable' : formatPrice(l.price, l.currency)}
          </Text>

          <View className="flex-row gap-2">
            {[
              ['Edad', formatAge(a.age_value, a.age_unit)],
              ['Sexo', sexLabel[a.sex]],
              ['Tamaño', sizeLabel[a.size]],
            ].map(([label, value]) => (
              <View
                key={label}
                className="flex-1 items-center rounded-2xl border border-line bg-surface py-3"
              >
                <Text variant="caption">{label}</Text>
                <Text className="font-bold">{value}</Text>
              </View>
            ))}
          </View>

          {a.personality_tags.length > 0 || a.good_for_apartment ? (
            <View className="flex-row flex-wrap gap-2">
              {a.good_for_apartment ? (
                <View className="flex-row items-center gap-1 rounded-full bg-secondary-light px-3 py-1.5">
                  <Home size={13} color={colors.secondary} />
                  <Text className="text-[12px] font-semibold text-secondary">Ideal para apartamento</Text>
                </View>
              ) : null}
              {a.personality_tags.map((tag) => (
                <View key={tag} className="rounded-full bg-primary-light px-3 py-1.5">
                  <Text className="text-[12px] font-semibold text-primary-dark">{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Card title={`Conoce a ${title}`}>
            <Text className="text-ink">{a.description}</Text>
          </Card>

          <Card>
            <View className="flex-row items-center gap-2">
              <Stethoscope size={18} color={colors.secondary} />
              <Text variant="subtitle">Salud</Text>
            </View>
            <InfoRow label="Vacunado" value={triStateLabel[a.vaccinated]} />
            {a.vaccinated === 'yes' ? (
              <InfoRow label="Esquema completo" value={triStateLabel[a.vaccination_complete]} />
            ) : null}
            <InfoRow label="Desparasitado" value={triStateLabel[a.dewormed]} />
            <InfoRow label="Esterilizado" value={triStateLabel[a.sterilized]} />
            <InfoRow
              label="Documentación veterinaria"
              value={a.has_vet_documents ? 'Disponible' : 'No indicada'}
            />
            {a.medical_notes ? (
              <View className="rounded-2xl bg-ivory p-3">
                <Text variant="caption">Condición médica declarada</Text>
                <Text>{a.medical_notes}</Text>
              </View>
            ) : null}
            <Text className="text-[11px] text-ink-faint">
              Información declarada por quien publica. No constituye una certificación veterinaria verificada.
            </Text>
          </Card>

          {l.conditions ? (
            <Card title={isAdoption ? 'Requisitos de adopción' : 'Condiciones de venta'}>
              <Text>{l.conditions}</Text>
            </Card>
          ) : null}

          <Card>
            <View className="flex-row items-center gap-2">
              <Truck size={18} color={colors.secondary} />
              <Text variant="subtitle">Llegada a tu hogar</Text>
            </View>
            {l.allows_delivery ? <Text>• Traslado pet-friendly (nunca en paquetería común)</Text> : null}
            {l.allows_pickup ? <Text>• Recogida con cita</Text> : null}
            {l.delivery_window ? <InfoRow label="Horario" value={l.delivery_window} /> : null}
            {l.transfer_fee !== null ? (
              <InfoRow
                label={isAdoption ? 'Tarifa de traslado / aporte' : 'Costo de traslado'}
                value={formatPrice(l.transfer_fee, 'DOP')}
              />
            ) : null}
            <Text className="text-[11px] text-ink-faint">
              Petites no procesa pagos: cualquier monto se coordina directamente entre las partes.
            </Text>
          </Card>

          <Pressable onPress={() => router.push(`/profile/${l.owner.id}`)} accessibilityRole="button">
            <Card>
              <View className="flex-row items-center gap-3">
                <Avatar uri={l.ownerAvatarUrl} name={l.owner.full_name} size={52} />
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <Text variant="label">{l.owner.full_name}</Text>
                    {l.owner.partner_type !== 'individual' ? (
                      <BadgeCheck size={16} color={colors.secondary} />
                    ) : null}
                  </View>
                  <Text variant="caption">{partnerTypeLabel[l.owner.partner_type]}</Text>
                  <Text variant="caption">{memberSince(l.owner.created_at)}</Text>
                </View>
                <Text className="font-semibold text-primary">Ver perfil</Text>
              </View>
            </Card>
          </Pressable>

          {!isOwner ? (
            <Pressable
              onPress={() => setReporting(true)}
              className="flex-row items-center justify-center gap-2 py-2"
              accessibilityRole="button"
            >
              <Flag size={14} color={colors.inkMuted} />
              <Text variant="caption">Reportar esta publicación</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 px-3 pb-1">
        <Glass className="rounded-[28px] px-3 pt-3">
          {isOwner ? (
            <View className="flex-row gap-3 pb-2">
              <Button
                title="Editar"
                icon={Pencil}
                variant="outline"
                className="flex-1"
                onPress={() => router.push(`/listings/edit/${l.id}`)}
              />
              <Button
                title="Solicitudes"
                variant="secondary"
                className="flex-1"
                onPress={() => router.push('/requests/received')}
              />
            </View>
          ) : (
            <View className="flex-row gap-3 pb-2">
              <Button
                testID="detail-ask"
                title={cta.ask}
                icon={MessageCircle}
                variant="outline"
                className="flex-1"
                loading={startConversation.isPending}
                onPress={ask}
              />
              <Button
                testID="detail-request"
                title={
                  available
                    ? isAdoption
                      ? cta.requestAdoption
                      : cta.requestArrival
                    : listingStatusLabel[l.status]
                }
                className="flex-[1.6]"
                disabled={!available}
                onPress={() => router.push(`/requests/new/${l.id}`)}
              />
            </View>
          )}
        </Glass>
      </SafeAreaView>
      <ReportModal
        visible={reporting}
        onClose={() => setReporting(false)}
        target={{ type: 'listing', id: l.id }}
        title="Reportar publicación"
      />
    </View>
  );
}
