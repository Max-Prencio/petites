import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from './Text';

interface Props {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Card({ children, title, className = '' }: Props) {
  return (
    <View className={`gap-3 rounded-[24px] bg-surface p-4 ${className}`} style={cardShadow}>
      {title ? <Text variant="subtitle">{title}</Text> : null}
      {children}
    </View>
  );
}

// Sombra suave de tarjeta iOS en lugar de borde marcado
const cardShadow = {
  shadowColor: '#1C1A17',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-1">
      <Text variant="caption">{label}</Text>
      <Text className="flex-shrink text-right font-semibold">{value}</Text>
    </View>
  );
}
