import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput } from '@/components/form';
import { Button, Header, Screen, Text } from '@/components/ui';
import { useSignIn } from '@/features/auth';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useSignIn();
  const { control, handleSubmit, getValues } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit((input) =>
    signIn.mutate(input, {
      onError: (e) => {
        const message = errorMessage(e);
        toast.error(message);
        if (message.includes('verifica tu correo')) {
          router.push({ pathname: '/verify-email', params: { email: getValues('email') } });
        }
      },
    }),
  );

  return (
    <Screen scroll>
      <Header />
      <View className="gap-2">
        <Text variant="display">¡Hola de nuevo!</Text>
        <Text className="text-ink-muted">Hay patitas esperando por ti.</Text>
      </View>
      <FormInput
        testID="login-email"
        control={control}
        name="email"
        label="Correo electrónico"
        icon={Mail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="tu@correo.com"
      />
      <FormInput
        testID="login-password"
        control={control}
        name="password"
        label="Contraseña"
        icon={Lock}
        secureTextEntry
        autoComplete="password"
        placeholder="••••••••"
      />
      <Link href="/forgot-password" className="self-end">
        <Text className="font-semibold text-primary">¿Olvidaste tu contraseña?</Text>
      </Link>
      <Button
        testID="login-submit"
        title="Entrar"
        size="lg"
        loading={signIn.isPending}
        onPress={submit}
        fullWidth
      />
      <Link href="/register" className="self-center">
        <Text className="text-ink-muted">
          ¿Nueva en Petites? <Text className="font-bold text-primary">Crea tu cuenta</Text>
        </Text>
      </Link>
    </Screen>
  );
}
