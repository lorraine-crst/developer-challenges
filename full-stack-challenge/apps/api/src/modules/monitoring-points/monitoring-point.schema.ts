import { z } from 'zod';

export const createMonitoringPointSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const updateMonitoringPointSchema = createMonitoringPointSchema.partial();

export type CreateMonitoringPointInput = z.infer<typeof createMonitoringPointSchema>;
export type UpdateMonitoringPointInput = z.infer<typeof updateMonitoringPointSchema>;

export const SORTABLE_FIELDS = ['machineName', 'machineType', 'pointName', 'sensorModel'] as const;

export const listMonitoringPointsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(5),
  sortBy: z.enum(SORTABLE_FIELDS).default('pointName'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type ListMonitoringPointsQuery = z.infer<typeof listMonitoringPointsQuerySchema>;