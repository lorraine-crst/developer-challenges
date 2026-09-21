import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3333),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');

  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }

  process.exit(1);
}

export const env = parsed.data;
