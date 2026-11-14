import { useMutation, useQuery } from '@tanstack/react-query';

import type { ProfileInput } from '@/schemas/profile';
import { queryClient } from '@/services/queryClient';
import type { LocalFile } from '@/services/storage';
import { useSessionStore } from '@/stores/sessionStore';
import * as api from './profileApi';

export const profileKeys = {
  me: (userId: string | null) => ['profile', 'me', userId] as const,
  public: (userId: string) => ['profile', 'public', userId] as const,
};

export function useMyProfile() {
  const session = useSessionStore((s) => s.session);
  const userId = session?.user.id ?? null;
  return useQuery({
    queryKey: profileKeys.me(userId),
    queryFn: () => api.fetchMyProfile(userId as string, session?.user.email ?? ''),
    enabled: userId !== null,
  });
}

export function useIsAdmin(): boolean {
  const { data } = useMyProfile();
  return data?.roles.includes('admin') ?? false;
}

export function useUpdateProfile() {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useMutation({
    mutationFn: ({ input, markOnboarded = false }: { input: ProfileInput; markOnboarded?: boolean }) => {
      if (!userId) throw new Error('Sesión no válida');
      return api.updateMyProfile(userId, input, markOnboarded);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function useUpdateAvatar() {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useMutation({
    mutationFn: ({ file, previousPath }: { file: LocalFile; previousPath: string | null }) => {
      if (!userId) throw new Error('Sesión no válida');
      return api.updateAvatar(userId, file, previousPath);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function usePublicProfile(userId: string) {
  return useQuery({ queryKey: profileKeys.public(userId), queryFn: () => api.fetchPublicProfile(userId) });
}
