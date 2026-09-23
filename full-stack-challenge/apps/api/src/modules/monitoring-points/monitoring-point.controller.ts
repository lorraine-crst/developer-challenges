import type { NextFunction, Request, Response } from 'express';
import {
  createMonitoringPointSchema,
  listMonitoringPointsQuerySchema,
  updateMonitoringPointSchema,
} from './monitoring-point.schema';
import * as monitoringPointService from './monitoring-point.service';
import { associateSensorSchema } from './sensor.schema';
import * as sensorService from './sensor.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listMonitoringPointsQuerySchema.parse(req.query);
    const result = await monitoringPointService.list(query);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function findByMachine(
  req: Request<{ machineId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const points = await monitoringPointService.findByMachine(req.params.machineId);

    res.json(points);
  } catch (error) {
    next(error);
  }
}

export async function create(
  req: Request<{ machineId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createMonitoringPointSchema.parse(req.body);
    const point = await monitoringPointService.create(req.params.machineId, data);

    res.status(201).json(point);
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = updateMonitoringPointSchema.parse(req.body);
    const point = await monitoringPointService.update(req.params.id, data);

    res.json(point);
  } catch (error) {
    next(error);
  }
}

export async function remove(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    await monitoringPointService.remove(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function associateSensor(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = associateSensorSchema.parse(req.body);
    const sensor = await sensorService.associate(req.params.id, data);

    res.status(201).json(sensor);
  } catch (error) {
    next(error);
  }
}