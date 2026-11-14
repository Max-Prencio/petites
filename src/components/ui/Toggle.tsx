import { Switch, View } from 'react-native';

import { colors } from '@/constants/theme';
import { Text } from './Text';

interface Props {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  testID?: string;
}

export function Toggle({ label, description, value, onChange, testID }: Props) {
  return (
    <View className="flex-row items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-3">
      <View className="flex-1">
        <Text variant="label">{label}</Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.line }}
        thumbColor="#FFFFFF"
        accessibilityLabel={label}
      />
    </View>
  );
}
