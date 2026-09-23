import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { prisma } from '../../lib/prisma';
import { list } from './monitoring-point.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    monitoringPoint: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const findMany = prisma.monitoringPoint.findMany as unknown as Mock;
const count = prisma.monitoringPoint.count as unknown as Mock;

beforeEach(() => {
  findMany.mockReset();
  count.mockReset();
});

describe('list', () => {
  it('applies skip and take based on page and limit', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await list({ page: 2, limit: 5, sortBy: 'pointName', order: 'asc' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
  });

  it('translates machineName sorting into a relation orderBy', async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);

    await list({ page: 1, limit: 5, sortBy: 'machineName', order: 'desc' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { machine: { name: 'desc' } } }),
    );
  });

  it('returns the total count alongside the page items', async () => {
    findMany.mockResolvedValue([{ id: 'point-1', sensor: null }]);
    count.mockResolvedValue(8);

    const result = await list({ page: 1, limit: 5, sortBy: 'pointName', order: 'asc' });

    expect(result.total).toBe(8);
    expect(result.items).toHaveLength(1);
  });
});