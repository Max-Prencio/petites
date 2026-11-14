import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { RequestStatus } from '@/constants/requestStatus';
import type { RequestInput } from '@/schemas/request';
import { queryClient } from '@/services/queryClient';
import { useSessionStore } from '@/stores/sessionStore';
import type { Enums } from '@/types/models';
import * as api from './api';

export const requestKeys = {
  mine: (userId: string | null) => ['requests', 'mine', userId] as const,
  received: (userId: string | null) => ['requests', 'received', userId] as const,
  detail: (id: string) => ['requests', 'detail', id] as const,
  events: (id: string) => ['requests', 'events', id] as const,
  followUps: (userId: string | null) => ['requests', 'followups', userId] as const,
};

function useUserId() {
  return useSessionStore((s) => s.session?.user.id ?? null);
}

function invalidateAll() {
  void queryClient.invalidateQueries({ queryKey: ['requests'] });
  void queryClient.invalidateQueries({ queryKey: ['listings'] });
  void queryClient.invalidateQueries({ queryKey: ['catalog'] });
}

export function useMyRequests() {
  const userId = useUserId();
  return useQuery({
    queryKey: requestKeys.mine(userId),
    queryFn: () => api.fetchMyRequests(userId as string),
    enabled: userId !== null,
  });
}

export function useReceivedRequests() {
  const userId = useUserId();
  return useQuery({
    queryKey: requestKeys.received(userId),
    queryFn: () => api.fetchReceivedRequests(userId as string),
    enabled: userId !== null,
  });
}

export function useRequest(id: string) {
  const detail = useQuery({ queryKey: requestKeys.detail(id), queryFn: () => api.fetchRequest(id) });
  const events = useQuery({ queryKey: requestKeys.events(id), queryFn: () => api.fetchRequestEvents(id) });

  // Seguimiento en vivo del recorrido.
  useEffect(
    () =>
      api.subscribeToRequest(id, () => {
        void queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
        void queryClient.invalidateQueries({ queryKey: requestKeys.events(id) });
      }),
    [id],
  );

  return { detail, events };
}

export function useCreateRequest() {
  return useMutation({
    mutationFn: ({ listingId, input }: { listingId: string; input: RequestInput }) =>
      api.createRequest(listingId, input),
    onSuccess: invalidateAll,
  });
}

export function useUpdateRequestStatus(requestId: string) {
  return useMutation({
    mutationFn: ({ status, note }: { status: RequestStatus; note?: string }) =>
      api.updateRequestStatus(requestId, status, note),
    onSuccess: invalidateAll,
  });
}

export function useFollowUps() {
  const userId = useUserId();
  return useQuery({
    queryKey: requestKeys.followUps(userId),
    queryFn: () => api.fetchMyFollowUps(userId as string),
    enabled: userId !== null,
  });
}

export function useAnswerFollowUp() {
  return useMutation({
    mutationFn: ({
      id,
      response,
      notes,
    }: {
      id: string;
      response: Enums<'follow_up_response'>;
      notes?: string;
    }) => api.answerFollowUp(id, response, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests', 'followups'] }),
  });
}

export type { RequestDetail, RequestListItem } from './api';
