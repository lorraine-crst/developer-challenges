import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);
