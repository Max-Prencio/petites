import { buckets, limits } from '@/constants/config';
import { publicUrl } from '@/services/storage';
import { supabase } from '@/services/supabase';
import type { CatalogFilters } from '@/stores/filtersStore';
import type { Breed, Category, ListingCard, Province } from '@/types/models';
import { sanitizeSearch } from '@/utils/search';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchBreeds(categoryId: number): Promise<Breed[]> {
  const { data, error } = await supabase
    .from('breeds')
    .select('*')
    .eq('category_id', categoryId)
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchProvinces(): Promise<Province[]> {
  const { data, error } = await supabase.from('provinces').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function fetchCatalogPage(filters: CatalogFilters, page: number): Promise<ListingCard[]> {
  let query = supabase
    .from('listing_cards')
    .select('*')
    .eq('moderation_status', 'visible')
    .in('status', ['available', 'reserved']);

  const term = sanitizeSearch(filters.search);
  if (term) {
    query = query.or(
      `animal_name.ilike.%${term}%,breed_name.ilike.%${term}%,category_name.ilike.%${term}%,description.ilike.%${term}%`,
    );
  }
  if (filters.listingType) query = query.eq('listing_type', filters.listingType);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.breedId) query = query.eq('breed_id', filters.breedId);
  if (filters.sex) query = query.eq('sex', filters.sex);
  if (filters.size) query = query.eq('size', filters.size);
  if (filters.provinceId) query = query.eq('province_id', filters.provinceId);
  if (filters.minAgeMonths !== null) query = query.gte('age_months', filters.minAgeMonths);
  if (filters.maxAgeMonths !== null) query = query.lte('age_months', filters.maxAgeMonths);
  // Un rango de precio implica publicaciones de venta: nunca mezclar adopciones sin precio.
  if (filters.minPrice !== null) query = query.gte('price', filters.minPrice);
  if (filters.maxPrice !== null) query = query.lte('price', filters.maxPrice);
  if (filters.vaccinated) query = query.eq('vaccinated', 'yes');
  if (filters.dewormed) query = query.eq('dewormed', 'yes');
  if (filters.goodForApartment) query = query.eq('good_for_apartment', true);

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true, nullsFirst: false });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false, nullsFirst: false });
      break;
    case 'age_asc':
      query = query.order('age_months', { ascending: true });
      break;
    case 'age_desc':
      query = query.order('age_months', { ascending: false });
      break;
    default:
      query = query.order('published_at', { ascending: false, nullsFirst: false });
  }

  const from = page * limits.pageSize;
  const { data, error } = await query.order('id').range(from, from + limits.pageSize - 1);
  if (error) throw error;
  return data;
}

export async function fetchListingCardsByIds(ids: string[]): Promise<ListingCard[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('listing_cards').select('*').in('id', ids);
  if (error) throw error;
  return data;
}

const detailSelect = `
  *,
  province:provinces(name),
  owner:profiles!listings_owner_id_fkey(id, full_name, avatar_path, partner_type, city, created_at, province:provinces(name)),
  animal:animals(
    *,
    category:categories(name, slug),
    breed:breeds(name),
    images:animal_images(id, storage_path, sort_order)
  )
`;

export async function fetchListingDetail(id: string) {
  const { data, error } = await supabase.from('listings').select(detailSelect).eq('id', id).single();
  if (error) throw error;
  const images = [...data.animal.images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ ...img, url: publicUrl(buckets.animalPhotos, img.storage_path) ?? '' }));
  return {
    ...data,
    animal: { ...data.animal, images },
    ownerAvatarUrl: publicUrl(buckets.avatars, data.owner.avatar_path),
  };
}

export type ListingDetail = Awaited<ReturnType<typeof fetchListingDetail>>;

export function coverUrl(card: Pick<ListingCard, 'cover_path'>): string | null {
  return publicUrl(buckets.animalPhotos, card.cover_path);
}
