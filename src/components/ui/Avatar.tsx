import { Image } from 'expo-image';
import { View } from 'react-native';

import { initials } from '@/utils/format';
import { Text } from './Text';

interface Props {
  uri: string | null;
  name: string;
  size?: number;
}

export function Avatar({ uri, name, size = 44 }: Props) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={style}
        contentFit="cover"
        accessibilityLabel={`Foto de ${name}`}
        transition={150}
      />
    );
  }
  return (
    <View style={style} className="items-center justify-center bg-secondary-light">
      <Text className="font-bold text-secondary" style={{ fontSize: size * 0.36 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
