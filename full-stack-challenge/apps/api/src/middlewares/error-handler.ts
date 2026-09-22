import type { ErrorRequestHandler, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Falha de validação',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
};