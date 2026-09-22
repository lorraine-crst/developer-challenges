import type { NextFunction, Request, Response } from 'express';
import { createMachineSchema, updateMachineSchema } from './machine.schema';
import * as machineService from './machine.service';

export async function findAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const machines = await machineService.findAll();

    res.json(machines);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createMachineSchema.parse(req.body);
    const machine = await machineService.create(data);

    res.status(201).json(machine);
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
    const data = updateMachineSchema.parse(req.body);
    const machine = await machineService.update(req.params.id, data);

    res.json(machine);
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
    await machineService.remove(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}