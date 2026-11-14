import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Select, type SelectOption } from '../ui/Select';

interface Props<T extends FieldValues, V extends string | number> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  options: readonly SelectOption<V>[];
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function FormSelect<T extends FieldValues, V extends string | number>({
  control,
  name,
  ...props
}: Props<T, V>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Select<V>
          {...props}
          value={field.value as V | null}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
