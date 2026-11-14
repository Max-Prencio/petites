import { z } from 'zod';

const triState = z.enum(['yes', 'no', 'unknown']);

export const imageAssetSchema = z.object({
  uri: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], { error: 'Solo JPG, PNG o WEBP' }),
  fileSize: z
    .number()
    .max(5 * 1024 * 1024, 'Cada foto debe pesar menos de 5 MB')
    .optional(),
  // Ruta en Storage si la foto ya existía (edición).
  storagePath: z.string().optional(),
});

export const listingSchema = z
  .object({
    listingType: z.enum(['sale', 'adoption']),
    // Animal
    name: z.string().trim().max(60).optional(),
    categoryId: z.number({ error: 'Elige el tipo de animal' }).int().positive('Elige el tipo de animal'),
    breedId: z.number().int().positive().nullable(),
    ageValue: z
      .number({ error: 'Indica la edad' })
      .int('Usa un número entero')
      .min(0, 'La edad no puede ser negativa')
      .max(600),
    ageUnit: z.enum(['months', 'years']),
    sex: z.enum(['male', 'female', 'unknown']),
    size: z.enum(['small', 'medium', 'large', 'giant']),
    description: z.string().trim().min(20, 'Cuéntanos un poco más (mínimo 20 caracteres)').max(2000),
    personalityTags: z.array(z.string().trim().min(2).max(24)).max(8),
    goodForApartment: z.boolean().nullable(),
    // Salud
    vaccinated: triState,
    vaccinationComplete: triState,
    dewormed: triState,
    sterilized: triState,
    hasVetDocuments: z.boolean(),
    medicalNotes: z.string().trim().max(1000).optional(),
    // Publicación
    price: z.number().positive('El precio debe ser mayor que cero').nullable(),
    currency: z.enum(['DOP', 'USD']).nullable(),
    provinceId: z.number({ error: 'Elige la provincia' }).int().positive('Elige la provincia'),
    city: z.string().trim().min(2, 'Indica la ciudad o sector').max(80),
    conditions: z.string().trim().max(1500).optional(),
    contractTerms: z.string().trim().max(4000).optional(),
    transferFee: z.number().min(0, 'No puede ser negativo').nullable(),
    allowsDelivery: z.boolean(),
    allowsPickup: z.boolean(),
    deliveryWindow: z.string().trim().max(120).optional(),
    images: z.array(imageAssetSchema).min(1, 'Agrega al menos una foto').max(8, 'Máximo 8 fotos'),
  })
  .superRefine((v, ctx) => {
    if (v.listingType === 'sale') {
      if (v.price === null) ctx.addIssue({ code: 'custom', path: ['price'], message: 'Indica el precio' });
      if (v.currency === null)
        ctx.addIssue({ code: 'custom', path: ['currency'], message: 'Elige la moneda' });
    }
    if (v.listingType === 'adoption') {
      if (v.price !== null) {
        ctx.addIssue({ code: 'custom', path: ['price'], message: 'Las adopciones no tienen precio' });
      }
      if (!v.conditions || v.conditions.length < 10) {
        ctx.addIssue({
          code: 'custom',
          path: ['conditions'],
          message: 'Describe los requisitos de adopción',
        });
      }
    }
    if (!v.allowsDelivery && !v.allowsPickup) {
      ctx.addIssue({
        code: 'custom',
        path: ['allowsPickup'],
        message: 'Elige al menos una forma de entrega',
      });
    }
  });

export type ListingInput = z.infer<typeof listingSchema>;
export type ImageAsset = z.infer<typeof imageAssetSchema>;

const defaultContract =
  'Me comprometo a brindarle alimento adecuado, agua fresca, atención veterinaria y un espacio seguro. ' +
  'No lo venderé, regalaré ni abandonaré. Si no puedo seguir cuidándolo, lo comunicaré a su cuidador original.';

export const emptyListingForm: ListingInput = {
  listingType: 'adoption',
  name: '',
  categoryId: 0,
  breedId: null,
  ageValue: 0,
  ageUnit: 'months',
  sex: 'unknown',
  size: 'small',
  description: '',
  personalityTags: [],
  goodForApartment: null,
  vaccinated: 'unknown',
  vaccinationComplete: 'unknown',
  dewormed: 'unknown',
  sterilized: 'unknown',
  hasVetDocuments: false,
  medicalNotes: '',
  price: null,
  currency: null,
  provinceId: 0,
  city: '',
  conditions: '',
  contractTerms: defaultContract,
  transferFee: null,
  allowsDelivery: true,
  allowsPickup: true,
  deliveryWindow: '',
  images: [],
};
