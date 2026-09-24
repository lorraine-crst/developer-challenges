import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('auth.invalidEmailFormat'),
  password: z.string().min(1, 'auth.passwordRequired'),
});

export type LoginInput = z.infer<typeof loginSchema>;