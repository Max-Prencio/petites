import { z } from 'zod';

export const messageSchema = z.object({
  content: z.string().trim().min(1, 'Escribe un mensaje').max(2000, 'Máximo 2000 caracteres'),
});

export type MessageInput = z.infer<typeof messageSchema>;
