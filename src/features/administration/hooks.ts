import { useMutation, useQuery } from '@tanstack/react-query';

import type { BreedInput, CategoryInput } from '@/schemas/catalog';
import { queryClient } from '@/services/queryClient';
import type { Enums } from '@/types/models';
import * as api from './api';

const invalidateAdmin = () => {
  void queryClient.invalidateQueries({ queryKey: ['admin'] });
  void queryClient.invalidateQueries({ queryKey: ['catalog'] });
};

export const useAdminStats = () => useQuery({ queryKey: ['admin', 'stats'], queryFn: api.fetchAdminStats });

export const useAdminReports = (status: Enums<'report_status'> | 'all') =>
  useQuery({ queryKey: ['admin', 'reports', status], queryFn: () => api.fetchReports(status) });

export const useResolveReport = () =>
  useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: Enums<'report_status'>; note: string }) =>
      api.resolveReport(id, status, note),
    onSuccess: invalidateAdmin,
  });

export const useReportedConversation = (reportId: string | null) =>
  useQuery({
    queryKey: ['admin', 'conversation', reportId],
    queryFn: () => api.readReportedConversation(reportId as string),
    enabled: reportId !== null,
    gcTime: 0,
  });

export const useCloseConversation = () =>
  useMutation({
    mutationFn: ({ conversationId, reason }: { conversationId: string; reason: string }) =>
      api.closeConversation(conversationId, reason),
    onSuccess: invalidateAdmin,
  });

export const useAdminListings = (search: string, onlyHidden: boolean) =>
  useQuery({
    queryKey: ['admin', 'listings', search, onlyHidden],
    queryFn: () => api.fetchAdminListings(search, onlyHidden),
  });

export const useModerateListing = () =>
  useMutation({
    mutationFn: ({
      listingId,
      status,
      reason,
    }: {
      listingId: string;
      status: Enums<'moderation_status'>;
      reason: string;
    }) => api.setListingModeration(listingId, status, reason),
    onSuccess: invalidateAdmin,
  });

export const useAdminUsers = (search: string) =>
  useQuery({ queryKey: ['admin', 'users', search], queryFn: () => api.fetchUsers(search) });

export const useSuspendUser = () =>
  useMutation({
    mutationFn: ({ userId, suspend, reason }: { userId: string; suspend: boolean; reason: string }) =>
      api.setUserSuspension(userId, suspend, reason),
    onSuccess: invalidateAdmin,
  });

export const useAdminCategories = () =>
  useQuery({ queryKey: ['admin', 'categories'], queryFn: api.fetchAllCategories });

export const useCreateCategory = () =>
  useMutation({
    mutationFn: ({ input, sortOrder }: { input: CategoryInput; sortOrder: number }) =>
      api.createCategory(input, sortOrder),
    onSuccess: invalidateAdmin,
  });

export const useToggleCategory = () =>
  useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => api.setCategoryActive(id, active),
    onSuccess: invalidateAdmin,
  });

export const useCreateBreed = () =>
  useMutation({ mutationFn: (input: BreedInput) => api.createBreed(input), onSuccess: invalidateAdmin });

export const useToggleBreed = () =>
  useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => api.setBreedActive(id, active),
    onSuccess: invalidateAdmin,
  });

export const useAuditLog = () => useQuery({ queryKey: ['admin', 'audit'], queryFn: api.fetchAuditLog });

export type { AdminCategory, AdminReport, AdminUser } from './api';
