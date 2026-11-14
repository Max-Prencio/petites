import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { colors } from '@/constants/theme';

let configured = false;

export function configureNotifications(): void {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync('default', {
      name: 'Petites',
      importance: AndroidImportance.HIGH,
      lightColor: colors.primary,
    });
  }
}

// Devuelve el token de Expo Push o null si no es posible (simulador, sin permiso o sin projectId de EAS).
export async function registerForPushToken(): Promise<string | null> {
  if (!Device.isDevice || Platform.OS === 'web') return null;
  const current = await Notifications.getPermissionsAsync();
  const status = current.granted ? 'granted' : (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return null;

  const projectId: unknown = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (typeof projectId !== 'string') return null;
  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}

export async function showLocalNotification(
  title: string,
  body: string,
  data: Record<string, unknown>,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({ content: { title, body, data }, trigger: null });
}

// Recordatorios de seguimiento post-entrega (7 y 30 días) en el dispositivo.
export async function scheduleFollowUpReminder(id: string, animalName: string, dueAt: Date): Promise<void> {
  if (Platform.OS === 'web' || dueAt.getTime() <= Date.now()) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduled.some((n) => n.identifier === `followup-${id}`)) return;
  await Notifications.scheduleNotificationAsync({
    identifier: `followup-${id}`,
    content: {
      title: `¿Cómo está ${animalName}?`,
      body: 'Cuéntanos cómo va su adaptación en su nuevo hogar 🐾',
      data: { follow_up_id: id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dueAt },
  });
}
