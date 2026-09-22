import type { Machine } from '@prisma/client';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { prisma } from '../../lib/prisma';
import * as machineService from './machine.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    machine: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const findUnique = prisma.machine.findUnique as unknown as Mock;
const create = prisma.machine.create as unknown as Mock;
const update = prisma.machine.update as unknown as Mock;
const remove = prisma.machine.delete as unknown as Mock;

const storedMachine: Machine = {
  id: 'machine-1',
  name: 'Bomba Teste',
  type: 'Bomba',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  findUnique.mockReset();
  create.mockReset();
  update.mockReset();
  remove.mockReset();
});

describe('create', () => {
  it('creates and returns a machine', async () => {
    create.mockResolvedValue(storedMachine);

    const result = await machineService.create({ name: 'Bomba Teste', type: 'Bomba' });

    expect(result).toEqual(storedMachine);
    expect(create).toHaveBeenCalledWith({
      data: { name: 'Bomba Teste', type: 'Bomba' },
    });
  });
});

describe('update', () => {
  it('throws a 404 when the machine does not exist', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      machineService.update('unknown-id', { name: 'New name' }),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(update).not.toHaveBeenCalled();
  });

  it('updates an existing machine', async () => {
    findUnique.mockResolvedValue(storedMachine);
    update.mockResolvedValue({ ...storedMachine, name: 'New name' });

    const result = await machineService.update('machine-1', { name: 'New name' });

    expect(result.name).toBe('New name');
  });
});

describe('remove', () => {
  it('throws a 404 when the machine does not exist', async () => {
    findUnique.mockResolvedValue(null);

    await expect(machineService.remove('unknown-id')).rejects.toMatchObject({
      statusCode: 404,
    });

    expect(remove).not.toHaveBeenCalled();
  });

  it('deletes an existing machine', async () => {
    findUnique.mockResolvedValue(storedMachine);
    remove.mockResolvedValue(storedMachine);

    await machineService.remove('machine-1');

    expect(remove).toHaveBeenCalledWith({ where: { id: 'machine-1' } });
  });
});