import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import * as machineController from './machine.controller';

export const machineRoutes = Router();

machineRoutes.use(authenticate);

machineRoutes.get('/', machineController.findAll);
machineRoutes.post('/', machineController.create);
machineRoutes.put('/:id', machineController.update);
machineRoutes.delete('/:id', machineController.remove);