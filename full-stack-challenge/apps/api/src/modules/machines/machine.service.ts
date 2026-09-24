import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import type { CreateMachineInput, UpdateMachineInput } from './machine.schema';
import { assertSensorCompatibleWithMachine } from '../monitoring-points/sensor.service';

export function findAll() {
  return prisma.machine.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async function ensureNameAvailable(name: string, excludeId?: string) {
  const existing = await prisma.machine.findFirst({
    where: { name, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });

  if (existing) {
    throw new AppError(409, 'machine.duplicateName');
  }
}

export async function create(data: CreateMachineInput) {
  await ensureNameAvailable(data.name);

  return prisma.machine.create({ data });
}

async function ensureExists(id: string) {
  const machine = await prisma.machine.findUnique({ where: { id } });

  if (!machine) {
    throw new AppError(404, 'machine.notFound');
  }

  return machine;
}

export async function update(id: string, data: UpdateMachineInput) {
  const machine = await ensureExists(id);

  if (data.name && data.name !== machine.name) {
    await ensureNameAvailable(data.name, id);
  }

  if (data.type && data.type !== machine.type) {
    const points = await prisma.monitoringPoint.findMany({
      where: { machineId: id },
      include: { sensor: true },
    });

    for (const point of points) {
      if (point.sensor) {
        assertSensorCompatibleWithMachine(data.type, point.sensor.model);
      }
    }
  }

  return prisma.machine.update({ where: { id }, data });
}

export async function remove(id: string) {
  await ensureExists(id);

  await prisma.machine.delete({ where: { id } });
}