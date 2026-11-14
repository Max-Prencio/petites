import type { Enums } from '@/types/database.types';

export const listingTypeLabel: Record<Enums<'listing_type'>, string> = {
  sale: 'En venta',
  adoption: 'En adopción',
};

export const listingStatusLabel: Record<Enums<'listing_status'>, string> = {
  draft: 'Borrador',
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Encontró hogar',
  adopted: 'Adoptado',
  paused: 'Pausado',
  withdrawn: 'Retirado',
};

export const sexLabel: Record<Enums<'animal_sex'>, string> = {
  male: 'Macho',
  female: 'Hembra',
  unknown: 'Sin especificar',
};

export const sizeLabel: Record<Enums<'animal_size'>, string> = {
  small: 'Pequeño',
  medium: 'Mediano',
  large: 'Grande',
  giant: 'Gigante',
};

export const triStateLabel: Record<Enums<'tri_state'>, string> = {
  yes: 'Sí',
  no: 'No',
  unknown: 'No se sabe',
};

export const partnerTypeLabel: Record<Enums<'partner_type'>, string> = {
  individual: 'Particular',
  shelter: 'Refugio / rescatista',
  store: 'Tienda de mascotas',
  vet: 'Veterinaria',
  breeder: 'Criador responsable',
};

export const housingTypeLabel: Record<Enums<'housing_type'>, string> = {
  house: 'Casa',
  apartment: 'Apartamento',
  farm: 'Finca',
  other: 'Otro',
};

export const deliveryMethodLabel: Record<Enums<'delivery_method'>, string> = {
  delivery: 'Traslado pet-friendly a mi hogar',
  pickup: 'Recogida con cita',
};

export const reportReasonLabel: Record<Enums<'report_reason'>, string> = {
  fraud: 'Fraude o estafa',
  abuse: 'Acoso o lenguaje abusivo',
  illegal_species: 'Especie protegida o comercio ilegal',
  animal_welfare: 'Maltrato o explotación animal',
  inappropriate: 'Contenido inapropiado',
  spam: 'Spam',
  other: 'Otro motivo',
};

export const reportStatusLabel: Record<Enums<'report_status'>, string> = {
  open: 'Abierto',
  reviewing: 'En revisión',
  resolved: 'Resuelto',
  dismissed: 'Descartado',
};

export const currencySymbol: Record<Enums<'currency_code'>, string> = {
  DOP: 'RD$',
  USD: 'US$',
};

export const followUpResponseLabel: Record<Enums<'follow_up_response'>, string> = {
  great: '¡Feliz y adaptado!',
  adapting: 'Se está adaptando',
  issues: 'Necesitamos ayuda',
};
