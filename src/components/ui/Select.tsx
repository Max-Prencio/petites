import { Check, ChevronDown, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { fadeUp } from '@/constants/motion';
import { colors } from '@/constants/theme';
import { Input } from './Input';
import { Modal } from './Modal';
import { Text } from './Text';

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface Props<T extends string | number> {
  label?: string;
  placeholder?: string;
  value: T | null | undefined;
  options: readonly SelectOption<T>[];
  onChange: (value: T | null) => void;
  error?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  testID?: string;
}

const MAX_VISIBLE = 80;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Búsqueda sin distinguir mayúsculas ni tildes ("pastor aleman" encuentra "Pastor Alemán")
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function Select<T extends string | number>({
  label,
  placeholder = 'Seleccionar',
  value,
  options,
  onChange,
  error,
  searchable = false,
  clearable = false,
  disabled = false,
  testID,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = normalize(query);
    return q ? options.filter((o) => normalize(o.label).includes(q)) : options;
  }, [options, query]);
  // Listas largas (p. ej. 500+ razas de perro): se pintan pocas filas y se invita a buscar
  const visible = filtered.slice(0, MAX_VISIBLE);

  return (
    <View className="gap-1.5">
      {label ? <Text variant="label">{label}</Text> : null}
      <Pressable
        testID={testID}
        disabled={disabled}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={
          label ? `${label}: ${selected?.label ?? placeholder}` : (selected?.label ?? placeholder)
        }
        className={`h-12 flex-row items-center justify-between rounded-2xl border bg-surface px-4 ${
          error ? 'border-danger' : 'border-line'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <Text className={selected ? 'text-ink' : 'text-ink-faint'}>{selected?.label ?? placeholder}</Text>
        <ChevronDown size={18} color={colors.inkMuted} />
      </Pressable>
      {error ? <Text className="text-[12px] text-danger">{error}</Text> : null}

      <Modal visible={open} onClose={() => setOpen(false)} title={label ?? placeholder}>
        {searchable ? (
          <Input icon={Search} placeholder="Buscar..." value={query} onChangeText={setQuery} />
        ) : null}
        <View className="overflow-hidden rounded-2xl bg-surface">
          {clearable && value !== null && value !== undefined ? (
            <Pressable
              className="border-b border-line px-4 py-3.5"
              onPress={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <Text className="text-ink-muted">Quitar selección</Text>
            </Pressable>
          ) : null}
          {visible.map((option, i) => {
            const isSelected = option.value === value;
            return (
              <AnimatedPressable
                entering={fadeUp(i)}
                key={String(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className="flex-row items-center justify-between border-b border-line px-4 py-3.5"
                onPress={() => {
                  onChange(option.value);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <Text className={isSelected ? 'font-semibold text-primary' : ''}>{option.label}</Text>
                {isSelected ? <Check size={18} color={colors.primary} /> : null}
              </AnimatedPressable>
            );
          })}
          {filtered.length === 0 ? <Text className="p-4 text-ink-muted">Sin resultados</Text> : null}
          {filtered.length > MAX_VISIBLE ? (
            <Text className="p-4 text-center text-ink-muted">
              {`Mostrando ${MAX_VISIBLE} de ${filtered.length}. Escribe para encontrar la tuya.`}
            </Text>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
