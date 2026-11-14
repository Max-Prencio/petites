/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#F47B35', light: '#FDE6D8', dark: '#D9621E' },
        secondary: { DEFAULT: '#243B32', light: '#E3EAE6', muted: '#5C6F66' },
        ivory: '#F8F5EF',
        surface: '#FFFFFF',
        ink: { DEFAULT: '#252525', muted: '#6B6B6B', faint: '#A3A3A3' },
        line: '#ECE6DC',
        success: '#2F8F5B',
        warning: '#C98A12',
        danger: '#C8463D',
      },
      borderRadius: { xl: '16px', '2xl': '20px', '3xl': '28px' },
    },
  },
  plugins: [],
};
