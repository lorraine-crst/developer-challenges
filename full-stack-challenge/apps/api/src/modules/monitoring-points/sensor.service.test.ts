import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { prisma } from '../../lib/prisma';
import { assertSensorCompatibleWithMachine, associate } from './sensor.service';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    monitoringPoint: { findUnique: vi.fn() },
    sensor: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

const findUniquePoint = prisma.monitoringPoint.findUnique as unknown as Mock;
const findUniqueSensor = prisma.sensor.findUnique as unknown as Mock;
const createSensor = prisma.sensor.create as unknown as Mock;

beforeEach(() => {
  findUniquePoint.mockReset();
  findUniqueSensor.mockReset();
  createSensor.mockReset();
});

describe('assertSensorCompatibleWithMachine', () => {
  it('rejects TcAg on a Bomba', () => {
    expect(() => assertSensorCompatibleWithMachine('Bomba', 'TcAg')).toThrow();
  });

  it('rejects TcAs on a Bomba', () => {
    expect(() => assertSensorCompatibleWithMachine('Bomba', 'TcAs')).toThrow();
  });

  it('allows HF_PLUS on a Bomba', () => {
    expect(() => assertSensorCompatibleWithMachine('Bomba', 'HF_PLUS')).not.toThrow();
  });

  it('allows TcAg on a Ventilador', () => {
    expect(() => assertSensorCompatibleWithMachine('Ventilador', 'TcAg')).not.toThrow();
  });
});

describe('associate', () => {
  it('rejects associating TcAg to a point on a Bomba', async () => {
    findUniquePoint.mockResolvedValue({
      id: 'point-1',
      sensor: null,
      machine: { type: 'Bomba' },
    });

    await expect(
      associate('point-1', { serialNumber: 'SN-1', model: 'TcAg' }),
    ).rejects.toMatchObject({ statusCode: 422 });

    expect(createSensor).not.toHaveBeenCalled();
  });
});