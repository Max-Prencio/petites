import { Image } from 'expo-image';
import { Heart, MapPin, PawPrint } from 'lucide-react-native';
import { View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { listingStatusLabel, listingTypeLabel } from '@/constants/labels';
import { colors } from '@/constants/theme';
import { tapFeedback } from '@/services/haptics';
import type { ListingCard } from '@/types/models';
import { formatAge, formatPrice } from '@/utils/format';
import { Glass } from './ui/Glass';
import { PressableScale } from './ui/PressableScale';
import { Text } from './ui/Text';

interface Props {
  card: ListingCard;
  imageUrl: string | null;
  isFavorite?: boolean;
  onPress: () => void;
  onToggleFavorite?: () => void;
  index?: number;
}

export function AnimalCard({
  card,
  imageUrl,
  isFavorite = false,
  onPress,
  onToggleFavorite,
  index = 0,
}: Props) {
  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.get() }] }));
  const title = card.animal_name ?? card.breed_name ?? card.category_name;
  const unavailable = card.status !== 'available';

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(320)}
      className="flex-1 p-1.5"
    >
      <PressableScale
        testID={`animal-card-${card.id}`}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${listingTypeLabel[card.listing_type]}, ${card.city}`}
        className="rounded-[26px] bg-surface"
        style={cardShadow}
      >
        <View className="aspect-[4/5] w-full overflow-hidden rounded-t-[26px] bg-primary-light">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={150}
              cachePolicy="memory-disk"
              recyclingKey={card.id}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <PawPrint size={40} color={colors.primary} />
            </View>
          )}
          <View className="absolute left-2 top-2 gap-1">
            <GlassPill
              label={listingTypeLabel[card.listing_type]}
              dot={card.listing_type === 'adoption' ? colors.secondary : colors.primary}
            />
            {unavailable ? <GlassPill label={listingStatusLabel[card.status]} dot={colors.warning} /> : null}
          </View>
          {onToggleFavorite ? (
            <Animated.View style={heartStyle} className="absolute right-2 top-2">
              <PressableScale
                testID={`favorite-${card.id}`}
                onPress={() => {
                  heartScale.set(withSequence(withSpring(1.3), withSpring(1)));
                  tapFeedback();
                  onToggleFavorite();
                }}
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? 'Quitar de mi lista' : 'Guardar en mi lista'}
                hitSlop={8}
              >
                <Glass interactive className="h-9 w-9 items-center justify-center rounded-full">
                  <Heart size={18} color={colors.primary} fill={isFavorite ? colors.primary : 'transparent'} />
                </Glass>
              </PressableScale>
            </Animated.View>
          ) : null}
        </View>
        <View className="gap-0.5 px-3.5 pb-3.5 pt-3">
          <Text className="text-[16px] font-bold tracking-tight text-ink" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {[card.breed_name ?? card.category_name, formatAge(card.age_value, card.age_unit)].join(' · ')}
          </Text>
          <Text
            className="mt-1 text-[15px] font-extrabold text-primary"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {card.listing_type === 'sale' ? formatPrice(card.price, card.currency) : 'Adopción responsable'}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <MapPin size={12} color={colors.inkFaint} />
            <Text className="flex-1 text-[11px] text-ink-muted" numberOfLines={1}>
              {card.city}, {card.province_name}
            </Text>
          </View>
          <Text className="text-[11px] text-ink-faint" numberOfLines={1}>
            {card.owner_name}
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const cardShadow = {
  shadowColor: '#1C1A17',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

// Etiqueta de vidrio sobre la foto: punto de color + texto (mantiene el código de color de marca).
function GlassPill({ label, dot }: { label: string; dot: string }) {
  return (
    <Glass tone="light" elevated={false} className="flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1">
      <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
      <Text className="text-[11px] font-bold text-ink">{label}</Text>
    </Glass>
  );
}
