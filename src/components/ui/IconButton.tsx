import type { LucideIcon } from 'lucide-react-native';

import { colors } from '@/constants/theme';
import { Glass } from './Glass';
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
  surface: 'bg-surface border border-line/60',
  ghost: 'bg-transparent',
  primary: 'bg-primary',
  glass: '',
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
  const glyph = (
    <Icon
      size={size}
      color={color ?? (variant === 'primary' ? '#FFFFFF' : colors.ink)}
      fill={fill ?? 'transparent'}
    />
  );
  if (variant === 'glass') {
    // Botón flotante de vidrio (sobre fotos o contenido que se desplaza por debajo)
    return (
      <PressableScale
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={8}
        scaleTo={0.9}
      >
        <Glass interactive className="h-10 w-10 items-center justify-center rounded-full">
          {glyph}
        </Glass>
      </PressableScale>
    );
  }
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
      {glyph}
    </PressableScale>
  );
}
