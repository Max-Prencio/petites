import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  scaleTo?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

// Microinteracción base: leve encogimiento al presionar.
export function PressableScale({ scaleTo = 0.97, style, onPressIn, onPressOut, ...props }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...props}
      style={[animatedStyle, style]}
      onPressIn={(e) => {
        scale.set(withSpring(scaleTo, { damping: 18, stiffness: 300 }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, { damping: 14, stiffness: 260 }));
        onPressOut?.(e);
      }}
    />
  );
}
