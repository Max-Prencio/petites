import * as Notifications from 'expo-notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { queryClient } from '@/services/queryClient';
import { useSessionStore } from '@/stores/sessionStore';
import type { Json } from '@/types/database.types';
import * as api from './api';
import { configureNotifications, registerForPushToken, showLocalNotification } from './device';

const keys = { list: (userId: string | null) => ['notifications', userId] as const };

export function useNotifications() {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: keys.list(userId),
    queryFn: () => api.fetchNotifications(userId as string),
    enabled: userId !== null,
  });
}

export function useUnreadNotificationsCount(): number {
  const { data } = useNotifications();
  return data?.filter((n) => n.read_at === null).length ?? 0;
}

export function useMarkNotificationsRead() {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useMutation({
    mutationFn: (ids?: string[]) => {
      if (!userId) throw new Error('Sesión no válida');
      return api.markNotificationsRead(userId, ids);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

function readString(data: Json | Record<string, unknown>, key: string): string | null {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const value = (data as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : null;
  }
  return null;
}

// Ruta a la que lleva una notificación según su payload.
export function notificationHref(data: Json | Record<string, unknown>): Href | null {
  const conversationId = readString(data, 'conversation_id');
  if (conversationId) return `/messages/${conversationId}`;
  const requestId = readString(data, 'request_id');
  if (requestId) return `/requests/${requestId}`;
  const listingId = readString(data, 'listing_id');
  if (listingId) return `/animals/${listingId}`;
  if (readString(data, 'follow_up_id')) return '/requests';
  return null;
}

// Montado una vez en el layout autenticado: token push, Realtime y navegación al tocar.
export function useNotificationsBridge(): void {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  const router = useRouter();

  useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    if (!userId) return;
    void registerForPushToken().then((token) => {
      if (token) {
        void api
          .savePushToken(userId, token, Platform.OS === 'ios' ? 'ios' : 'android')
          .catch(() => undefined);
      }
    });

    const unsubscribe = api.subscribeToNotifications(userId, (n) => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (n.type === 'request_status' || n.type === 'request_new') {
        void queryClient.invalidateQueries({ queryKey: ['requests'] });
      }
      // Si la app está en primer plano, aviso local inmediato (el push remoto cubre el segundo plano).
      if (AppState.currentState === 'active' && Platform.OS !== 'web' && n.type !== 'message') {
        void showLocalNotification(n.title, n.body, { ...(n.data as Record<string, unknown>) }).catch(
          () => undefined,
        );
      }
    });

    const tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const href = notificationHref(response.notification.request.content.data ?? {});
      if (href) router.push(href);
    });

    return () => {
      unsubscribe();
      tapSub.remove();
    };
  }, [userId, router]);
}
