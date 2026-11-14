import { View } from 'react-native';

import { ProfileForm } from '@/components/ProfileForm';
import { ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { useMyProfile } from '@/features/auth';
import { errorMessage } from '@/utils/errors';

export default function OnboardingScreen() {
  const me = useMyProfile();
  if (me.isPending) return <LoadingState />;
  if (me.isError) return <ErrorState message={errorMessage(me.error)} onRetry={() => void me.refetch()} />;

  return (
    <Screen scroll contentClassName="pt-6">
      <View className="gap-2">
        <Text variant="overline">Último paso</Text>
        <Text variant="display">Completa tu perfil</Text>
        <Text className="text-ink-muted">
          Así los cuidadores sabrán quién eres y desde dónde nos escribes.
        </Text>
      </View>
      <ProfileForm me={me.data} submitLabel="Empezar a explorar" markOnboarded />
    </Screen>
  );
}
