import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { LocalFile } from './storage';

// Las fotos del teléfono pesan 3–8 MB; para tarjetas y fichas basta ~1280 px en JPEG.
// Reduce la subida y, sobre todo, lo que descargan quienes navegan el catálogo.
export async function compressImage(file: LocalFile, maxSide = 1280, quality = 0.72): Promise<LocalFile> {
  const context = ImageManipulator.manipulate(file.uri);
  const source = await context.renderAsync();
  if (Math.max(source.width, source.height) > maxSide) {
    context.resize(source.width >= source.height ? { width: maxSide } : { height: maxSide });
  }
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: quality, format: SaveFormat.JPEG });
  return { uri: result.uri, mimeType: 'image/jpeg', fileName: file.fileName ?? null };
}
