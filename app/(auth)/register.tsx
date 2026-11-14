import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Lock, Mail, Phone, User } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormInput } from '@/components/form';
import { Button, Header, Screen, Text } from '@/components/ui';
import { useSignUp } from '@/features/auth';
import { registerSchema, type RegisterInput } from '@/schemas/auth';
import { toast } from '@/stores/uiStore';
import { errorMessage } from '@/utils/errors';

export default function RegisterScreen() {
  const router = useRouter();
  const signUp = useSignUp();
  const { control, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit((input) =>
    signUp.mutate(input, {
      onSuccess: ({ needsVerification }) => {
        if (needsVerification) router.replace({ pathname: '/verify-email', params: { email: input.email } });
      },
      onError: (e) => toast.error(errorMessage(e)),
    }),
  );

  return (
    <Screen scroll>
      <Header />
      <View className="gap-2">
        <Text variant="display">Crea tu cuenta</Text>
        <Text className="text-ink-muted">Una sola cuenta para adoptar, comprar o publicar.</Text>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormInput
            testID="register-first-name"
            control={control}
            name="firstName"
            label="Nombre"
            icon={User}
            autoComplete="given-name"
          />
        </View>
        <View className="flex-1">
          <FormInput
            testID="register-last-name"
            control={control}
            name="lastName"
            label="Apellido"
            autoComplete="family-name"
          />
        </View>
      </View>
      <FormInput
        testID="register-email"
        control={control}
        name="email"
        label="Correo electrónico"
        icon={Mail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <FormInput
        testID="register-phone"
        control={control}
        name="phone"
        label="Teléfono"
        icon={Phone}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="+1 809 000 0000"
        hint="Es privado: nunca se muestra en tu perfil público."
      />
      <FormInput
        testID="register-password"
        control={control}
        name="password"
        label="Contraseña"
        icon={Lock}
        secureTextEntry
        autoComplete="new-password"
        hint="Mínimo 8 caracteres, con letras y números."
      />
      <FormInput
        testID="register-confirm"
        control={control}
        name="confirmPassword"
        label="Confirmar contraseña"
        icon={Lock}
        secureTextEntry
        autoComplete="new-password"
      />
      <Button
        testID="register-submit"
        title="Crear cuenta"
        size="lg"
        loading={signUp.isPending}
        onPress={submit}
        fullWidth
      />
      <Text variant="caption" className="text-center">
        Al continuar aceptas tratar a cada animal con respeto y cumplir las normas de la comunidad.
      </Text>
      <Link href="/login" className="self-center">
        <Text className="text-ink-muted">
          ¿Ya tienes cuenta? <Text className="font-bold text-primary">Entrar</Text>
        </Text>
      </Link>
    </Screen>
  );
}
