import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import type { AssociateSensorInput } from './sensor.schema';

export async function associate(monitoringPointId: string, data: AssociateSensorInput) {
  const point = await prisma.monitoringPoint.findUnique({
    where: { id: monitoringPointId },
    include: { sensor: true },
  });

  if (!point) {
    throw new AppError(404, 'Monitoring point not found');
  }

  if (point.sensor) {
    throw new AppError(409, 'This monitoring point already has a sensor associated');
  }

  const existingSerial = await prisma.sensor.findUnique({
    where: { serialNumber: data.serialNumber },
  });

  if (existingSerial) {
    throw new AppError(409, 'A sensor with this serial number already exists');
  }

  return prisma.sensor.create({
    data: {
      serialNumber: data.serialNumber,
      model: data.model === 'HF+' ? 'HF_PLUS' : data.model,
      monitoringPointId,
    },
  });
}