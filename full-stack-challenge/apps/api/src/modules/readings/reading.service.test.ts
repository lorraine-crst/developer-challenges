import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { prisma } from '../../lib/prisma';
import { createMany, findMany } from './reading.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    monitoringPoint: { findUnique: vi.fn() },
    reading: { createMany: vi.fn(), findMany: vi.fn() },
  },
}));

const findUniquePoint = prisma.monitoringPoint.findUnique as unknown as Mock;
const createManyReadings = prisma.reading.createMany as unknown as Mock;
const findManyReadings = prisma.reading.findMany as unknown as Mock;

beforeEach(() => {
  findUniquePoint.mockReset();
  createManyReadings.mockReset();
  findManyReadings.mockReset();
});

describe('createMany', () => {
  it('throws a 404 when the monitoring point does not exist', async () => {
    findUniquePoint.mockResolvedValue(null);

    await expect(
      createMany('unknown-point', [
        { seriesName: 'temperature', datetime: new Date(), value: 1 },
      ]),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(createManyReadings).not.toHaveBeenCalled();
  });

  it('creates the batch and returns the count', async () => {
    findUniquePoint.mockResolvedValue({ id: 'point-1' });
    createManyReadings.mockResolvedValue({ count: 2 });

    const result = await createMany('point-1', [
      { seriesName: 'temperature', datetime: new Date('2023-11-07'), value: 24.5 },
      { seriesName: 'temperature', datetime: new Date('2023-11-08'), value: 25.1 },
    ]);

    expect(result).toEqual({ count: 2 });
    expect(createManyReadings).toHaveBeenCalledWith({
      data: [
        {
          monitoringPointId: 'point-1',
          seriesName: 'temperature',
          datetime: new Date('2023-11-07'),
          value: 24.5,
        },
        {
          monitoringPointId: 'point-1',
          seriesName: 'temperature',
          datetime: new Date('2023-11-08'),
          value: 25.1,
        },
      ],
    });
  });
});

describe('findMany', () => {
  it('throws a 400 when seriesName is missing', async () => {
    findUniquePoint.mockResolvedValue({ id: 'point-1' });

    await expect(
      findMany('point-1', { seriesName: undefined, from: undefined, to: undefined }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(findManyReadings).not.toHaveBeenCalled();
  });

  it('filters by monitoringPointId, seriesName and the date range', async () => {
    findUniquePoint.mockResolvedValue({ id: 'point-1' });
    findManyReadings.mockResolvedValue([]);

    const from = new Date('2023-11-07T00:00:00.000Z');
    const to = new Date('2023-11-08T00:00:00.000Z');

    await findMany('point-1', { seriesName: 'temperature', from, to });

    expect(findManyReadings).toHaveBeenCalledWith({
      where: {
        monitoringPointId: 'point-1',
        seriesName: 'temperature',
        datetime: { gte: from, lte: to },
      },
      orderBy: { datetime: 'asc' },
    });
  });
});