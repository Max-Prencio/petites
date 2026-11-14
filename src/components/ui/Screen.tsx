import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  className?: string;
  contentClassName?: string;
  footer?: ReactNode;
}

export function Screen({
  children,
  scroll = false,
  edges = ['top'],
  className = '',
  contentClassName = '',
  footer,
}: Props) {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-ivory ${className}`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerClassName={`px-5 pb-10 gap-5 ${contentClassName}`}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View className={`flex-1 ${contentClassName}`}>{children}</View>
        )}
        {footer ? <View className="border-t border-line bg-ivory px-5 pb-6 pt-3">{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
