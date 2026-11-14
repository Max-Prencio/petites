import { supabase } from '@/services/supabase';
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from '@/schemas/auth';

// Devuelve si falta verificar el correo con código. Si el proyecto no exige confirmación
// (staging sin dominio de correo), Supabase devuelve la sesión y el guard lleva al onboarding.
export async function signUp(input: RegisterInput): Promise<{ needsVerification: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: `${input.firstName} ${input.lastName}`.trim(), phone: input.phone },
    },
  });
  if (error) throw error;
  return { needsVerification: !data.session };
}

export async function verifyEmailOtp(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
}

export async function resendSignupCode(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
}

export async function signIn(input: LoginInput): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(input.email);
  if (error) throw error;
}

export async function resetPassword(email: string, input: ResetPasswordInput): Promise<void> {
  const { error: otpError } = await supabase.auth.verifyOtp({ email, token: input.token, type: 'recovery' });
  if (otpError) throw otpError;
  const { error } = await supabase.auth.updateUser({ password: input.password });
  if (error) throw error;
}
