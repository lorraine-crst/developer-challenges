import type { MachineType, SensorModel } from '@prisma/client';
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

export async function associate(monitoringPointId: string, data: AssociateSensorInput) {
  const point = await prisma.monitoringPoint.findUnique({
    where: { id: monitoringPointId },
    include: { sensor: true, machine: true },
  });

  if (!point) {
    throw new AppError(404, 'Monitoring point not found');
  }

  if (point.sensor) {
    throw new AppError(409, 'This monitoring point already has a sensor associated');
  }

  const model = data.model === 'HF+' ? 'HF_PLUS' : data.model;

  assertSensorCompatibleWithMachine(point.machine.type, model);

  const existingSerial = await prisma.sensor.findUnique({
    where: { serialNumber: data.serialNumber },
  });

  if (existingSerial) {
    throw new AppError(409, 'A sensor with this serial number already exists');
  }

  return prisma.sensor.create({
    data: {
      serialNumber: data.serialNumber,
      model,
      monitoringPointId,
    },
  });
}