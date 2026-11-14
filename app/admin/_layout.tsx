import { Redirect, Stack } from 'expo-router';

import { LoadingState } from '@/components/ui';
import { useIsAdmin, useMyProfile } from '@/features/auth';

// La UI se oculta a no-admins, pero la autorización real la imponen RLS y los RPC admin_*.
export default function AdminLayout() {
  const me = useMyProfile();
  const isAdmin = useIsAdmin();
  if (me.isPending) return <LoadingState />;
  if (!isAdmin) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8F5EF' } }} />;
}
