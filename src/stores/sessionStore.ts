import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

interface SessionState {
  session: Session | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  initialized: false,
  setSession: (session) => set({ session }),
  setInitialized: () => set({ initialized: true }),
}));

export const selectUserId = (s: SessionState): string | null => s.session?.user.id ?? null;
