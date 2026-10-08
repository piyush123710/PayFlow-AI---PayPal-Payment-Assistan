import { Router, Request, Response } from 'express';
import { dbService } from '../db.js';

export const refundRouter = Router();

refundRouter.get('/', (_req: Request, res: Response) => {
  const refunds = dbService.getRefunds();
  res.json(refunds);
});

refundRouter.post('/', (req: Request, res: Response) => {
  try {
    const { transactionId, amount, reason } = req.body;
    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId is required' });
    }

    const refund = dbService.processRefund(
      transactionId,
      Number(amount) || 1000,
      reason || 'Customer requested refund via merchant portal'
    );

    if (!refund) {
      return res.status(400).json({ error: 'Transaction not found or not in COMPLETED state' });
    }

    res.json({ success: true, refund });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Refund processing failed' });
  }
});
