import type { BottomTabBarProps } from 'expo-router/tabs';
import { Home, MessageCircle, PlusCircle, Search, UserRound, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { PressableScale } from './ui/PressableScale';
import { Text } from './ui/Text';

const icons: Record<string, LucideIcon> = {
  index: Home,
  explore: Search,
  publish: PlusCircle,
  messages: MessageCircle,
  profile: UserRound,
};

interface Props extends BottomTabBarProps {
  badges?: Partial<Record<string, number>>;
}

// Barra inferior propia: Inicio · Explorar · Publicar · Mensajes · Mi perfil.
export function TabBar({ state, descriptors, emitter, navigateToTab, badges = {} }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row border-t border-line bg-surface px-2 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const descriptor = descriptors[route.key];
        const label = descriptor?.options.title ?? route.name;
        const Icon = icons[route.name] ?? Home;
        const isPublish = route.name === 'publish';
        const badge = badges[route.name] ?? 0;

        return (
          <PressableScale
            key={route.key}
            testID={`tab-${route.name}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={badge > 0 ? `${label}, ${badge} sin leer` : label}
            onPress={() => {
              const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigateToTab(route.key);
            }}
            className="flex-1 items-center gap-1"
          >
            {isPublish ? (
              <View className="-mt-5 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-md">
                <Icon size={26} color="#FFFFFF" />
              </View>
            ) : (
              <View>
                <Icon
                  size={23}
                  color={focused ? colors.primary : colors.inkFaint}
                  strokeWidth={focused ? 2.4 : 2}
                />
                {badge > 0 ? (
                  <View className="absolute -right-2 -top-1 min-w-[18px] items-center rounded-full bg-primary px-1">
                    <Text className="text-[10px] font-bold text-white">{badge > 9 ? '9+' : badge}</Text>
                  </View>
                ) : null}
              </View>
            )}
            <Text className={`text-[11px] ${focused ? 'font-bold text-primary' : 'text-ink-faint'}`}>
              {label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
