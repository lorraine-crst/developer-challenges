import { Router } from 'express';
import * as authController from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/login', authController.login);