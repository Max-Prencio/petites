import { Easing, FadeInUp, FadeOutDown, SlideInDown } from 'react-native-reanimated';

// Movimiento de Petites: fade-up suave, sin rebotes (curva de salida, sin sobrepaso).
export const easeOut = Easing.out(Easing.cubic);

export const duration = { fast: 140, base: 260, slow: 360 } as const;

const STAGGER_MS = 45;
const MAX_STAGGERED = 10;

// Entrada estándar: aparece subiendo unos píxeles. `index` escalona listas y menús.
export function fadeUp(index = 0, ms: number = duration.base) {
  return FadeInUp.duration(ms)
    .delay(Math.min(index, MAX_STAGGERED) * STAGGER_MS)
    .easing(easeOut);
}

export const fadeOutDown = FadeOutDown.duration(duration.fast);

// Hojas inferiores: suben con la misma curva, sin resorte.
export const sheetIn = SlideInDown.duration(duration.base).easing(easeOut);
