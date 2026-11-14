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
import type { ListingCard } from '@/types/models';
import { formatAge, formatPrice } from '@/utils/format';
import { Badge } from './ui/Badge';
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
        className="overflow-hidden rounded-3xl border border-line bg-surface"
      >
        <View className="aspect-[4/5] w-full bg-primary-light">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
              recyclingKey={card.id}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <PawPrint size={40} color={colors.primary} />
            </View>
          )}
          <View className="absolute left-2 top-2 gap-1">
            <Badge
              label={listingTypeLabel[card.listing_type]}
              tone={card.listing_type === 'adoption' ? 'adoption' : 'sale'}
            />
            {unavailable ? <Badge label={listingStatusLabel[card.status]} tone="warning" /> : null}
          </View>
          {onToggleFavorite ? (
            <Animated.View style={heartStyle} className="absolute right-2 top-2">
              <PressableScale
                testID={`favorite-${card.id}`}
                onPress={() => {
                  heartScale.set(withSequence(withSpring(1.3), withSpring(1)));
                  onToggleFavorite();
                }}
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? 'Quitar de mi lista' : 'Guardar en mi lista'}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/90"
              >
                <Heart size={18} color={colors.primary} fill={isFavorite ? colors.primary : 'transparent'} />
              </PressableScale>
            </Animated.View>
          ) : null}
        </View>
        <View className="gap-0.5 p-3">
          <Text variant="label" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {[card.breed_name ?? card.category_name, formatAge(card.age_value, card.age_unit)].join(' · ')}
          </Text>
          <Text className="mt-1 text-[15px] font-extrabold text-primary">
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
