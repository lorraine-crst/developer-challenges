import type { Machine } from '@prisma/client';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { prisma } from '../../lib/prisma';
import * as machineService from './machine.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    machine: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const findUnique = prisma.machine.findUnique as unknown as Mock;
const findFirst = prisma.machine.findFirst as unknown as Mock;
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
  findFirst.mockReset();
  create.mockReset();
  update.mockReset();
  remove.mockReset();
});

describe('create', () => {
  it('creates and returns a machine', async () => {
    findFirst.mockResolvedValue(null);
    create.mockResolvedValue(storedMachine);

    const result = await machineService.create({ name: 'Bomba Teste', type: 'Bomba' });

    expect(result).toEqual(storedMachine);
    expect(create).toHaveBeenCalledWith({
      data: { name: 'Bomba Teste', type: 'Bomba' },
    });
  });

  it('throws a 409 when a machine with that name already exists', async () => {
    findFirst.mockResolvedValue(storedMachine);

    await expect(
      machineService.create({ name: 'Bomba Teste', type: 'Bomba' }),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(create).not.toHaveBeenCalled();
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
    findFirst.mockResolvedValue(null);
    update.mockResolvedValue({ ...storedMachine, name: 'New name' });

    const result = await machineService.update('machine-1', { name: 'New name' });

    expect(result.name).toBe('New name');
  });

  it('throws a 409 when renaming to a name already used by another machine', async () => {
    findUnique.mockResolvedValue(storedMachine);
    findFirst.mockResolvedValue({ ...storedMachine, id: 'machine-2', name: 'Outra Máquina' });

    await expect(
      machineService.update('machine-1', { name: 'Outra Máquina' }),
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(update).not.toHaveBeenCalled();
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