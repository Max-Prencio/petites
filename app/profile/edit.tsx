import { useRouter } from 'expo-router';

import { ProfileForm } from '@/components/ProfileForm';
import { ErrorState, Header, LoadingState, Screen } from '@/components/ui';
import { useMyProfile } from '@/features/auth';
import { errorMessage } from '@/utils/errors';

export default function EditProfileScreen() {
  const router = useRouter();
  const me = useMyProfile();
  if (me.isPending) return <LoadingState />;
  if (me.isError) return <ErrorState message={errorMessage(me.error)} onRetry={() => void me.refetch()} />;
  return (
    <Screen scroll>
      <Header title="Editar perfil" />
      <ProfileForm me={me.data} submitLabel="Guardar cambios" onSaved={() => router.back()} />
    </Screen>
  );
}
