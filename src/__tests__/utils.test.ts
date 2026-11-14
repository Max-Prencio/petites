import { activeFilterCount, defaultFilters, useFiltersStore } from '@/stores/filtersStore';
import { formatAge, formatPrice, initials } from '@/utils/format';
import { sanitizeSearch } from '@/utils/search';

describe('format', () => {
  it('formatea precios en pesos dominicanos', () => {
    expect(formatPrice(18000, 'DOP')).toMatch(/^RD\$ 18[.,\s]?000$/);
    expect(formatPrice(null, null)).toBe('');
  });

  it('expresa la edad de forma clara', () => {
    expect(formatAge(1, 'years')).toBe('1 año');
    expect(formatAge(8, 'months')).toBe('8 meses');
    expect(formatAge(0, 'months')).toBe('Recién nacido');
  });

  it('obtiene iniciales', () => {
    expect(initials('Refugio Huellitas RD')).toBe('RH');
  });
});

describe('sanitizeSearch', () => {
  it('elimina caracteres de la sintaxis de filtros', () => {
    expect(sanitizeSearch('golden,id.eq.1)')).toBe('golden id eq 1');
  });
});

describe('filtersStore', () => {
  beforeEach(() => useFiltersStore.getState().reset());

  it('al cambiar a adopción limpia el rango de precio', () => {
    const { setFilters, setFilter } = useFiltersStore.getState();
    setFilters({ minPrice: 100, maxPrice: 900, sort: 'price_asc' });
    setFilter('listingType', 'adoption');
    const f = useFiltersStore.getState().filters;
    expect(f.minPrice).toBeNull();
    expect(f.maxPrice).toBeNull();
    expect(f.sort).toBe('recent');
  });

  it('al cambiar de categoría limpia la raza', () => {
    const { setFilter } = useFiltersStore.getState();
    setFilter('breedId', 4);
    setFilter('categoryId', 2);
    expect(useFiltersStore.getState().filters.breedId).toBeNull();
  });

  it('cuenta los filtros activos', () => {
    expect(activeFilterCount(defaultFilters)).toBe(0);
    expect(activeFilterCount({ ...defaultFilters, vaccinated: true, provinceId: 1 })).toBe(2);
  });
});
