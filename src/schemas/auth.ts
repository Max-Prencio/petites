import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Ingresa un correo válido');
const password = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[a-zA-Z]/, 'Incluye al menos una letra')
  .regex(/[0-9]/, 'Incluye al menos un número');
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,20}$/, 'Ingresa un teléfono válido');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'Ingresa tu nombre').max(40),
    lastName: z.string().trim().min(2, 'Ingresa tu apellido').max(40),
    email,
    phone: phoneSchema,
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export const otpSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'El código tiene 6 dígitos'),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'El código tiene 6 dígitos'),
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
