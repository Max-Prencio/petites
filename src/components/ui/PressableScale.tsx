import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { duration, easeOut } from '@/constants/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  scaleTo?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

// Microinteracción base: leve encogimiento al presionar, sin rebote.
export function PressableScale({ scaleTo = 0.97, style, onPressIn, onPressOut, ...props }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...props}
      style={[animatedStyle, style]}
      onPressIn={(e) => {
        scale.set(withTiming(scaleTo, { duration: duration.fast, easing: easeOut }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withTiming(1, { duration: duration.base, easing: easeOut }));
        onPressOut?.(e);
      }}
    />
  );
}
