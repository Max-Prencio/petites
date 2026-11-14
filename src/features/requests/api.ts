import { buckets } from '@/constants/config';
import type { RequestStatus } from '@/constants/requestStatus';
import type { RequestInput } from '@/schemas/request';
import { publicUrl } from '@/services/storage';
import { supabase } from '@/services/supabase';
import type { FollowUp, RequestEvent, Enums } from '@/types/models';

export async function createRequest(listingId: string, input: RequestInput): Promise<string> {
  const { data, error } = await supabase.rpc('create_request', {
    p_listing_id: listingId,
    p_housing_type: input.housingType,
    p_has_yard: input.hasYard,
    p_other_pets: input.otherPets ?? '',
    p_experience: input.experience,
    p_commitment: input.commitment,
    p_household: input.household ?? '',
    p_delivery_method: input.deliveryMethod,
    // La firma SQL acepta NULL aunque los tipos generados no lo reflejen.
    p_preferred_date: (input.preferredDate || null) as string,
    p_preferred_window: input.preferredWindow ?? '',
    p_delivery_address: input.deliveryAddress ?? '',
    p_contract_accepted: input.contractAccepted,
  });
  if (error) throw error;
  return data;
}

const listSelect = `
  id, status, delivery_method, created_at, updated_at, requester_id, owner_id,
  listing:listings(id, listing_type, animal:animals(name, images:animal_images(storage_path, sort_order))),
  requester:profiles!requests_requester_id_fkey(full_name, avatar_path),
  owner:profiles!requests_owner_id_fkey(full_name, avatar_path)
`;

async function fetchRequestList(column: 'requester_id' | 'owner_id', userId: string) {
  const { data, error } = await supabase
    .from('requests')
    .select(listSelect)
    .eq(column, userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map((r) => {
    const cover = [...r.listing.animal.images].sort((a, b) => a.sort_order - b.sort_order)[0];
    return { ...r, coverUrl: publicUrl(buckets.animalPhotos, cover?.storage_path) };
  });
}

export const fetchMyRequests = (userId: string) => fetchRequestList('requester_id', userId);
export const fetchReceivedRequests = (userId: string) => fetchRequestList('owner_id', userId);
export type RequestListItem = Awaited<ReturnType<typeof fetchMyRequests>>[number];

export async function fetchRequest(id: string) {
  const { data, error } = await supabase
    .from('requests')
    .select(
      `*,
       listing:listings(id, listing_type, status, delivery_window, animal:animals(name, images:animal_images(storage_path, sort_order))),
       requester:profiles!requests_requester_id_fkey(id, full_name, avatar_path, city, created_at),
       owner:profiles!requests_owner_id_fkey(id, full_name, avatar_path, partner_type)`,
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  const cover = [...data.listing.animal.images].sort((a, b) => a.sort_order - b.sort_order)[0];
  return {
    ...data,
    coverUrl: publicUrl(buckets.animalPhotos, cover?.storage_path),
    requesterAvatarUrl: publicUrl(buckets.avatars, data.requester.avatar_path),
    ownerAvatarUrl: publicUrl(buckets.avatars, data.owner.avatar_path),
  };
}

export type RequestDetail = Awaited<ReturnType<typeof fetchRequest>>;

export async function fetchRequestEvents(requestId: string): Promise<RequestEvent[]> {
  const { data, error } = await supabase
    .from('request_events')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  note?: string,
): Promise<void> {
  const { error } = await supabase.rpc('update_request_status', {
    p_request_id: requestId,
    p_status: status,
    p_note: note?.trim() || undefined,
  });
  if (error) throw error;
}

export function subscribeToRequest(requestId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`request:${requestId}:${Date.now()}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'requests', filter: `id=eq.${requestId}` },
      onChange,
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'request_events', filter: `request_id=eq.${requestId}` },
      onChange,
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function fetchMyFollowUps(
  userId: string,
): Promise<(FollowUp & { animalName: string | null })[]> {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*, request:requests(listing:listings(animal:animals(name)))')
    .eq('user_id', userId)
    .order('due_at');
  if (error) throw error;
  return data.map(({ request, ...f }) => ({ ...f, animalName: request.listing.animal.name }));
}

export async function answerFollowUp(
  id: string,
  response: Enums<'follow_up_response'>,
  notes?: string,
): Promise<void> {
  const { error } = await supabase.rpc('answer_follow_up', {
    p_follow_up_id: id,
    p_response: response,
    p_notes: notes?.trim() || undefined,
  });
  if (error) throw error;
}
