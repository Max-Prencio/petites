import type { LucideIcon } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { colors } from '@/constants/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  testID?: string;
}

export function Chip({ label, selected = false, onPress, icon: Icon, testID }: ChipProps) {
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
        selected ? 'border-secondary bg-secondary' : 'border-line bg-surface'
      }`}
    >
      {Icon ? <Icon size={15} color={selected ? '#FFFFFF' : colors.secondary} /> : null}
      <Text className={`text-[13px] font-semibold ${selected ? 'text-white' : 'text-ink'}`}>{label}</Text>
    </PressableScale>
  );
}

interface ChipGroupProps<T extends string> {
  label?: string;
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
  scroll?: boolean;
}

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  scroll,
}: ChipGroupProps<T>) {
  const chips = options.map((o) => (
    <Chip key={o.value} label={o.label} selected={o.value === value} onPress={() => onChange(o.value)} />
  ));
  return (
    <View className="gap-2">
      {label ? <Text variant="label">{label}</Text> : null}
      {scroll ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {chips}
        </ScrollView>
      ) : (
        <View className="flex-row flex-wrap gap-2">{chips}</View>
      )}
      {error ? <Text className="text-[12px] text-danger">{error}</Text> : null}
    </View>
  );
}
