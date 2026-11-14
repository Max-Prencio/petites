import { useMutation } from '@tanstack/react-query';

import type { ReportInput } from '@/schemas/report';
import { useSessionStore } from '@/stores/sessionStore';
import * as api from './api';

export function useCreateReport() {
  const userId = useSessionStore((s) => s.session?.user.id ?? null);
  return useMutation({
    mutationFn: ({ target, input }: { target: api.ReportTarget; input: ReportInput }) => {
      if (!userId) throw new Error('Inicia sesión para reportar');
      return api.createReport(userId, target, input);
    },
  });
}

export type { ReportTarget } from './api';
