import type { LucideIcon } from 'lucide-react-native';
import { AlertCircle, PawPrint } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';
import { Button } from './Button';
import { Text } from './Text';

export function LoadingState({ message = 'Cargando...' }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-8" accessibilityLabel={message}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text variant="caption">{message}</Text>
    </View>
  );
}

interface EmptyProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = PawPrint, title, message, actionLabel, onAction }: EmptyProps) {
  return (
    <Animated.View entering={FadeInUp.duration(300)} className="flex-1 items-center justify-center gap-3 p-8">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-light">
        <Icon size={34} color={colors.primary} />
      </View>
      <Text variant="subtitle" className="text-center">
        {title}
      </Text>
      {message ? <Text className="text-center text-ink-muted">{message}</Text> : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} className="mt-2" /> : null}
    </Animated.View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 p-8">
      <AlertCircle size={36} color={colors.danger} />
      <Text variant="subtitle" className="text-center">
        Ups, algo no salió bien
      </Text>
      <Text className="text-center text-ink-muted">{message}</Text>
      {onRetry ? <Button title="Reintentar" variant="outline" onPress={onRetry} /> : null}
    </View>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.set(withRepeat(withTiming(1, { duration: 800 }), -1, true));
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return <Animated.View style={style} className={`rounded-2xl bg-line ${className}`} />;
}
