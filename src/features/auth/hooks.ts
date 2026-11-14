import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryClient } from '@/services/queryClient';
import { supabase } from '@/services/supabase';
import { useSessionStore } from '@/stores/sessionStore';
import * as api from './api';

// Sincroniza la sesión de Supabase Auth con el store global.
export function useAuthListener(): void {
  const setSession = useSessionStore((s) => s.setSession);
  const setInitialized = useSessionStore((s) => s.setInitialized);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitialized();
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') queryClient.clear();
    });
    return () => data.subscription.unsubscribe();
  }, [setSession, setInitialized]);
}

export const useSignUp = () => useMutation({ mutationFn: api.signUp });
export const useSignIn = () => useMutation({ mutationFn: api.signIn });
export const useSignOut = () => useMutation({ mutationFn: api.signOut });
export const useRequestPasswordReset = () => useMutation({ mutationFn: api.requestPasswordReset });
export const useResendSignupCode = () => useMutation({ mutationFn: api.resendSignupCode });

export const useVerifyEmailOtp = () =>
  useMutation({
    mutationFn: ({ email, token }: { email: string; token: string }) => api.verifyEmailOtp(email, token),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: ({ email, input }: { email: string; input: Parameters<typeof api.resetPassword>[1] }) =>
      api.resetPassword(email, input),
  });
