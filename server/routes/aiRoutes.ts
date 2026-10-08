import { Router, Request, Response } from 'express';
import { aiService } from '../ai.js';
import { dbService } from '../db.js';

export const aiRouter = Router();

aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await aiService.handleChat(prompt, history || []);
    res.json(result);
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    res.status(500).json({ error: err.message || 'AI assistant error' });
  }
});

aiRouter.post('/reminders', async (req: Request, res: Response) => {
  try {
    const { customerName, amount, currency, daysOverdue, serviceDescription } = req.body;

    const reminderText = await aiService.generateReminder(
      customerName || 'Valued Client',
      amount || 5000,
      currency || 'INR',
      daysOverdue || 7,
      serviceDescription || 'Completed Project Milestones'
    );

    res.json({ reminderText });
  } catch (err: any) {
    console.error('AI reminder endpoint error:', err);
    res.status(500).json({ error: err.message || 'AI reminder generation failed' });
  }
});

aiRouter.get('/insights', async (_req: Request, res: Response) => {
  try {
    const insights = await aiService.generateInsights();
    res.json(insights);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch insights' });
  }
});

aiRouter.post('/agent-workflow', async (req: Request, res: Response) => {
  try {
    const { action, customerIds } = req.body;
    const paymentRequests = dbService.getPaymentRequests().filter((r) => r.status === 'PENDING');

    if (action === 'EXECUTE_BATCH_REMINDERS') {
      const results = [];
      for (const reqItem of paymentRequests) {
        if (!customerIds || customerIds.includes(reqItem.customerId)) {
          const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(reqItem.dueDate).getTime()) / (1000 * 3600 * 24)));
          const reminderMsg = await aiService.generateReminder(
            reqItem.customerName,
            reqItem.amount,
            reqItem.currency,
            daysOverdue,
            reqItem.description
          );

          dbService.updatePaymentRequest(reqItem.id, {
            reminderSentCount: (reqItem.reminderSentCount || 0) + 1,
            lastReminderDate: new Date().toISOString(),
          });

          results.push({
            paymentRequestId: reqItem.id,
            customerName: reqItem.customerName,
            customerEmail: reqItem.customerEmail,
            amount: reqItem.amount,
            paypalOrderId: reqItem.paypalOrderId,
            message: reminderMsg,
            status: 'SENT',
          });
        }
      }

      return res.json({
        success: true,
        dispatchedCount: results.length,
        results,
      });
    }

    res.json({ message: 'No action specified' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Agent workflow error' });
  }
});
