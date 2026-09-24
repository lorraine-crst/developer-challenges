import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import type {
  CreateMonitoringPointInput,
  ListMonitoringPointsQuery,
  UpdateMonitoringPointInput,
} from './monitoring-point.schema';
import { serializeSensor } from './sensor.service';

async function ensureMachineExists(machineId: string) {
  const machine = await prisma.machine.findUnique({ where: { id: machineId } });

  if (!machine) {
    throw new AppError(404, 'machine.notFound');
  }
}

async function ensureExists(id: string) {
  const point = await prisma.monitoringPoint.findUnique({ where: { id } });

  if (!point) {
    throw new AppError(404, 'monitoringPoint.notFound');
  }

  return point;
}

async function ensurePointNameAvailable(machineId: string, name: string, excludeId?: string) {
  const existing = await prisma.monitoringPoint.findFirst({
    where: { machineId, name, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });

  if (existing) {
    throw new AppError(409, 'monitoringPoint.duplicateName');
  }
}

export async function findByMachine(machineId: string) {
  await ensureMachineExists(machineId);

  const points = await prisma.monitoringPoint.findMany({
    where: { machineId },
    include: { sensor: true },
    orderBy: { createdAt: 'desc' },
  });

  return points.map((point) => ({
    ...point,
    sensor: point.sensor ? serializeSensor(point.sensor) : null,
  }));
}

export async function create(machineId: string, data: CreateMonitoringPointInput) {
  await ensureMachineExists(machineId);
  await ensurePointNameAvailable(machineId, data.name);

  return prisma.monitoringPoint.create({
    data: { ...data, machineId },
  });
}

export async function update(id: string, data: UpdateMonitoringPointInput) {
  const point = await ensureExists(id);

  if (data.name && data.name !== point.name) {
    await ensurePointNameAvailable(point.machineId, data.name, id);
  }

  return prisma.monitoringPoint.update({ where: { id }, data });
}

export async function remove(id: string) {
  await ensureExists(id);

  await prisma.monitoringPoint.delete({ where: { id } });
}

function buildOrderBy(sortBy: ListMonitoringPointsQuery['sortBy'], order: 'asc' | 'desc') {
  switch (sortBy) {
    case 'machineName':
      return { machine: { name: order } };
    case 'machineType':
      return { machine: { type: order } };
    case 'pointName':
      return { name: order };
    case 'sensorModel':
      return { sensor: { model: order } };
  }
}

export async function list(query: ListMonitoringPointsQuery) {
  const { page, limit, sortBy, order } = query;

  const orderBy = buildOrderBy(sortBy, order);

  const [rawItems, total] = await Promise.all([
    prisma.monitoringPoint.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: { machine: true, sensor: true },
    }),
    prisma.monitoringPoint.count(),
  ]);

  const items = rawItems.map((point) => ({
    ...point,
    sensor: point.sensor ? serializeSensor(point.sensor) : null,
  }));

  return { items, total, page, limit };
}