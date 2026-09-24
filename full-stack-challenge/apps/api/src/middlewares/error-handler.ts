import type { ErrorRequestHandler, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { resolveLanguage, translate } from '../lib/i18n';

export const notFoundHandler = (req: Request, res: Response) => {
  const language = resolveLanguage(req.headers['x-language']);

  res.status(404).json({ error: translate('common.routeNotFound', language) });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const language = resolveLanguage(req.headers['x-language']);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: translate('common.validationFailed', language),
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: translate(issue.message, language),
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: translate(err.message, language) });
    return;
  }

  console.error(err);
  res.status(500).json({ error: translate('common.internalError', language) });
};