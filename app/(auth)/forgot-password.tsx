import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput } from '@/components/form';
import { Button, Header, Screen, Text } from '@/components/ui';
import { useRequestPasswordReset } from '@/features/auth';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const request = useRequestPasswordReset();
  const { control, handleSubmit } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const submit = handleSubmit((input) =>
    request.mutate(input, {
      onSuccess: () => router.push({ pathname: '/reset-password', params: { email: input.email } }),
      onError: (e) => toast.error(errorMessage(e)),
    }),
  );

  return (
    <Screen scroll>
      <Header />
      <View className="gap-2">
        <Text variant="title">Recupera tu cuenta</Text>
        <Text className="text-ink-muted">Te enviaremos un código para crear una nueva contraseña.</Text>
      </View>
      <FormInput
        control={control}
        name="email"
        label="Correo electrónico"
        icon={Mail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Button title="Enviar código" size="lg" loading={request.isPending} onPress={submit} fullWidth />
    </Screen>
  );
}
