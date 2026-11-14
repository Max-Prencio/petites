import type { LucideIcon } from 'lucide-react-native';

import { colors } from '@/constants/theme';
import { PressableScale } from './PressableScale';

interface Props {
  icon: LucideIcon;
  onPress?: () => void;
  label: string;
  variant?: 'surface' | 'ghost' | 'primary' | 'glass';
  color?: string;
  fill?: string;
  size?: number;
  testID?: string;
}

const bg = {
  surface: 'bg-surface border border-line',
  ghost: 'bg-transparent',
  primary: 'bg-primary',
  glass: 'bg-white/90',
} as const;

export function IconButton({
  icon: Icon,
  onPress,
  label,
  variant = 'surface',
  color,
  fill,
  size = 20,
  testID,
}: Props) {
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      scaleTo={0.9}
      className={`h-10 w-10 items-center justify-center rounded-full ${bg[variant]}`}
    >
      <Icon
        size={size}
        color={color ?? (variant === 'primary' ? '#FFFFFF' : colors.ink)}
        fill={fill ?? 'transparent'}
      />
    </PressableScale>
  );
}
