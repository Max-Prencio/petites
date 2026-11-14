import { z } from 'zod';

export const reportSchema = z.object({
  reason: z.enum(['fraud', 'abuse', 'illegal_species', 'animal_welfare', 'inappropriate', 'spam', 'other']),
  details: z.string().trim().max(1000).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
