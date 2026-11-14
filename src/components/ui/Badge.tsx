import { View } from 'react-native';

import { Text } from './Text';

type Tone = 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger' | 'adoption' | 'sale';

const toneClass: Record<Tone, { box: string; text: string }> = {
  primary: { box: 'bg-primary-light', text: 'text-primary-dark' },
  secondary: { box: 'bg-secondary-light', text: 'text-secondary' },
  neutral: { box: 'bg-ivory border border-line', text: 'text-ink-muted' },
  success: { box: 'bg-[#E3F3EA]', text: 'text-success' },
  warning: { box: 'bg-[#FBF0D9]', text: 'text-warning' },
  danger: { box: 'bg-[#F8E1DF]', text: 'text-danger' },
  adoption: { box: 'bg-secondary', text: 'text-white' },
  sale: { box: 'bg-primary', text: 'text-white' },
};

interface Props {
  label: string;
  tone?: Tone;
  className?: string;
}

export function Badge({ label, tone = 'neutral', className = '' }: Props) {
  const t = toneClass[tone];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${t.box} ${className}`}>
      <Text className={`text-[11px] font-bold ${t.text}`}>{label}</Text>
    </View>
  );
}
