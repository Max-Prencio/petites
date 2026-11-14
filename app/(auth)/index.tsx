import { useRouter } from 'expo-router';
import { Heart, MessageCircle, PawPrint, ShieldCheck } from 'lucide-react-native';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { duration, fadeUp } from '@/constants/motion';
import { Button, Screen, Text } from '@/components/ui';
import { brand } from '@/constants/brand';
import { colors } from '@/constants/theme';

const highlights = [
  { icon: PawPrint, text: 'Perfiles claros de cada mascota, con fotos y salud declarada.' },
  { icon: MessageCircle, text: 'Chat directo con refugios, tiendas y cuidadores.' },
  { icon: ShieldCheck, text: 'Un proceso guiado y seguro hasta la puerta de tu hogar.' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <Screen edges={['top', 'bottom']} contentClassName="justify-between px-6 py-6">
      <Animated.View entering={fadeUp(0, duration.slow)} className="mt-6 items-center gap-4">
        <View className="h-24 w-24 items-center justify-center rounded-[32px] bg-primary">
          <PawPrint size={48} color="#FFFFFF" />
        </View>
        <Text variant="display" className="text-[40px] leading-[46px]">
          {brand.name}
        </Text>
        <Text className="text-center text-[17px] text-secondary-muted">{brand.slogan}</Text>
      </Animated.View>

      <View className="gap-4">
        {highlights.map(({ icon: Icon, text }, i) => (
          <Animated.View
            key={text}
            entering={fadeUp(i + 2, duration.slow)}
            className="flex-row items-center gap-3"
          >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface">
              <Icon size={22} color={colors.primary} />
            </View>
            <Text className="flex-1">{text}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={fadeUp(6, duration.slow)} className="gap-3">
        <Button
          testID="go-register"
          title="Crear mi cuenta"
          size="lg"
          icon={Heart}
          onPress={() => router.push('/register')}
          fullWidth
        />
        <Button
          testID="go-login"
          title="Ya tengo cuenta"
          variant="ghost"
          size="lg"
          onPress={() => router.push('/login')}
          fullWidth
        />
      </Animated.View>
    </Screen>
  );
}
