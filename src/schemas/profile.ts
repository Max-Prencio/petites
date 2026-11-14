import { z } from 'zod';

import { phoneSchema } from './auth';

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Ingresa tu nombre').max(80),
  phone: phoneSchema,
  provinceId: z.number({ error: 'Elige tu provincia' }).int().positive('Elige tu provincia'),
  city: z.string().trim().min(2, 'Ingresa tu ciudad o sector').max(80),
  addressLine: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(500).optional(),
  partnerType: z.enum(['individual', 'shelter', 'store', 'vet', 'breeder']),
});

export type ProfileInput = z.infer<typeof profileSchema>;
