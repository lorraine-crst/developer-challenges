import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import * as readingController from './reading.controller';

export const readingRoutes = Router({ mergeParams: true });

readingRoutes.use(authenticate);

readingRoutes.post('/', readingController.createMany);

readingRoutes.get('/', readingController.findMany);