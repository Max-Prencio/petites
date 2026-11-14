import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Text } from './Text';

interface Props {
  steps: readonly string[];
  current: number;
}

export function Stepper({ steps, current }: Props) {
  const progress = useAnimatedStyle(() => ({
    width: withTiming(`${((current + 1) / steps.length) * 100}%`, { duration: 300 }),
  }));
  return (
    <View className="gap-2">
      <View className="flex-row justify-between">
        <Text variant="overline">
          Paso {current + 1} de {steps.length}
        </Text>
        <Text variant="caption">{steps[current]}</Text>
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-line">
        <Animated.View style={progress} className="h-full rounded-full bg-primary" />
      </View>
    </View>
  );
}
