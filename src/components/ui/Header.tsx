import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { IconButton } from './IconButton';
import { Text } from './Text';

interface Props {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}

// Barra de navegación propia (las pantallas usan headerShown: false).
export function Header({ title, subtitle, back = true, right }: Props) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-3 px-5 pb-3 pt-2">
      {back ? (
        <IconButton
          icon={ChevronLeft}
          label="Volver"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      ) : null}
      <View className="flex-1">
        {title ? (
          <Text variant="subtitle" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
