import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import * as monitoringPointController from './monitoring-point.controller';

export const monitoringPointRoutes = Router();

monitoringPointRoutes.use(authenticate);

monitoringPointRoutes.put('/:id', monitoringPointController.update);
monitoringPointRoutes.delete('/:id', monitoringPointController.remove);
monitoringPointRoutes.post('/:id/sensor', monitoringPointController.associateSensor);

export const machineMonitoringPointRoutes = Router({ mergeParams: true });

machineMonitoringPointRoutes.use(authenticate);
machineMonitoringPointRoutes.get('/', monitoringPointController.findByMachine);
machineMonitoringPointRoutes.post('/', monitoringPointController.create);