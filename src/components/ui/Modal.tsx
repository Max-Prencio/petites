import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal as RNModal, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { IconButton } from './IconButton';
import { Text } from './Text';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  scrollable?: boolean;
}

// Hoja inferior animada que se usa como modal en toda la app.
export function Modal({ visible, onClose, title, children, footer, scrollable = true }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {visible ? (
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1 justify-end"
        >
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(150)}
            className="absolute inset-0"
          >
            <Pressable className="flex-1 bg-black/40" onPress={onClose} accessibilityLabel="Cerrar" />
          </Animated.View>
          <Animated.View
            entering={SlideInDown.springify().damping(20)}
            exiting={SlideOutDown.duration(180)}
            className="max-h-[88%] rounded-t-3xl bg-ivory"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <View className="items-center pt-2">
              <View className="h-1.5 w-10 rounded-full bg-line" />
            </View>
            <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
              <Text variant="subtitle" className="flex-1">
                {title ?? ''}
              </Text>
              <IconButton icon={X} label="Cerrar" onPress={onClose} variant="ghost" />
            </View>
            {scrollable ? (
              <ScrollView
                className="px-5"
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="pb-4 gap-4"
              >
                {children}
              </ScrollView>
            ) : (
              <View className="gap-4 px-5 pb-4">{children}</View>
            )}
            {footer ? <View className="gap-2 px-5 pt-2">{footer}</View> : null}
          </Animated.View>
        </KeyboardAvoidingView>
      ) : null}
    </RNModal>
  );
}
