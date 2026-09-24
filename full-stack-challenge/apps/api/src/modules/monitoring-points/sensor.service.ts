import type { MachineType, Sensor, SensorModel } from '@prisma/client';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import type { AssociateSensorInput } from './sensor.schema';

const INCOMPATIBLE_PUMP_MODELS: SensorModel[] = ['TcAg', 'TcAs'];

export function assertSensorCompatibleWithMachine(
  machineType: MachineType,
  model: SensorModel,
) {
  if (machineType === 'Bomba' && INCOMPATIBLE_PUMP_MODELS.includes(model)) {
    throw new AppError(422, 'sensor.incompatibleWithPump');
  }
}

export function serializeSensor<T extends { model: SensorModel }>(
  sensor: T,
): Omit<T, 'model'> & { model: 'TcAg' | 'TcAs' | 'HF+' } {
  return {
    ...sensor,
    model: sensor.model === 'HF_PLUS' ? 'HF+' : sensor.model,
  };
}

export async function associate(monitoringPointId: string, data: AssociateSensorInput) {
  const point = await prisma.monitoringPoint.findUnique({
    where: { id: monitoringPointId },
    include: { sensor: true, machine: true },
  });

  if (!point) {
    throw new AppError(404, 'monitoringPoint.notFound');
  }

  if (point.sensor) {
    throw new AppError(409, 'sensor.alreadyAssociated');
  }

  const model = data.model === 'HF+' ? 'HF_PLUS' : data.model;

  assertSensorCompatibleWithMachine(point.machine.type, model);

  const existingSerial = await prisma.sensor.findUnique({
    where: { serialNumber: data.serialNumber },
  });

  if (existingSerial) {
    throw new AppError(409, 'sensor.duplicateSerialNumber');
  }

  const sensor: Sensor = await prisma.sensor.create({
    data: {
      serialNumber: data.serialNumber,
      model,
      monitoringPointId,
    },
  });

  return serializeSensor(sensor);
}