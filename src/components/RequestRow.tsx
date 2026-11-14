import { Image } from 'expo-image';
import { ChevronRight, PawPrint } from 'lucide-react-native';
import { View } from 'react-native';

import { requestStatusCopy, terminalStatuses } from '@/constants/requestStatus';
import { colors } from '@/constants/theme';
import type { RequestListItem } from '@/features/requests';
import { formatRelative } from '@/utils/format';
import { Badge } from './ui/Badge';
import { PressableScale } from './ui/PressableScale';
import { Text } from './ui/Text';

interface Props {
  item: RequestListItem;
  perspective: 'requester' | 'owner';
  onPress: () => void;
}

export function RequestRow({ item, perspective, onPress }: Props) {
  const active = !terminalStatuses.includes(item.status);
  const who = perspective === 'owner' ? item.requester.full_name : item.owner.full_name;
  return (
    <PressableScale
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-3xl border border-line bg-surface p-3"
    >
      <View className="h-14 w-14 overflow-hidden rounded-2xl bg-primary-light">
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={{ width: 56, height: 56 }} contentFit="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <PawPrint size={22} color={colors.primary} />
          </View>
        )}
      </View>
      <View className="flex-1 gap-1">
        <Text variant="label" numberOfLines={1}>
          {item.listing.animal.name ?? 'Mascota'} · {who}
        </Text>
        <Badge
          label={requestStatusCopy[item.status].label}
          tone={
            item.status === 'delivered'
              ? 'success'
              : item.status === 'rejected' || item.status === 'cancelled'
                ? 'danger'
                : 'primary'
          }
        />
        <Text className="text-[11px] text-ink-faint">Actualizada {formatRelative(item.updated_at)}</Text>
      </View>
      {active ? <View className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
      <ChevronRight size={18} color={colors.inkFaint} />
    </PressableScale>
  );
}
