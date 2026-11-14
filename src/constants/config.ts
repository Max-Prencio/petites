export const limits = {
  maxListingImages: 8,
  maxImageBytes: 5 * 1024 * 1024,
  maxAvatarBytes: 2 * 1024 * 1024,
  maxVetDocBytes: 10 * 1024 * 1024,
  pageSize: 20,
  messagePageSize: 50,
} as const;

export const buckets = {
  animalPhotos: 'animal-photos',
  avatars: 'avatars',
  vetDocs: 'vet-docs',
} as const;
