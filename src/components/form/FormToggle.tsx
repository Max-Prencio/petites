import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { View } from 'react-native';

import { Text } from '../ui/Text';
import { Toggle } from '../ui/Toggle';

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  testID?: string;
}

export function FormToggle<T extends FieldValues>({ control, name, label, description, testID }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View className="gap-1">
          <Toggle
            testID={testID}
            label={label}
            description={description}
            value={Boolean(field.value)}
            onChange={field.onChange}
          />
          {fieldState.error ? (
            <Text className="text-[12px] text-danger">{fieldState.error.message}</Text>
          ) : null}
        </View>
      )}
    />
  );
}
