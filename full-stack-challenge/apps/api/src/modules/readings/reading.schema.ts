import { z } from 'zod';

export const readingInputSchema = z.object({
  seriesName: z.string().min(1, 'Informe o nome da série'),
  datetime: z.coerce.date(),
  value: z.number(),
});

export const createReadingsSchema = z
  .array(readingInputSchema)
  .min(1, 'É necessário enviar ao menos uma leitura')
  .max(5000, 'O lote não pode exceder 5000 leituras');

export type CreateReadingsInput = z.infer<typeof createReadingsSchema>;

export const listReadingsQuerySchema = z.object({
  seriesName: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type ListReadingsQuery = z.infer<typeof listReadingsQuerySchema>;