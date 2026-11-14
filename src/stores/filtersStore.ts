import { create } from 'zustand';

import type { Enums } from '@/types/database.types';

export type SortOption = 'recent' | 'price_asc' | 'price_desc' | 'age_asc' | 'age_desc';

export interface CatalogFilters {
  search: string;
  listingType: Enums<'listing_type'> | null;
  categoryId: number | null;
  breedId: number | null;
  sex: Enums<'animal_sex'> | null;
  size: Enums<'animal_size'> | null;
  minAgeMonths: number | null;
  maxAgeMonths: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  provinceId: number | null;
  vaccinated: boolean;
  dewormed: boolean;
  goodForApartment: boolean;
  sort: SortOption;
}

export const defaultFilters: CatalogFilters = {
  search: '',
  listingType: null,
  categoryId: null,
  breedId: null,
  sex: null,
  size: null,
  minAgeMonths: null,
  maxAgeMonths: null,
  minPrice: null,
  maxPrice: null,
  provinceId: null,
  vaccinated: false,
  dewormed: false,
  goodForApartment: false,
  sort: 'recent',
};

interface FiltersState {
  filters: CatalogFilters;
  setFilter: <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => void;
  setFilters: (patch: Partial<CatalogFilters>) => void;
  reset: () => void;
}

// Los filtros viven en un store global para conservarse al volver desde una ficha.
export const useFiltersStore = create<FiltersState>((set) => ({
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((state) => {
      const next = { ...state.filters, [key]: value };
      // Si cambia la categoría, la raza anterior deja de ser válida.
      if (key === 'categoryId') next.breedId = null;
      // Adopción no tiene precio: limpiar rango.
      if (key === 'listingType' && value === 'adoption') {
        next.minPrice = null;
        next.maxPrice = null;
        if (next.sort === 'price_asc' || next.sort === 'price_desc') next.sort = 'recent';
      }
      return { filters: next };
    }),
  setFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
  reset: () => set({ filters: defaultFilters }),
}));

export function activeFilterCount(f: CatalogFilters): number {
  let count = 0;
  if (f.listingType) count++;
  if (f.categoryId) count++;
  if (f.breedId) count++;
  if (f.sex) count++;
  if (f.size) count++;
  if (f.minAgeMonths !== null || f.maxAgeMonths !== null) count++;
  if (f.minPrice !== null || f.maxPrice !== null) count++;
  if (f.provinceId) count++;
  if (f.vaccinated) count++;
  if (f.dewormed) count++;
  if (f.goodForApartment) count++;
  return count;
}
