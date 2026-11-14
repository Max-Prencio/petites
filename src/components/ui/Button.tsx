import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/constants/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const containerClass: Record<Variant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  ghost: 'bg-transparent',
  outline: 'bg-surface border border-line',
  danger: 'bg-danger',
};

const textClass: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  ghost: 'text-secondary',
  outline: 'text-ink',
  danger: 'text-white',
};

const iconColor: Record<Variant, string> = {
  primary: '#FFFFFF',
  secondary: '#FFFFFF',
  ghost: colors.secondary,
  outline: colors.ink,
  danger: '#FFFFFF',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-4 rounded-full',
  md: 'h-12 px-5 rounded-2xl',
  lg: 'h-14 px-6 rounded-2xl',
};

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
  className?: string;
  testID?: string;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  fullWidth = false,
  className = '',
  testID,
  accessibilityHint,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`flex-row items-center justify-center ${sizeClass[size]} ${containerClass[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={iconColor[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {Icon ? <Icon size={size === 'sm' ? 16 : 19} color={iconColor[variant]} /> : null}
          <Text
            className={`font-bold ${size === 'sm' ? 'text-[13px]' : 'text-[15px]'} ${textClass[variant]}`}
          >
            {title}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}
