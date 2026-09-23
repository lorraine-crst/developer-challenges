import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { authRoutes } from './modules/auth/auth.routes';
import { machineRoutes } from './modules/machines/machine.routes';
import { readingRoutes } from './modules/readings/reading.routes';
import {
  machineMonitoringPointRoutes,
  monitoringPointRoutes,
} from './modules/monitoring-points/monitoring-point.routes';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/machines', machineRoutes);
app.use('/machines/:machineId/monitoring-points', machineMonitoringPointRoutes);
app.use('/monitoring-points', monitoringPointRoutes);
app.use('/monitoring-points/:id/readings', readingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
