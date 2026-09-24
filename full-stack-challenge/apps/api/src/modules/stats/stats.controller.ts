import type { NextFunction, Request, Response } from 'express';
import * as statsService from './stats.service';

export async function averageTemperatureByType(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await statsService.getAverageTemperatureSeriesByType();

    res.json(result);
  } catch (error) {
    next(error);
  }
}