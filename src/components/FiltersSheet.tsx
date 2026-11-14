import { useState } from 'react';
import { View } from 'react-native';

import { sexLabel, sizeLabel } from '@/constants/labels';
import { useBreeds, useCategories, useProvinces } from '@/features/animals';
import { defaultFilters, useFiltersStore, type CatalogFilters, type SortOption } from '@/stores/filtersStore';
import { Button } from './ui/Button';
import { ChipGroup } from './ui/Chip';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { Select } from './ui/Select';
import { Text } from './ui/Text';
import { Toggle } from './ui/Toggle';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'age_asc', label: 'Menor edad' },
  { value: 'age_desc', label: 'Mayor edad' },
];

const typeOptions = [
  { value: 'all', label: 'Ambas' },
  { value: 'adoption', label: 'Adopción' },
  { value: 'sale', label: 'Venta' },
] as const;

const ageOptions = [
  { value: 'any', label: 'Cualquiera', min: null, max: null },
  { value: 'baby', label: 'Cachorro (< 1 año)', min: 0, max: 11 },
  { value: 'young', label: 'Joven (1–3)', min: 12, max: 47 },
  { value: 'adult', label: 'Adulto (4–7)', min: 48, max: 95 },
  { value: 'senior', label: 'Senior (8+)', min: 96, max: null },
] as const;

type AgeKey = (typeof ageOptions)[number]['value'];

function ageKeyFor(f: CatalogFilters): AgeKey {
  return ageOptions.find((o) => o.min === f.minAgeMonths && o.max === f.maxAgeMonths)?.value ?? 'any';
}

const toNumber = (t: string): number | null => {
  const clean = t.replace(/[^0-9]/g, '');
  return clean ? Number(clean) : null;
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Se edita un borrador local y se aplica al confirmar, para no recargar el catálogo en cada toque.
// El contenido se monta al abrir, así el borrador parte siempre de los filtros vigentes.
export function FiltersSheet({ visible, onClose }: Props) {
  return visible ? <FiltersSheetContent onClose={onClose} /> : null;
}

function FiltersSheetContent({ onClose }: { onClose: () => void }) {
  const setFilters = useFiltersStore((s) => s.setFilters);
  const [draft, setDraft] = useState<CatalogFilters>(() => useFiltersStore.getState().filters);
  const categories = useCategories();
  const breeds = useBreeds(draft.categoryId);
  const provinces = useProvinces();

  const patch = (p: Partial<CatalogFilters>) => setDraft((d) => ({ ...d, ...p }));
  const isAdoption = draft.listingType === 'adoption';

  return (
    <Modal
      visible
      onClose={onClose}
      title="Filtros"
      footer={
        <View className="flex-row gap-3">
          <Button
            title="Limpiar"
            variant="outline"
            className="flex-1"
            onPress={() => setDraft({ ...defaultFilters, search: draft.search })}
          />
          <Button
            testID="apply-filters"
            title="Ver resultados"
            className="flex-[2]"
            onPress={() => {
              setFilters(draft);
              onClose();
            }}
          />
        </View>
      }
    >
      <ChipGroup
        label="Modalidad"
        options={typeOptions}
        value={draft.listingType ?? 'all'}
        onChange={(v) =>
          patch(
            v === 'adoption'
              ? {
                  listingType: 'adoption',
                  minPrice: null,
                  maxPrice: null,
                  sort: draft.sort.startsWith('price') ? 'recent' : draft.sort,
                }
              : { listingType: v === 'all' ? null : v },
          )
        }
      />
      <Select
        label="Tipo de animal"
        placeholder="Todos"
        clearable
        value={draft.categoryId}
        options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
        onChange={(v) => patch({ categoryId: v, breedId: null })}
      />
      <Select
        label="Raza"
        placeholder={draft.categoryId ? 'Todas' : 'Elige primero el tipo'}
        clearable
        searchable
        disabled={!draft.categoryId}
        value={draft.breedId}
        options={(breeds.data ?? []).map((b) => ({ value: b.id, label: b.name }))}
        onChange={(v) => patch({ breedId: v })}
      />
      <ChipGroup
        label="Edad"
        options={ageOptions}
        value={ageKeyFor(draft)}
        onChange={(v) => {
          const opt = ageOptions.find((o) => o.value === v);
          patch({ minAgeMonths: opt?.min ?? null, maxAgeMonths: opt?.max ?? null });
        }}
      />
      <ChipGroup
        label="Sexo"
        options={[
          { value: 'any', label: 'Cualquiera' },
          ...(['male', 'female'] as const).map((s) => ({ value: s, label: sexLabel[s] })),
        ]}
        value={draft.sex ?? 'any'}
        onChange={(v) => patch({ sex: v === 'any' ? null : v })}
      />
      <ChipGroup
        label="Tamaño"
        options={[
          { value: 'any', label: 'Cualquiera' },
          ...(['small', 'medium', 'large', 'giant'] as const).map((s) => ({ value: s, label: sizeLabel[s] })),
        ]}
        value={draft.size ?? 'any'}
        onChange={(v) => patch({ size: v === 'any' ? null : v })}
      />
      {!isAdoption ? (
        <View className="gap-2">
          <Text variant="label">Precio (RD$)</Text>
          <Text variant="caption">Al filtrar por precio solo verás publicaciones de venta.</Text>
          <View className="flex-row gap-3">
            <Input
              containerClassName="flex-1"
              placeholder="Mínimo"
              keyboardType="numeric"
              value={draft.minPrice?.toString() ?? ''}
              onChangeText={(t) => patch({ minPrice: toNumber(t) })}
            />
            <Input
              containerClassName="flex-1"
              placeholder="Máximo"
              keyboardType="numeric"
              value={draft.maxPrice?.toString() ?? ''}
              onChangeText={(t) => patch({ maxPrice: toNumber(t) })}
            />
          </View>
        </View>
      ) : null}
      <Select
        label="Ubicación"
        placeholder="Todo el país"
        clearable
        searchable
        value={draft.provinceId}
        options={(provinces.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
        onChange={(v) => patch({ provinceId: v })}
      />
      <Toggle label="Vacunado" value={draft.vaccinated} onChange={(v) => patch({ vaccinated: v })} />
      <Toggle label="Desparasitado" value={draft.dewormed} onChange={(v) => patch({ dewormed: v })} />
      <Toggle
        label="Ideal para apartamento"
        value={draft.goodForApartment}
        onChange={(v) => patch({ goodForApartment: v })}
      />
      <ChipGroup
        label="Ordenar por"
        options={isAdoption ? sortOptions.filter((o) => !o.value.startsWith('price')) : sortOptions}
        value={draft.sort}
        onChange={(v) => patch({ sort: v })}
      />
    </Modal>
  );
}
