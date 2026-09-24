import type { NextFunction, Request, Response } from 'express';

export function responseTime(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  const originalEnd = res.end.bind(res);

  res.end = function (...args: Parameters<Response['end']>) {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${durationMs.toFixed(1)}ms`);
    }

    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`);

    return originalEnd(...args);
  } as Response['end'];

  next();
}