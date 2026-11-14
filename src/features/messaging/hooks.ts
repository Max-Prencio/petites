import { useInfiniteQuery, useMutation, useQuery, type InfiniteData } from '@tanstack/react-query';
import { useEffect } from 'react';

import { limits } from '@/constants/config';
import { queryClient } from '@/services/queryClient';
import { useSessionStore } from '@/stores/sessionStore';
import type { Message } from '@/types/models';
import * as api from './api';

export const messagingKeys = {
  inbox: ['messaging', 'inbox'] as const,
  conversation: (id: string) => ['messaging', 'conversation', id] as const,
  messages: (id: string) => ['messaging', 'messages', id] as const,
};

export function useConversations() {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  const query = useQuery({
    queryKey: messagingKeys.inbox,
    queryFn: api.fetchConversations,
    enabled: userId !== null,
  });

  useEffect(() => {
    if (!userId) return;
    return api.subscribeToInbox(() => void queryClient.invalidateQueries({ queryKey: messagingKeys.inbox }));
  }, [userId]);

  return query;
}

export function useUnreadMessagesCount(): number {
  const { data } = useConversations();
  return data?.reduce((sum, c) => sum + Number(c.unread_count), 0) ?? 0;
}

export function useConversation(conversationId: string) {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useQuery({
    queryKey: messagingKeys.conversation(conversationId),
    queryFn: () => api.fetchConversation(conversationId, userId as string),
    enabled: userId !== null,
  });
}

function appendMessage(conversationId: string, message: Message) {
  queryClient.setQueryData<InfiniteData<Message[], string | undefined>>(
    messagingKeys.messages(conversationId),
    (old) => {
      if (!old) return old;
      const exists = old.pages.some((page) => page.some((m) => m.id === message.id));
      if (exists) return old;
      const [first = [], ...rest] = old.pages;
      return { ...old, pages: [[message, ...first], ...rest] };
    },
  );
}

// Mensajes con paginación hacia atrás + suscripción Realtime.
export function useMessages(conversationId: string) {
  const query = useInfiniteQuery({
    queryKey: messagingKeys.messages(conversationId),
    queryFn: ({ pageParam }) => api.fetchMessages(conversationId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length < limits.messagePageSize ? undefined : lastPage[lastPage.length - 1]?.created_at,
  });

  useEffect(() => {
    const unsubscribe = api.subscribeToConversation(conversationId, (message) => {
      appendMessage(conversationId, message);
      void api.markConversationRead(conversationId).catch(() => undefined);
    });
    void api
      .markConversationRead(conversationId)
      .then(() => queryClient.invalidateQueries({ queryKey: messagingKeys.inbox }))
      .catch(() => undefined);
    return unsubscribe;
  }, [conversationId]);

  return query;
}

export function useSendMessage(conversationId: string) {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useMutation({
    mutationFn: (content: string) => {
      if (!userId) throw new Error('Sesión no válida');
      return api.sendMessage(conversationId, userId, content);
    },
    onSuccess: (message) => appendMessage(conversationId, message),
  });
}

export function useStartConversation() {
  return useMutation({
    mutationFn: api.startConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: messagingKeys.inbox }),
  });
}

export function useBlockUser(conversationId: string) {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useMutation({
    mutationFn: ({ otherId, block }: { otherId: string; block: boolean }) => {
      if (!userId) throw new Error('Sesión no válida');
      return block ? api.blockUser(userId, otherId) : api.unblockUser(userId, otherId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: messagingKeys.conversation(conversationId) }),
  });
}

export { avatarUrl, conversationCover, type ConversationDetail } from './api';
