import { buckets } from '@/constants/config';
import type { ImageAsset, ListingInput } from '@/schemas/listing';
import { publicUrl, removeFiles, signedUrl, uploadFile, type LocalFile } from '@/services/storage';
import { supabase } from '@/services/supabase';
import type { Enums, ListingCard, Tables } from '@/types/models';

function animalPayload(input: ListingInput) {
  return {
    category_id: input.categoryId,
    breed_id: input.breedId,
    name: input.name?.trim() || null,
    age_value: input.ageValue,
    age_unit: input.ageUnit,
    sex: input.sex,
    size: input.size,
    vaccinated: input.vaccinated,
    vaccination_complete: input.vaccinated === 'yes' ? input.vaccinationComplete : 'unknown',
    dewormed: input.dewormed,
    sterilized: input.sterilized,
    has_vet_documents: input.hasVetDocuments,
    medical_notes: input.medicalNotes?.trim() || null,
    description: input.description,
    personality_tags: input.personalityTags,
    good_for_apartment: input.goodForApartment,
  } as const;
}

function listingPayload(input: ListingInput) {
  const isSale = input.listingType === 'sale';
  return {
    listing_type: input.listingType,
    price: isSale ? input.price : null,
    currency: isSale ? input.currency : null,
    province_id: input.provinceId,
    city: input.city,
    conditions: input.conditions?.trim() || null,
    contract_terms: input.contractTerms?.trim() || null,
    transfer_fee: input.transferFee,
    allows_delivery: input.allowsDelivery,
    allows_pickup: input.allowsPickup,
    delivery_window: input.deliveryWindow?.trim() || null,
  } as const;
}

async function uploadNewImages(userId: string, animalId: string, images: ImageAsset[]): Promise<string[]> {
  const uploaded: string[] = [];
  try {
    for (const [index, img] of images.entries()) {
      // Sin upsert: la BD solo permite actualizar sort_order (grant por columna), así que
      // las fotos existentes se reordenan y las nuevas se insertan.
      if (img.storagePath) {
        const { error } = await supabase
          .from('animal_images')
          .update({ sort_order: index })
          .eq('animal_id', animalId)
          .eq('storage_path', img.storagePath);
        if (error) throw error;
        continue;
      }
      const path = await uploadFile(buckets.animalPhotos, userId, animalId, img);
      uploaded.push(path);
      const { error } = await supabase
        .from('animal_images')
        .insert({ animal_id: animalId, storage_path: path, sort_order: index });
      if (error) throw error;
    }
    return uploaded;
  } catch (e) {
    await removeFiles(buckets.animalPhotos, uploaded).catch(() => undefined);
    throw e;
  }
}

export async function createListing(
  userId: string,
  input: ListingInput,
  status: Enums<'listing_status'>,
): Promise<string> {
  const { data: animal, error: animalError } = await supabase
    .from('animals')
    .insert({ owner_id: userId, ...animalPayload(input) })
    .select('id')
    .single();
  if (animalError) throw animalError;

  try {
    await uploadNewImages(userId, animal.id, input.images);
    const { data: listing, error } = await supabase
      .from('listings')
      .insert({ owner_id: userId, animal_id: animal.id, status, ...listingPayload(input) })
      .select('id')
      .single();
    if (error) throw error;
    return listing.id;
  } catch (e) {
    // Sin publicación no debe quedar un animal huérfano (las imágenes caen en cascada).
    await supabase.from('animals').delete().eq('id', animal.id);
    throw e;
  }
}

export async function updateListing(userId: string, listingId: string, input: ListingInput): Promise<void> {
  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('animal_id, animal:animals(images:animal_images(storage_path))')
    .eq('id', listingId)
    .single();
  if (fetchError) throw fetchError;

  const { error: animalError } = await supabase
    .from('animals')
    .update(animalPayload(input))
    .eq('id', listing.animal_id);
  if (animalError) throw animalError;

  const keep = new Set(input.images.map((i) => i.storagePath).filter((p): p is string => Boolean(p)));
  const removed = listing.animal.images.map((i) => i.storage_path).filter((p) => !keep.has(p));
  if (removed.length > 0) {
    const { error } = await supabase
      .from('animal_images')
      .delete()
      .eq('animal_id', listing.animal_id)
      .in('storage_path', removed);
    if (error) throw error;
    await removeFiles(buckets.animalPhotos, removed).catch(() => undefined);
  }
  await uploadNewImages(userId, listing.animal_id, input.images);

  const { error } = await supabase.from('listings').update(listingPayload(input)).eq('id', listingId);
  if (error) throw error;
}

export async function setListingStatus(listingId: string, status: Enums<'listing_status'>): Promise<void> {
  const { error } = await supabase.from('listings').update({ status }).eq('id', listingId);
  if (error) throw error;
}

export async function deleteListing(listingId: string): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from('listings')
    .select(
      'animal_id, animal:animals(images:animal_images(storage_path), documents:animal_documents(storage_path))',
    )
    .eq('id', listingId)
    .single();
  if (fetchError) throw fetchError;
  // Borrar el animal elimina en cascada la publicación, imágenes y documentos.
  const { error } = await supabase.from('animals').delete().eq('id', data.animal_id);
  if (error) throw error;
  await removeFiles(
    buckets.animalPhotos,
    data.animal.images.map((i) => i.storage_path),
  ).catch(() => undefined);
  await removeFiles(
    buckets.vetDocs,
    data.animal.documents.map((d) => d.storage_path),
  ).catch(() => undefined);
}

export async function fetchMyListings(userId: string): Promise<ListingCard[]> {
  const { data, error } = await supabase
    .from('listing_cards')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchListingForEdit(listingId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*, animal:animals(*, images:animal_images(storage_path, sort_order))')
    .eq('id', listingId)
    .single();
  if (error) throw error;
  const images = [...data.animal.images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map<ImageAsset>((img) => ({
      uri: publicUrl(buckets.animalPhotos, img.storage_path) ?? '',
      mimeType: 'image/jpeg',
      storagePath: img.storage_path,
    }));
  return { ...data, images };
}

export type ListingForEdit = Awaited<ReturnType<typeof fetchListingForEdit>>;

// Documentos veterinarios (privados)
export async function fetchVetDocuments(animalId: string): Promise<Tables<'animal_documents'>[]> {
  const { data, error } = await supabase
    .from('animal_documents')
    .select('*')
    .eq('animal_id', animalId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addVetDocument(
  userId: string,
  animalId: string,
  file: LocalFile,
  label: string,
): Promise<void> {
  const path = await uploadFile(buckets.vetDocs, userId, animalId, file);
  const { error } = await supabase
    .from('animal_documents')
    .insert({ animal_id: animalId, storage_path: path, label });
  if (error) {
    await removeFiles(buckets.vetDocs, [path]).catch(() => undefined);
    throw error;
  }
  await supabase.from('animals').update({ has_vet_documents: true }).eq('id', animalId);
}

export async function removeVetDocument(doc: Tables<'animal_documents'>): Promise<void> {
  const { error } = await supabase.from('animal_documents').delete().eq('id', doc.id);
  if (error) throw error;
  await removeFiles(buckets.vetDocs, [doc.storage_path]).catch(() => undefined);
}

export const vetDocumentUrl = (path: string) => signedUrl(path);
