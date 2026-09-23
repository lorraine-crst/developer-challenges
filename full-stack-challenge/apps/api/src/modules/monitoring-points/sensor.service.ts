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
    throw new AppError(
      422,
      'Sensores TcAg e TcAs não são compatíveis com máquinas do tipo Bomba',
    );
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
    throw new AppError(404, 'Ponto de monitoramento não encontrado');
  }

  if (point.sensor) {
    throw new AppError(409, 'Este ponto de monitoramento já possui um sensor associado');
  }

  const model = data.model === 'HF+' ? 'HF_PLUS' : data.model;

  assertSensorCompatibleWithMachine(point.machine.type, model);

  const existingSerial = await prisma.sensor.findUnique({
    where: { serialNumber: data.serialNumber },
  });

  if (existingSerial) {
    throw new AppError(409, 'Já existe um sensor com este número de série');
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