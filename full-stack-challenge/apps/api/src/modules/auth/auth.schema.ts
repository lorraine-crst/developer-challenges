import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Formato de e-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

export type LoginInput = z.infer<typeof loginSchema>;