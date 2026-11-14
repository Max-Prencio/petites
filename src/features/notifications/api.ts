import { supabase } from '@/services/supabase';
import type { Notification } from '@/types/models';

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}

export async function markNotificationsRead(userId: string, ids?: string[]): Promise<void> {
  let query = supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (ids) query = query.in('id', ids);
  const { error } = await query;
  if (error) throw error;
}

export async function savePushToken(
  userId: string,
  token: string,
  platform: 'ios' | 'android' | 'web',
): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { token, user_id: userId, platform, updated_at: new Date().toISOString() },
      { onConflict: 'token' },
    );
  if (error) throw error;
}

export function subscribeToNotifications(userId: string, onInsert: (n: Notification) => void): () => void {
  const channel = supabase
    .channel(`notifications:${userId}:${Date.now()}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new as Notification),
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
