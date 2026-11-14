import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput } from '@/components/form';
import { Button, Header, Screen, Text } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useResendSignupCode, useVerifyEmailOtp } from '@/features/auth';
import { otpSchema, type OtpInput } from '@/schemas/auth';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';

export default function VerifyEmailScreen() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const verify = useVerifyEmailOtp();
  const resend = useResendSignupCode();
  const { control, handleSubmit } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: '' },
  });

  const submit = handleSubmit(({ token }) =>
    verify.mutate(
      { email, token },
      {
        onSuccess: () => toast.success('¡Correo verificado! Bienvenida a Petites.'),
        onError: (e) => toast.error(errorMessage(e)),
      },
    ),
  );

  return (
    <Screen scroll>
      <Header />
      <View className="items-center gap-3">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-light">
          <MailCheck size={36} color={colors.primary} />
        </View>
        <Text variant="title" className="text-center">
          Revisa tu correo
        </Text>
        <Text className="text-center text-ink-muted">
          Enviamos un código de 6 dígitos a <Text className="font-bold">{email}</Text>
        </Text>
      </View>
      <FormInput
        testID="otp-input"
        control={control}
        name="token"
        label="Código de verificación"
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        placeholder="000000"
      />
      <Button
        testID="otp-submit"
        title="Verificar"
        size="lg"
        loading={verify.isPending}
        onPress={submit}
        fullWidth
      />
      <Button
        title="Reenviar código"
        variant="ghost"
        loading={resend.isPending}
        onPress={() =>
          resend.mutate(email, {
            onSuccess: () => toast.info('Te enviamos un nuevo código.'),
            onError: (e) => toast.error(errorMessage(e)),
          })
        }
      />
    </Screen>
  );
}
