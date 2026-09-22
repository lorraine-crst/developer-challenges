import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { findUserById } from '../modules/auth/auth.service';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'Token de autenticação ausente');
    }

    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub?: string };

    if (!payload.sub) {
      throw new AppError(401, 'Token de autenticação inválido');
    }

    const user = await findUserById(payload.sub);

    if (!user) {
      throw new AppError(401, 'Token de autenticação inválido');
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Token de autenticação inválido'));
      return;
    }

    next(error);
  }
}