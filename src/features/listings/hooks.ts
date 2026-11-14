import { useMutation, useQuery } from '@tanstack/react-query';

import type { ListingInput } from '@/schemas/listing';
import { queryClient } from '@/services/queryClient';
import type { LocalFile } from '@/services/storage';
import { useSessionStore } from '@/stores/sessionStore';
import type { Enums, Tables } from '@/types/models';
import * as api from './api';

export const listingKeys = {
  mine: (userId: string | null) => ['listings', 'mine', userId] as const,
  edit: (id: string) => ['listings', 'edit', id] as const,
  docs: (animalId: string) => ['listings', 'docs', animalId] as const,
};

function useUserId(): string | null {
  return useSessionStore((s) => s.session?.user.id ?? null);
}

function invalidateListings() {
  void queryClient.invalidateQueries({ queryKey: ['listings'] });
  void queryClient.invalidateQueries({ queryKey: ['catalog'] });
  void queryClient.invalidateQueries({ queryKey: ['profile'] });
}

export function useMyListings() {
  const userId = useUserId();
  return useQuery({
    queryKey: listingKeys.mine(userId),
    queryFn: () => api.fetchMyListings(userId as string),
    enabled: userId !== null,
  });
}

export function useListingForEdit(id: string) {
  return useQuery({ queryKey: listingKeys.edit(id), queryFn: () => api.fetchListingForEdit(id), gcTime: 0 });
}

export function useCreateListing() {
  const userId = useUserId();
  return useMutation({
    mutationFn: ({ input, status }: { input: ListingInput; status: Enums<'listing_status'> }) => {
      if (!userId) throw new Error('Necesitas iniciar sesión');
      return api.createListing(userId, input, status);
    },
    onSuccess: invalidateListings,
  });
}

export function useUpdateListing(listingId: string) {
  const userId = useUserId();
  return useMutation({
    mutationFn: (input: ListingInput) => {
      if (!userId) throw new Error('Necesitas iniciar sesión');
      return api.updateListing(userId, listingId, input);
    },
    onSuccess: invalidateListings,
  });
}

export function useSetListingStatus() {
  return useMutation({
    mutationFn: ({ listingId, status }: { listingId: string; status: Enums<'listing_status'> }) =>
      api.setListingStatus(listingId, status),
    onSuccess: invalidateListings,
  });
}

export function useDeleteListing() {
  return useMutation({ mutationFn: api.deleteListing, onSuccess: invalidateListings });
}

export function useVetDocuments(animalId: string | undefined) {
  return useQuery({
    queryKey: listingKeys.docs(animalId ?? ''),
    queryFn: () => api.fetchVetDocuments(animalId as string),
    enabled: Boolean(animalId),
  });
}

export function useAddVetDocument(animalId: string) {
  const userId = useUserId();
  return useMutation({
    mutationFn: ({ file, label }: { file: LocalFile; label: string }) => {
      if (!userId) throw new Error('Necesitas iniciar sesión');
      return api.addVetDocument(userId, animalId, file, label);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingKeys.docs(animalId) }),
  });
}

export function useRemoveVetDocument(animalId: string) {
  return useMutation({
    mutationFn: (doc: Tables<'animal_documents'>) => api.removeVetDocument(doc),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingKeys.docs(animalId) }),
  });
}

export const openVetDocument = api.vetDocumentUrl;
export type { ListingForEdit } from './api';
