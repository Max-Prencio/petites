import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(60),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  icon: z.string().trim().max(40).optional(),
});

export const breedSchema = z.object({
  categoryId: z.number().int().positive('Elige la categoría'),
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(80),
});

export const moderationReasonSchema = z.object({
  reason: z.string().trim().min(5, 'Indica el motivo (mínimo 5 caracteres)').max(500),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type BreedInput = z.infer<typeof breedSchema>;
