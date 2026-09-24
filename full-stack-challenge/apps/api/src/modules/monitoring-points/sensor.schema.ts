import { z } from 'zod';

export const sensorModelSchema = z.enum(['TcAg', 'TcAs', 'HF+']);

export const associateSensorSchema = z.object({
  serialNumber: z.string().min(1, 'sensor.serialNumberRequired'),
  model: sensorModelSchema,
});

export type AssociateSensorInput = z.infer<typeof associateSensorSchema>;