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

const ALIGN = new Set(['text-left', 'text-center', 'text-right', 'text-justify']);
const isSize = (c: string) => /^text-(\[\d+px\]|xs|sm|base|lg|\d?xl)$/.test(c);
const isColor = (c: string) => c.startsWith('text-') && !ALIGN.has(c) && !isSize(c);

// NativeWind resuelve conflictos por el orden del CSS, no del className: si `className`
// trae color o tamaño propio, se quita el de la variante para que gane siempre.
function mergeClasses(base: string, extra: string) {
  const extras = extra.split(/\s+/).filter(Boolean);
  const overridesSize = extras.some(isSize);
  const overridesColor = extras.some(isColor);
  const kept = base
    .split(' ')
    .filter((c) => !(overridesSize && isSize(c)) && !(overridesColor && isColor(c)));
  return [...kept, ...extras].join(' ');
}

export function Text({ variant = 'body', className = '', ...props }: Props) {
  return <RNText className={mergeClasses(variantClass[variant], className)} {...props} />;
}
