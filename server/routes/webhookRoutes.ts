import { Router, Request, Response } from 'express';
import { dbService } from '../db.js';
import { WebhookEvent } from '../types.js';

export const webhookRouter = Router();

webhookRouter.get('/', (_req: Request, res: Response) => {
  const events = dbService.getWebhookEvents();
  res.json(events);
});

webhookRouter.post('/simulate', (req: Request, res: Response) => {
  try {
    const { eventType, amount = 5000, customerName = 'Rahul Sharma' } = req.body;

    let summary = '';
    let resourceType: 'capture' | 'order' | 'dispute' | 'refund' = 'capture';
    const resourceId = `RES-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        summary = `PayPal settlement of ₹${Number(amount).toLocaleString()} verified for ${customerName}`;
        resourceType = 'capture';
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        summary = `PayPal transaction of ₹${Number(amount).toLocaleString()} was declined by buyer's issuing bank`;
        resourceType = 'capture';
        break;
      case 'CUSTOMER.DISPUTE.CREATED':
        summary = `Customer dispute opened for order ${resourceId}. Reason: Item/Service inquiry`;
        resourceType = 'dispute';
        // Add dispute insight
        dbService.addInsight({
          id: `ins_disp_${Date.now()}`,
          type: 'DISPUTE_RISK',
          title: `Dispute Alert: ${customerName}`,
          description: `PayPal buyer opened an inquiry on ₹${Number(amount).toLocaleString()}. Recommended action: Submit work milestone logs.`,
          severity: 'ALERT',
          metric: 'Dispute Open',
          createdAt: new Date().toISOString(),
        });
        break;
      case 'CHECKOUT.ORDER.APPROVED':
        summary = `PayPal Order approved by ${customerName} awaiting capture`;
        resourceType = 'order';
        break;
      default:
        summary = `Simulated PayPal event: ${eventType}`;
    }

    const event: WebhookEvent = {
      id: `wh_evt_${Date.now()}`,
      eventType: eventType || 'PAYMENT.CAPTURE.COMPLETED',
      summary,
      resourceType,
      resourceId,
      status: 'SIMULATED',
      payload: {
        id: resourceId,
        amount: { value: String(amount), currency_code: 'INR' },
        customer: customerName,
        simulated_at: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    dbService.addWebhookEvent(event);
    res.json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Webhook simulation failed' });
  }
});
