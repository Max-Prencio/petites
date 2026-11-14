import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/services/queryClient';
import { useSessionStore } from '@/stores/sessionStore';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';
import * as api from './api';

const keys = {
  ids: (userId: string | null) => ['favorites', 'ids', userId] as const,
  list: (userId: string | null) => ['favorites', 'list', userId] as const,
};

export function useFavoriteIds() {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: keys.ids(userId),
    queryFn: () => api.fetchFavoriteIds(userId as string),
    enabled: userId !== null,
    select: (ids) => new Set(ids),
  });
}

export function useFavorites() {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: keys.list(userId),
    queryFn: () => api.fetchFavorites(userId as string),
    enabled: userId !== null,
  });
}

// Alterna favorito con actualización optimista.
export function useToggleFavorite() {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useMutation({
    mutationFn: async ({ listingId, isFavorite }: { listingId: string; isFavorite: boolean }) => {
      if (!userId) throw new Error('Inicia sesión para guardar en tu lista');
      if (isFavorite) await api.removeFavorite(userId, listingId);
      else await api.addFavorite(userId, listingId);
    },
    onMutate: async ({ listingId, isFavorite }) => {
      const key = keys.ids(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key);
      queryClient.setQueryData<string[]>(key, (old = []) =>
        isFavorite ? old.filter((id) => id !== listingId) : [...old, listingId],
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(keys.ids(userId), context.previous);
      toast.error(errorMessage(error));
    },
    onSuccess: (_data, { isFavorite }) => {
      if (!isFavorite) toast.success('¡Flechazo! Guardado en tu lista');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });
}
