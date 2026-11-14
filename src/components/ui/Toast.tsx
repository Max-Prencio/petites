import { CheckCircle2, Info, XCircle } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUiStore } from '@/stores/uiStore';
import { Text } from './Text';

const toneClass = { success: 'bg-secondary', error: 'bg-danger', info: 'bg-ink' } as const;
const toneIcon = { success: CheckCircle2, error: XCircle, info: Info } as const;

export function ToastHost() {
  const toast = useUiStore((s) => s.toast);
  const hide = useUiStore((s) => s.hideToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, 3200);
    return () => clearTimeout(t);
  }, [toast, hide]);

  if (!toast) return null;
  const Icon = toneIcon[toast.tone];
  return (
    <Animated.View
      key={toast.id}
      entering={FadeInUp.springify()}
      exiting={FadeOutUp}
      className="absolute left-4 right-4 z-50"
      style={{ top: insets.top + 8 }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={hide}
        accessibilityLiveRegion="polite"
        className={`flex-row items-center gap-3 rounded-2xl px-4 py-3.5 shadow-lg ${toneClass[toast.tone]}`}
      >
        <Icon size={20} color="#FFFFFF" />
        <Text className="flex-1 font-semibold text-white">{toast.message}</Text>
      </Pressable>
    </Animated.View>
  );
}
