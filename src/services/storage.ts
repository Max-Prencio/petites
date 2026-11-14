import { buckets } from '@/constants/config';
import { supabase } from './supabase';

type PublicBucket = typeof buckets.animalPhotos | typeof buckets.avatars;

export function publicUrl(bucket: PublicBucket, path: string | null | undefined): string | null {
  if (!path) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export interface LocalFile {
  uri: string;
  mimeType: string;
  fileName?: string | null;
}

const extensionByMime: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

export function extensionFor(mimeType: string): string {
  const ext = extensionByMime[mimeType];
  if (!ext) throw new Error('Formato de archivo no permitido');
  return ext;
}

// Sube un archivo local a <bucket>/<userId>/<carpeta>/<uuid>.<ext> y devuelve la ruta.
export async function uploadFile(
  bucket: (typeof buckets)[keyof typeof buckets],
  userId: string,
  folder: string,
  file: LocalFile,
): Promise<string> {
  const ext = extensionFor(file.mimeType);
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const response = await fetch(file.uri);
  const body = await response.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType: file.mimeType,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function removeFiles(
  bucket: (typeof buckets)[keyof typeof buckets],
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}

export async function signedUrl(path: string, expiresIn = 300): Promise<string> {
  const { data, error } = await supabase.storage.from(buckets.vetDocs).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
