import { z } from 'zod';

export const machineTypeSchema = z.enum(['Bomba', 'Ventilador']);

export const createMachineSchema = z.object({
  name: z.string().min(1, 'Informe o nome da máquina'),
  type: machineTypeSchema,
});

export const updateMachineSchema = createMachineSchema.partial();

export type CreateMachineInput = z.infer<typeof createMachineSchema>;
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>;