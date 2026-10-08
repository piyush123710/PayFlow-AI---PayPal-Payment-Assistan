import { Router, Request, Response } from 'express';
import { dbService } from '../db.js';

export const forecastRouter = Router();

forecastRouter.get('/', (_req: Request, res: Response) => {
  const forecast = dbService.getCashFlowForecast();
  res.json(forecast);
});
