import { Router, Request, Response } from 'express';
import { dbService } from '../db.js';

export const settingsRouter = Router();

settingsRouter.get('/', (_req: Request, res: Response) => {
  const settings = dbService.getSettings();
  res.json({
    ...settings,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

settingsRouter.post('/', (req: Request, res: Response) => {
  try {
    const updated = dbService.updateSettings(req.body);
    res.json({
      ...updated,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update settings' });
  }
});
