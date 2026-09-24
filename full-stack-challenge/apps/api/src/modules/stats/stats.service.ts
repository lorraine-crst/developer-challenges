import type { MachineType } from '@prisma/client';
import { prisma } from '../../lib/prisma';

const SERIES_NAME = 'temperature';

export async function getAverageTemperatureSeriesByType() {
  const readings = await prisma.reading.findMany({
    where: { seriesName: SERIES_NAME },
    select: {
      value: true,
      datetime: true,
      monitoringPoint: {
        select: {
          machine: {
            select: { type: true },
          },
        },
      },
    },
    orderBy: { datetime: 'asc' },
  });

  const buckets: Record<MachineType, Record<string, { sum: number; count: number }>> = {
    Bomba: {},
    Ventilador: {},
  };

  for (const reading of readings) {
    const type = reading.monitoringPoint.machine.type;
    const day = reading.datetime.toISOString().slice(0, 10);

    if (!buckets[type][day]) {
      buckets[type][day] = { sum: 0, count: 0 };
    }

    buckets[type][day].sum += reading.value;
    buckets[type][day].count += 1;
  }

  function toSeries(dayBuckets: Record<string, { sum: number; count: number }>) {
    return Object.entries(dayBuckets)
      .map(([date, { sum, count }]) => ({ date, average: sum / count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  return {
    Bomba: toSeries(buckets.Bomba),
    Ventilador: toSeries(buckets.Ventilador),
  };
}