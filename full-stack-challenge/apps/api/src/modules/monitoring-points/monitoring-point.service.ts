import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import type {
  CreateMonitoringPointInput,
  ListMonitoringPointsQuery,
  UpdateMonitoringPointInput,
} from './monitoring-point.schema';

async function ensureMachineExists(machineId: string) {
  const machine = await prisma.machine.findUnique({ where: { id: machineId } });

  if (!machine) {
    throw new AppError(404, 'Machine not found');
  }
}

async function ensureExists(id: string) {
  const point = await prisma.monitoringPoint.findUnique({ where: { id } });

  if (!point) {
    throw new AppError(404, 'Monitoring point not found');
  }

  return point;
}

export async function findByMachine(machineId: string) {
  await ensureMachineExists(machineId);

  return prisma.monitoringPoint.findMany({
    where: { machineId },
    include: { sensor: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function create(machineId: string, data: CreateMonitoringPointInput) {
  await ensureMachineExists(machineId);

  return prisma.monitoringPoint.create({
    data: { ...data, machineId },
  });
}

export async function update(id: string, data: UpdateMonitoringPointInput) {
  await ensureExists(id);

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

  const [items, total] = await Promise.all([
    prisma.monitoringPoint.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: { machine: true, sensor: true },
    }),
    prisma.monitoringPoint.count(),
  ]);

  return { items, total, page, limit };
}