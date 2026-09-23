import type { NextFunction, Request, Response } from 'express';
import { createReadingsSchema, listReadingsQuerySchema } from './reading.schema';
import * as readingService from './reading.service';


export async function createMany(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createReadingsSchema.parse(req.body);
    const result = await readingService.createMany(req.params.id, data);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function findMany(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = listReadingsQuerySchema.parse(req.query);
    const readings = await readingService.findMany(req.params.id, query);

    res.json(readings);
  } catch (error) {
    next(error);
  }
}

export async function getMetrics(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const seriesName = typeof req.query.seriesName === 'string' ? req.query.seriesName : undefined;
    const metrics = await readingService.getMetrics(req.params.id, seriesName);

    res.json(metrics);
  } catch (error) {
    next(error);
  }
}