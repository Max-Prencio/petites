import { formatDistanceToNowStrict, format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

import { currencySymbol } from '@/constants/labels';
import type { Enums } from '@/types/database.types';

export function formatPrice(price: number | null, currency: Enums<'currency_code'> | null): string {
  if (price === null || currency === null) return '';
  const amount = new Intl.NumberFormat('es-DO', { maximumFractionDigits: 0 }).format(price);
  return `${currencySymbol[currency]} ${amount}`;
}

export function formatAge(value: number, unit: Enums<'age_unit'>): string {
  if (unit === 'years') return value === 1 ? '1 año' : `${value} años`;
  if (value === 0) return 'Recién nacido';
  return value === 1 ? '1 mes' : `${value} meses`;
}

export function formatRelative(iso: string): string {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: es });
}

export function formatChatTime(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Ayer';
  return format(date, 'dd/MM/yy');
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM yyyy", { locale: es });
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'd MMM, HH:mm', { locale: es });
}

export function memberSince(iso: string): string {
  return `En Petites desde ${format(new Date(iso), 'MMMM yyyy', { locale: es })}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
