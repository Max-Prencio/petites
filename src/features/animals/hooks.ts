import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { limits } from '@/constants/config';
import type { CatalogFilters } from '@/stores/filtersStore';
import * as api from './api';

export const catalogKeys = {
  categories: ['catalog', 'categories'] as const,
  breeds: (categoryId: number | null) => ['catalog', 'breeds', categoryId] as const,
  provinces: ['catalog', 'provinces'] as const,
  list: (filters: CatalogFilters) => ['catalog', 'list', filters] as const,
  detail: (id: string) => ['catalog', 'detail', id] as const,
};

export function useCategories() {
  return useQuery({ queryKey: catalogKeys.categories, queryFn: api.fetchCategories, staleTime: 10 * 60_000 });
}

export function useBreeds(categoryId: number | null) {
  return useQuery({
    queryKey: catalogKeys.breeds(categoryId),
    queryFn: () => api.fetchBreeds(categoryId as number),
    enabled: categoryId !== null,
    staleTime: 10 * 60_000,
  });
}

export function useProvinces() {
  return useQuery({ queryKey: catalogKeys.provinces, queryFn: api.fetchProvinces, staleTime: Infinity });
}

export function useCatalog(filters: CatalogFilters) {
  return useInfiniteQuery({
    queryKey: catalogKeys.list(filters),
    queryFn: ({ pageParam }) => api.fetchCatalogPage(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => (lastPage.length < limits.pageSize ? undefined : pages.length),
  });
}

export function useListingDetail(id: string) {
  return useQuery({ queryKey: catalogKeys.detail(id), queryFn: () => api.fetchListingDetail(id) });
}

export { coverUrl, type ListingDetail } from './api';
