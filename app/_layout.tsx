import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingState, ToastHost } from '@/components/ui';
import { useAuthListener, useMyProfile } from '@/features/auth';
import { queryClient } from '@/services/queryClient';
import { useSessionStore } from '@/stores/sessionStore';

function RootNavigator() {
  useAuthListener();
  const initialized = useSessionStore((s) => s.initialized);
  const session = useSessionStore((s) => s.session);
  const profile = useMyProfile();

  const signedIn = session !== null;
  const waitingProfile = signedIn && profile.isPending;
  if (!initialized || waitingProfile) {
    return (
      <View className="flex-1 bg-ivory">
        <LoadingState message="Sus patitas en camino hacia ti..." />
      </View>
    );
  }
  const onboarded = Boolean(profile.data?.profile.onboarded_at);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8F5EF' } }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="animals/[id]" />
        <Stack.Screen name="listings/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="listings/edit/[id]" />
        <Stack.Screen name="listings/mine" />
        <Stack.Screen name="listings/documents/[animalId]" />
        <Stack.Screen name="messages/[conversationId]" />
        <Stack.Screen name="requests/index" />
        <Stack.Screen name="requests/received" />
        <Stack.Screen name="requests/new/[listingId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="requests/[id]" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/[userId]" />
        <Stack.Screen name="profile/favorites" />
        <Stack.Screen name="profile/notifications" />
        <Stack.Screen name="profile/about" />
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <RootNavigator />
        <ToastHost />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
