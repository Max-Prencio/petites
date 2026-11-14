import type { LucideIcon } from 'lucide-react-native';
import { forwardRef, useState, type ComponentRef } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/constants/theme';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  multiline?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<ComponentRef<typeof TextInput>, InputProps>(function Input(
  { label, error, hint, icon: Icon, multiline, containerClassName = '', onFocus, onBlur, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const border = error ? 'border-danger' : focused ? 'border-primary' : 'border-line';

  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View
        className={`flex-row rounded-2xl border bg-surface px-4 ${border} ${
          multiline ? 'min-h-[110px] items-start py-3' : 'h-12 items-center'
        }`}
      >
        {Icon ? (
          <Icon size={18} color={focused ? colors.primary : colors.inkFaint} style={{ marginRight: 10 }} />
        ) : null}
        <TextInput
          ref={ref}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor={colors.inkFaint}
          className="flex-1 text-[15px] text-ink"
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error ? (
        <Text className="text-[12px] text-danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
});

export const TextArea = forwardRef<ComponentRef<typeof TextInput>, InputProps>(function TextArea(props, ref) {
  return <Input ref={ref} multiline numberOfLines={5} {...props} />;
});
