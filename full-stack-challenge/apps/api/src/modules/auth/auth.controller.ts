import type { NextFunction, Request, Response } from 'express';
import { loginSchema } from './auth.schema';
import * as authService from './auth.service';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const credentials = loginSchema.parse(req.body);
    const result = await authService.login(credentials);

    res.json(result);
  } catch (error) {
    next(error);
  }
}