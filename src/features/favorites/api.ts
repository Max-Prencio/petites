import { supabase } from '@/services/supabase';
import type { ListingCard } from '@/types/models';

export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('listing_id').eq('user_id', userId);
  if (error) throw error;
  return data.map((f) => f.listing_id);
}

export interface FavoriteItem {
  listingId: string;
  savedAt: string;
  // null si la publicación ya no es visible (retirada o moderada).
  card: ListingCard | null;
}

export async function fetchFavorites(userId: string): Promise<FavoriteItem[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('listing_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const ids = data.map((f) => f.listing_id);
  if (ids.length === 0) return [];
  const { data: cards, error: cardsError } = await supabase.from('listing_cards').select('*').in('id', ids);
  if (cardsError) throw cardsError;
  const byId = new Map(cards.map((c) => [c.id, c]));
  return data.map((f) => ({
    listingId: f.listing_id,
    savedAt: f.created_at,
    card: byId.get(f.listing_id) ?? null,
  }));
}

export async function addFavorite(userId: string, listingId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .upsert(
      { user_id: userId, listing_id: listingId },
      { onConflict: 'user_id,listing_id', ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function removeFavorite(userId: string, listingId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);
  if (error) throw error;
}
