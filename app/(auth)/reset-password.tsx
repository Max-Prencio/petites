import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput } from '@/components/form';
import { Button, Header, Screen, Text } from '@/components/ui';
import { useResetPassword } from '@/features/auth';
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';

export default function ResetPasswordScreen() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const reset = useResetPassword();
  const { control, handleSubmit } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: '', password: '', confirmPassword: '' },
  });

  // Al verificar el código se inicia sesión y la navegación protegida lleva al inicio.
  const submit = handleSubmit((input) =>
    reset.mutate(
      { email, input },
      {
        onSuccess: () => toast.success('Contraseña actualizada.'),
        onError: (e) => toast.error(errorMessage(e)),
      },
    ),
  );

  return (
    <Screen scroll>
      <Header />
      <View className="gap-2">
        <Text variant="title">Nueva contraseña</Text>
        <Text className="text-ink-muted">Ingresa el código que enviamos a {email}.</Text>
      </View>
      <FormInput
        control={control}
        name="token"
        label="Código"
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
      />
      <FormInput
        control={control}
        name="password"
        label="Nueva contraseña"
        icon={Lock}
        secureTextEntry
        autoComplete="new-password"
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label="Confirmar contraseña"
        icon={Lock}
        secureTextEntry
      />
      <Button title="Guardar contraseña" size="lg" loading={reset.isPending} onPress={submit} fullWidth />
    </Screen>
  );
}
