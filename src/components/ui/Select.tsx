import { Check, ChevronDown, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

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
  const filtered = useMemo(
    () => (query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options),
    [options, query],
  );

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
          {filtered.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
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
              </Pressable>
            );
          })}
          {filtered.length === 0 ? <Text className="p-4 text-ink-muted">Sin resultados</Text> : null}
        </View>
      </Modal>
    </View>
  );
}
