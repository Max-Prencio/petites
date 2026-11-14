// Tokens de diseño de Petites. Deben coincidir con tailwind.config.js.
export const colors = {
  primary: '#F47B35',
  primaryLight: '#FDE6D8',
  primaryDark: '#D9621E',
  secondary: '#243B32',
  secondaryLight: '#E3EAE6',
  secondaryMuted: '#5C6F66',
  ivory: '#F8F5EF',
  surface: '#FFFFFF',
  ink: '#252525',
  inkMuted: '#6B6B6B',
  inkFaint: '#A3A3A3',
  line: '#ECE6DC',
  success: '#2F8F5B',
  warning: '#C98A12',
  danger: '#C8463D',
} as const;

export const radii = { sm: 10, md: 14, lg: 20, xl: 28, full: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
