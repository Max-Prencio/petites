import { z } from 'zod';

export const requestSchema = z
  .object({
    housingType: z.enum(['house', 'apartment', 'farm', 'other']),
    hasYard: z.boolean(),
    otherPets: z.string().trim().max(300).optional(),
    household: z.string().trim().max(300).optional(),
    experience: z.string().trim().min(10, 'Cuéntanos tu experiencia (mínimo 10 caracteres)').max(1000),
    commitment: z
      .string()
      .trim()
      .min(10, '¿Por qué quieres darle un hogar? (mínimo 10 caracteres)')
      .max(1000),
    deliveryMethod: z.enum(['delivery', 'pickup']),
    preferredDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD')
      .optional()
      .or(z.literal('')),
    preferredWindow: z.string().trim().max(120).optional(),
    deliveryAddress: z.string().trim().max(300).optional(),
    contractAccepted: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.deliveryMethod === 'delivery' && (!v.deliveryAddress || v.deliveryAddress.length < 8)) {
      ctx.addIssue({ code: 'custom', path: ['deliveryAddress'], message: 'Indica la dirección de entrega' });
    }
    if (!v.contractAccepted) {
      ctx.addIssue({
        code: 'custom',
        path: ['contractAccepted'],
        message: 'Debes aceptar el acuerdo de tenencia responsable',
      });
    }
  });

export type RequestInput = z.infer<typeof requestSchema>;
