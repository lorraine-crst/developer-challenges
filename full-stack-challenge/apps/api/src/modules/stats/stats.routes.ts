import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import * as statsController from './stats.controller';

export const statsRoutes = Router();

statsRoutes.use(authenticate);

statsRoutes.get('/average-temperature-by-type', statsController.averageTemperatureByType);