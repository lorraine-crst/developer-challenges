import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { prisma } from '../../lib/prisma';
import * as monitoringPointService from './monitoring-point.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    monitoringPoint: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    machine: {
      findUnique: vi.fn(),
    },
  },
}));

const findMany = prisma.monitoringPoint.findMany as unknown as Mock;
const count = prisma.monitoringPoint.count as unknown as Mock;
const pointFindUnique = prisma.monitoringPoint.findUnique as unknown as Mock;
const pointFindFirst = prisma.monitoringPoint.findFirst as unknown as Mock;
const pointCreate = prisma.monitoringPoint.create as unknown as Mock;
const pointUpdate = prisma.monitoringPoint.update as unknown as Mock;
const machineFindUnique = prisma.machine.findUnique as unknown as Mock;

const storedPoint = {
  id: 'point-1',
  name: 'Mancal Dianteiro',
  machineId: 'machine-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  findMany.mockReset();
  count.mockReset();
  pointFindUnique.mockReset();
  pointFindFirst.mockReset();
  pointCreate.mockReset();
  pointUpdate.mockReset();
  machineFindUnique.mockReset();
});

describe('list', () => {
  it('applies skip and take based on page and limit', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await monitoringPointService.list({ page: 2, limit: 5, sortBy: 'pointName', order: 'asc' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
  });

  it('translates machineName sorting into a relation orderBy', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await monitoringPointService.list({ page: 1, limit: 5, sortBy: 'machineName', order: 'desc' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { machine: { name: 'desc' } } }),
    );
  });

  it('returns the total count alongside the page items', async () => {
    findMany.mockResolvedValue([{ id: 'point-1', sensor: null }]);
    count.mockResolvedValue(8);

    const result = await monitoringPointService.list({
      page: 1,
      limit: 5,
      sortBy: 'pointName',
      order: 'asc',
    });

    expect(result.total).toBe(8);
    expect(result.items).toHaveLength(1);
  });
});

describe('create', () => {
  it('creates a point when the machine exists and the name is free', async () => {
    machineFindUnique.mockResolvedValue({ id: 'machine-1' });
    pointFindFirst.mockResolvedValue(null);
    pointCreate.mockResolvedValue(storedPoint);

    const result = await monitoringPointService.create('machine-1', { name: 'Mancal Dianteiro' });

    expect(result).toEqual(storedPoint);
  });

  it('throws a 404 when the machine does not exist', async () => {
    machineFindUnique.mockResolvedValue(null);

    await expect(
      monitoringPointService.create('unknown-machine', { name: 'Mancal Dianteiro' }),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(pointCreate).not.toHaveBeenCalled();
  });

  it('throws a 409 when a point with that name already exists on the machine', async () => {
    machineFindUnique.mockResolvedValue({ id: 'machine-1' });
    pointFindFirst.mockResolvedValue(storedPoint);

    await expect(
      monitoringPointService.create('machine-1', { name: 'Mancal Dianteiro' }),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(pointCreate).not.toHaveBeenCalled();
  });
});

describe('update', () => {
  it('throws a 404 when the point does not exist', async () => {
    pointFindUnique.mockResolvedValue(null);

    await expect(
      monitoringPointService.update('unknown-id', { name: 'New name' }),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(pointUpdate).not.toHaveBeenCalled();
  });

  it('updates the point when the new name is free within the machine', async () => {
    pointFindUnique.mockResolvedValue(storedPoint);
    pointFindFirst.mockResolvedValue(null);
    pointUpdate.mockResolvedValue({ ...storedPoint, name: 'New name' });

    const result = await monitoringPointService.update('point-1', { name: 'New name' });

    expect(result.name).toBe('New name');
  });

  it('throws a 409 when renaming to a name already used on the same machine', async () => {
    pointFindUnique.mockResolvedValue(storedPoint);
    pointFindFirst.mockResolvedValue({ ...storedPoint, id: 'point-2', name: 'Mancal Traseiro' });

    await expect(
      monitoringPointService.update('point-1', { name: 'Mancal Traseiro' }),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(pointUpdate).not.toHaveBeenCalled();
  });
});