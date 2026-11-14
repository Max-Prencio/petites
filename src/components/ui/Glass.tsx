import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { cssInterop } from 'nativewind';
import type { ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

cssInterop(GlassView, { className: 'style' });

// Liquid Glass nativo solo en iOS 26+. En el resto se imita con translucidez y un borde de
// luz, sin desenfoque en vivo, para no penalizar el rendimiento en Android de gama media.
const nativeGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

type Tone = 'light' | 'clear';

const fallbackTone: Record<Tone, string> = {
  light: 'bg-white/80 border border-white/70',
  clear: 'bg-white/55 border border-white/60',
};

const shadow: ViewStyle = {
  shadowColor: '#1C1A17',
  shadowOpacity: 0.12,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

interface Props {
  children?: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  tone?: Tone;
  interactive?: boolean;
  elevated?: boolean;
}

export function Glass({
  children,
  className = '',
  style,
  tone = 'light',
  interactive = false,
  elevated = true,
}: Props) {
  if (nativeGlass) {
    return (
      <GlassView
        glassEffectStyle={tone === 'clear' ? 'clear' : 'regular'}
        isInteractive={interactive}
        className={`overflow-hidden ${className}`}
        style={style}
      >
        {children}
      </GlassView>
    );
  }
  return (
    // Sin overflow-hidden: en iOS recortaría la sombra.
    <View
      className={`${fallbackTone[tone]} ${className}`}
      style={[elevated ? shadow : null, style]}
    >
      {children}
    </View>
  );
}
