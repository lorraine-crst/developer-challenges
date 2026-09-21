import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MachineType, PrismaClient, SensorModel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface RawSeries {
  name: string;
  data: Array<{ datetime: string; max: number }>;
}

interface SeedSensor {
  serialNumber: string;
  model: SensorModel;
}

interface SeedPoint {
  name: string;
  sensor: SeedSensor | null;
}

interface SeedMachine {
  name: string;
  type: MachineType;
  points: SeedPoint[];
}

const dataset = JSON.parse(
  readFileSync(join(__dirname, 'data', 'sensor-data.json'), 'utf-8'),
) as RawSeries[];

const machines: SeedMachine[] = [
  {
    name: 'Bomba Centrifuga 01',
    type: MachineType.Bomba,
    points: [
      { name: 'Mancal Dianteiro', sensor: { serialNumber: 'HF-0001', model: SensorModel.HF_PLUS } },
      { name: 'Mancal Traseiro', sensor: { serialNumber: 'HF-0002', model: SensorModel.HF_PLUS } },
    ],
  },
  {
    name: 'Bomba de Recalque 02',
    type: MachineType.Bomba,
    points: [
      { name: 'Acoplamento', sensor: { serialNumber: 'HF-0003', model: SensorModel.HF_PLUS } },
      { name: 'Motor Eletrico', sensor: null },
    ],
  },
  {
    name: 'Ventilador Industrial A',
    type: MachineType.Ventilador,
    points: [
      { name: 'Rolamento Superior', sensor: { serialNumber: 'TC-0001', model: SensorModel.TcAg } },
      { name: 'Rolamento Inferior', sensor: { serialNumber: 'TC-0002', model: SensorModel.TcAs } },
    ],
  },
  {
    name: 'Exaustor Linha 3',
    type: MachineType.Ventilador,
    points: [
      { name: 'Eixo Principal', sensor: { serialNumber: 'HF-0004', model: SensorModel.HF_PLUS } },
      { name: 'Base do Motor', sensor: { serialNumber: 'TC-0003', model: SensorModel.TcAg } },
    ],
  },
];

async function clearDatabase() {
  await prisma.reading.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.monitoringPoint.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser() {
  const name = process.env.SEED_USER_NAME;
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;

  if (!name || !email || !password) {
    throw new Error('Missing SEED_USER_NAME, SEED_USER_EMAIL or SEED_USER_PASSWORD in .env');
  }

  return prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 10) },
  });
}

async function createMachines() {
  const created = [];

  for (const machine of machines) {
    const record = await prisma.machine.create({
      data: {
        name: machine.name,
        type: machine.type,
        monitoringPoints: {
          create: machine.points.map((point) => ({
            name: point.name,
            ...(point.sensor ? { sensor: { create: point.sensor } } : {}),
          })),
        },
      },
      include: { monitoringPoints: true },
    });

    created.push(record);
  }

  return created;
}

async function importReadings(monitoringPointId: string, seriesNames: string[]) {
  const rows = dataset
    .filter((series) => seriesNames.includes(series.name))
    .flatMap((series) =>
      series.data.map((point) => ({
        monitoringPointId,
        seriesName: series.name,
        datetime: new Date(point.datetime),
        value: point.max,
      })),
    );

  await prisma.reading.createMany({ data: rows });

  return rows.length;
}

async function main() {
  await clearDatabase();

  const user = await createUser();
  const created = await createMachines();

  const allSeries = dataset.map((series) => series.name);
  const frontBearing = created[0].monitoringPoints[0];
  const upperBearing = created[2].monitoringPoints[0];

  const readings =
    (await importReadings(frontBearing.id, allSeries)) +
    (await importReadings(upperBearing.id, ['temperature']));

  const points = created.reduce((sum, machine) => sum + machine.monitoringPoints.length, 0);

  console.log(`User: ${user.email}`);
  console.log(`Machines: ${created.length}`);
  console.log(`Monitoring points: ${points}`);
  console.log(`Readings: ${readings}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
