import type { BottomTabBarProps } from 'expo-router/tabs';
import { Home, MessageCircle, Plus, Search, UserRound, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { tapFeedback } from '@/services/haptics';
import { Glass } from './ui/Glass';
import { PressableScale } from './ui/PressableScale';
import { Text } from './ui/Text';

const icons: Record<string, LucideIcon> = {
  index: Home,
  explore: Search,
  publish: Plus,
  messages: MessageCircle,
  profile: UserRound,
};

interface Props extends BottomTabBarProps {
  badges?: Partial<Record<string, number>>;
}

// Espacio que deben reservar al final las pantallas con pestañas (barra flotante + margen).
export const TAB_BAR_CLEARANCE = 128;

// Barra flotante de vidrio al estilo iOS: Inicio · Explorar · Publicar · Mensajes · Mi perfil.
export function TabBar({ state, descriptors, emitter, navigateToTab, badges = {} }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0 px-4"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <Glass interactive className="flex-row items-center rounded-full px-1.5 py-1.5">
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
              scaleTo={0.92}
              onPress={() => {
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  tapFeedback();
                  navigateToTab(route.key);
                }
              }}
              className="flex-1 items-center"
            >
              {isPublish ? (
                <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-primary">
                  <Icon size={26} color="#FFFFFF" strokeWidth={2.6} />
                </View>
              ) : (
                <View
                  className={`h-[52px] w-full items-center justify-center gap-0.5 rounded-full ${
                    focused ? 'bg-primary/10' : ''
                  }`}
                >
                  <View>
                    <Icon
                      size={22}
                      color={focused ? colors.primary : colors.ink}
                      strokeWidth={focused ? 2.4 : 1.9}
                    />
                    {badge > 0 ? (
                      <View className="absolute -right-2.5 -top-1.5 min-w-[18px] items-center rounded-full border-2 border-white bg-primary px-1">
                        <Text className="text-[10px] font-bold text-white">{badge > 9 ? '9+' : badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    numberOfLines={1}
                    className={`text-[10px] ${focused ? 'font-bold text-primary' : 'font-medium text-ink'}`}
                  >
                    {label}
                  </Text>
                </View>
              )}
            </PressableScale>
          );
        })}
      </Glass>
    </View>
  );
}
