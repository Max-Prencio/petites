interface MaybePostgrestError {
  message?: unknown;
  code?: unknown;
}

// Traduce errores de Supabase/PostgREST a mensajes legibles para la usuaria.
export function errorMessage(error: unknown): string {
  if (!error) return 'Algo salió mal. Inténtalo de nuevo.';
  const err = error as MaybePostgrestError;
  const message = typeof err.message === 'string' ? err.message : '';
  const code = typeof err.code === 'string' ? err.code : '';

  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (message.includes('Email not confirmed'))
    return 'Primero verifica tu correo con el código que te enviamos.';
  if (message.includes('User already registered')) return 'Ya existe una cuenta con este correo.';
  if (message.includes('Token has expired or is invalid')) return 'El código no es válido o expiró.';
  if (message.toLowerCase().includes('network')) return 'Sin conexión. Revisa tu internet.';
  if (code === '23505') return 'Este registro ya existe.';
  if (code === '42501' || message.includes('row-level security')) {
    return message && !message.includes('row-level security')
      ? message
      : 'No tienes permiso para esta acción.';
  }
  if (code === 'P0001' || code === 'P0002') return message;
  return message || 'Algo salió mal. Inténtalo de nuevo.';
}
