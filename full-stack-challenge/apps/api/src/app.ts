import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { responseTime } from './middlewares/response-time';
import { authRoutes } from './modules/auth/auth.routes';
import { machineRoutes } from './modules/machines/machine.routes';
import { readingRoutes } from './modules/readings/reading.routes';
import { statsRoutes } from './modules/stats/stats.routes';
import {
  machineMonitoringPointRoutes,
  monitoringPointRoutes,
} from './modules/monitoring-points/monitoring-point.routes';

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ exposedHeaders: ['X-Response-Time'] }));
app.use(responseTime);
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/machines', machineRoutes);
app.use('/machines/:machineId/monitoring-points', machineMonitoringPointRoutes);
app.use('/monitoring-points', monitoringPointRoutes);
app.use('/monitoring-points/:id/readings', readingRoutes);
app.use('/stats', statsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);