import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import type { CreateReadingsInput } from './reading.schema';
import type { ListReadingsQuery } from './reading.schema';

async function ensureMonitoringPointExists(monitoringPointId: string) {
  const point = await prisma.monitoringPoint.findUnique({
    where: { id: monitoringPointId },
  });

  if (!point) {
    throw new AppError(404, 'Ponto de monitoramento não encontrado');
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
    throw new AppError(400, 'Informe o nome da série');
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