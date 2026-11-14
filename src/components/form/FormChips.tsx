import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { ChipGroup } from '../ui/Chip';

interface Props<T extends FieldValues, V extends string> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  options: readonly { value: V; label: string }[];
}

export function FormChips<T extends FieldValues, V extends string>({
  control,
  name,
  label,
  options,
}: Props<T, V>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <ChipGroup<V>
          label={label}
          options={options}
          value={field.value as V}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
