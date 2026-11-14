import * as Haptics from 'expo-haptics';

// Retroalimentación táctil ligera al estilo iOS; si el dispositivo no la soporta, se ignora.
export function tapFeedback() {
  Haptics.selectionAsync().catch(() => undefined);
}

export function successFeedback() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}
