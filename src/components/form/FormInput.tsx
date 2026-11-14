import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Input, type InputProps } from '../ui/Input';

interface Props<T extends FieldValues> extends Omit<InputProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<T>;
  name: FieldPath<T>;
  numeric?: boolean;
}

// Input enlazado a React Hook Form con el error integrado.
export function FormInput<T extends FieldValues>({ control, name, numeric = false, ...props }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const raw: unknown = field.value;
        const text = raw === null || raw === undefined ? '' : String(raw);
        return (
          <Input
            {...props}
            value={text}
            onBlur={field.onBlur}
            keyboardType={numeric ? 'numeric' : props.keyboardType}
            onChangeText={(t) => {
              if (!numeric) return field.onChange(t);
              const clean = t.replace(/[^0-9.]/g, '');
              field.onChange(clean === '' ? null : Number(clean));
            }}
            error={fieldState.error?.message}
          />
        );
      }}
    />
  );
}
