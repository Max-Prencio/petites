import type { BreedInput, CategoryInput } from '@/schemas/catalog';
import { supabase } from '@/services/supabase';
import type { Enums } from '@/types/models';
import { sanitizeSearch } from '@/utils/search';

export async function fetchReports(status: Enums<'report_status'> | 'all') {
  let query = supabase
    .from('reports')
    .select(
      `*,
       reporter:profiles!reports_reporter_id_fkey(full_name),
       reported_user:profiles!reports_reported_user_id_fkey(id, full_name, suspended_at),
       listing:listings(id, moderation_status, status, owner_id, animal:animals(name))`,
    )
    .order('created_at', { ascending: false })
    .limit(100);
  if (status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export type AdminReport = Awaited<ReturnType<typeof fetchReports>>[number];

export async function resolveReport(id: string, status: Enums<'report_status'>, note: string): Promise<void> {
  const { error } = await supabase.rpc('admin_resolve_report', {
    p_report_id: id,
    p_status: status,
    p_note: note,
  });
  if (error) throw error;
}

export async function readReportedConversation(reportId: string) {
  const { data, error } = await supabase.rpc('admin_read_reported_conversation', { p_report_id: reportId });
  if (error) throw error;
  return data;
}

export async function closeConversation(conversationId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('admin_close_conversation', {
    p_conversation_id: conversationId,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function fetchAdminListings(search: string, onlyHidden: boolean) {
  let query = supabase.from('listing_cards').select('*').order('created_at', { ascending: false }).limit(100);
  if (onlyHidden) query = query.eq('moderation_status', 'hidden');
  const term = sanitizeSearch(search);
  if (term)
    query = query.or(`animal_name.ilike.%${term}%,owner_name.ilike.%${term}%,breed_name.ilike.%${term}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function setListingModeration(
  listingId: string,
  status: Enums<'moderation_status'>,
  reason: string,
): Promise<void> {
  const { error } = await supabase.rpc('admin_set_listing_moderation', {
    p_listing_id: listingId,
    p_status: status,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function fetchUsers(search: string) {
  const { data, error } = await supabase.rpc(
    'admin_list_users',
    search.trim() ? { p_search: search.trim() } : {},
  );
  if (error) throw error;
  return data;
}

export type AdminUser = Awaited<ReturnType<typeof fetchUsers>>[number];

export async function setUserSuspension(userId: string, suspend: boolean, reason: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_user_suspension', {
    p_user_id: userId,
    p_suspend: suspend,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function fetchAllCategories() {
  const { data, error } = await supabase.from('categories').select('*, breeds(*)').order('sort_order');
  if (error) throw error;
  return data.map((c) => ({ ...c, breeds: [...c.breeds].sort((a, b) => a.name.localeCompare(b.name)) }));
}

export type AdminCategory = Awaited<ReturnType<typeof fetchAllCategories>>[number];

export async function createCategory(input: CategoryInput, sortOrder: number): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .insert({ name: input.name, slug: input.slug, icon: input.icon || null, sort_order: sortOrder });
  if (error) throw error;
}

export async function setCategoryActive(id: number, active: boolean): Promise<void> {
  const { error } = await supabase.from('categories').update({ active }).eq('id', id);
  if (error) throw error;
}

export async function createBreed(input: BreedInput): Promise<void> {
  const { error } = await supabase.from('breeds').insert({ category_id: input.categoryId, name: input.name });
  if (error) throw error;
}

export async function setBreedActive(id: number, active: boolean): Promise<void> {
  const { error } = await supabase.from('breeds').update({ active }).eq('id', id);
  if (error) throw error;
}

export async function fetchAuditLog() {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('*, admin:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

export async function fetchAdminStats() {
  const count = async (
    table: 'reports' | 'listings' | 'profiles' | 'requests',
    filter?: [string, string],
  ) => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count: c, error } = await q;
    if (error) throw error;
    return c ?? 0;
  };
  const [openReports, listings, users, requests] = await Promise.all([
    count('reports', ['status', 'open']),
    count('listings'),
    count('profiles'),
    count('requests'),
  ]);
  return { openReports, listings, users, requests };
}
