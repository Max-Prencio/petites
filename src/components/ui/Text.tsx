import { Text as RNText, type TextProps } from 'react-native';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label' | 'overline';

const variantClass: Record<Variant, string> = {
  display: 'text-[30px] leading-9 font-extrabold text-secondary',
  title: 'text-[22px] leading-7 font-bold text-ink',
  subtitle: 'text-[17px] leading-6 font-semibold text-ink',
  body: 'text-[15px] leading-[22px] text-ink',
  caption: 'text-[13px] leading-[18px] text-ink-muted',
  label: 'text-[14px] font-semibold text-ink',
  overline: 'text-[11px] font-bold uppercase tracking-widest text-secondary-muted',
};

interface Props extends TextProps {
  variant?: Variant;
  className?: string;
}

export function Text({ variant = 'body', className = '', ...props }: Props) {
  return <RNText className={`${variantClass[variant]} ${className}`} {...props} />;
}
