import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import type { CreateReadingsInput } from './reading.schema';
import type { ListReadingsQuery } from './reading.schema';

async function ensureMonitoringPointExists(monitoringPointId: string) {
  const point = await prisma.monitoringPoint.findUnique({
    where: { id: monitoringPointId },
  });

  if (!point) {
    throw new AppError(404, 'monitoringPoint.notFound');
  }
}

export async function createMany(monitoringPointId: string, readings: CreateReadingsInput) {
  await ensureMonitoringPointExists(monitoringPointId);

  const result = await prisma.reading.createMany({
    data: readings.map((reading) => ({
      monitoringPointId,
      seriesName: reading.seriesName,
      datetime: reading.datetime,
      value: reading.value,
    })),
  });

  return { count: result.count };
}

export async function findMany(monitoringPointId: string, query: ListReadingsQuery) {
  await ensureMonitoringPointExists(monitoringPointId);

  if (!query.seriesName) {
    throw new AppError(400, 'reading.seriesNameRequired');
  }

  return prisma.reading.findMany({
    where: {
      monitoringPointId,
      seriesName: query.seriesName,
      datetime: {
        gte: query.from,
        lte: query.to,
      },
    },
    orderBy: { datetime: 'asc' },
  });
}

export async function getMetrics(monitoringPointId: string, seriesName: string | undefined) {
  await ensureMonitoringPointExists(monitoringPointId);

  if (!seriesName) {
    throw new AppError(400, 'reading.seriesNameRequired');
  }

  const result = await prisma.reading.aggregate({
    where: { monitoringPointId, seriesName },
    _count: true,
    _min: { value: true },
    _max: { value: true },
    _avg: { value: true },
  });

  return {
    count: result._count,
    min: result._min.value,
    max: result._max.value,
    avg: result._avg.value,
  };
}

export async function count(monitoringPointId: string, seriesName: string | undefined) {
  await ensureMonitoringPointExists(monitoringPointId);

  if (!seriesName) {
    throw new AppError(400, 'reading.seriesNameRequired');
  }

  const total = await prisma.reading.count({
    where: { monitoringPointId, seriesName },
  });

  return { count: total };
}

export async function removeSeries(monitoringPointId: string, seriesName: string | undefined) {
  await ensureMonitoringPointExists(monitoringPointId);

  if (!seriesName) {
    throw new AppError(400, 'reading.seriesNameRequired');
  }

  await prisma.reading.deleteMany({
    where: { monitoringPointId, seriesName },
  });
}