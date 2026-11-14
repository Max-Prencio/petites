import { buckets, limits } from '@/constants/config';
import { publicUrl } from '@/services/storage';
import { supabase } from '@/services/supabase';
import type { ConversationSummary, Message } from '@/types/models';

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const { data, error } = await supabase.rpc('my_conversations');
  if (error) throw error;
  return data;
}

export async function startConversation(listingId: string): Promise<string> {
  const { data, error } = await supabase.rpc('start_conversation', { p_listing_id: listingId });
  if (error) throw error;
  return data;
}

export async function fetchConversation(conversationId: string, myId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `id, status, listing_id,
       listing:listings(id, listing_type, status, owner_id, animal:animals(name, images:animal_images(storage_path, sort_order))),
       participants:conversation_participants(user_id, profile:profiles(id, full_name, avatar_path))`,
    )
    .eq('id', conversationId)
    .single();
  if (error) throw error;
  const other = data.participants.find((p) => p.user_id !== myId)?.profile ?? null;
  const cover = [...data.listing.animal.images].sort((a, b) => a.sort_order - b.sort_order)[0];
  const { data: block } = other
    ? await supabase
        .from('user_blocks')
        .select('blocked_id')
        .eq('blocker_id', myId)
        .eq('blocked_id', other.id)
        .maybeSingle()
    : { data: null };
  return {
    id: data.id,
    status: data.status,
    listing: data.listing,
    other,
    otherAvatarUrl: publicUrl(buckets.avatars, other?.avatar_path),
    coverUrl: publicUrl(buckets.animalPhotos, cover?.storage_path),
    iBlockedOther: block !== null,
  };
}

export type ConversationDetail = Awaited<ReturnType<typeof fetchConversation>>;

// Página de mensajes, del más nuevo al más viejo (la lista se renderiza invertida).
export async function fetchMessages(conversationId: string, before?: string): Promise<Message[]> {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limits.messagePageSize);
  if (before) query = query.lt('created_at', before);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content: content.trim() })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_conversation_read', { p_conversation_id: conversationId });
  if (error) throw error;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('user_blocks')
    .upsert({ blocker_id: blockerId, blocked_id: blockedId }, { ignoreDuplicates: true });
  if (error) throw error;
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  if (error) throw error;
}

export function subscribeToConversation(
  conversationId: string,
  onInsert: (message: Message) => void,
): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}:${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload.new as Message),
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToInbox(onChange: () => void): () => void {
  const channel = supabase
    .channel(`inbox:${Date.now()}:${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, onChange)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export function conversationCover(c: Pick<ConversationSummary, 'cover_path'>): string | null {
  return publicUrl(buckets.animalPhotos, c.cover_path);
}

export function avatarUrl(path: string | null): string | null {
  return publicUrl(buckets.avatars, path);
}
