import { z } from 'zod';

export const readingInputSchema = z.object({
  seriesName: z.string().min(1, 'reading.seriesNameRequired'),
  datetime: z.coerce.date(),
  value: z.number(),
});

export const createReadingsSchema = z
  .array(readingInputSchema)
  .min(1, 'reading.atLeastOneRequired')
  .max(5000, 'reading.batchTooLarge');

export type CreateReadingsInput = z.infer<typeof createReadingsSchema>;

export const listReadingsQuerySchema = z.object({
  seriesName: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type ListReadingsQuery = z.infer<typeof listReadingsQuerySchema>;