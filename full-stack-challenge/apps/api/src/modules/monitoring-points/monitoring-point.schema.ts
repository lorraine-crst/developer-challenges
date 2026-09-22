import { z } from 'zod';

export const createMonitoringPointSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const updateMonitoringPointSchema = createMonitoringPointSchema.partial();

export type CreateMonitoringPointInput = z.infer<typeof createMonitoringPointSchema>;
export type UpdateMonitoringPointInput = z.infer<typeof updateMonitoringPointSchema>;