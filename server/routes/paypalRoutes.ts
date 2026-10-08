import { Router, Request, Response } from 'express';
import { payPalService } from '../paypal.js';
import { dbService } from '../db.js';

export const paypalRouter = Router();

paypalRouter.get('/config', (_req: Request, res: Response) => {
  const settings = dbService.getSettings();
  res.json({
    clientId: settings.paypalClientId || process.env.PAYPAL_CLIENT_ID || 'sb-client-id-demo',
    environment: settings.paypalEnvironment || 'sandbox',
    currency: settings.defaultCurrency || 'INR',
  });
});

paypalRouter.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency, description, customerEmail, customerName, customId } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const order = await payPalService.createOrder({
      amount: Number(amount),
      currency: currency || dbService.getSettings().defaultCurrency,
      description: description || 'PayFlow AI Payment Service',
      customerEmail,
      customerName,
      customId,
    });

    res.json(order);
  } catch (err: any) {
    console.error('PayPal create-order error:', err);
    res.status(500).json({ error: err.message || 'Failed to create PayPal order' });
  }
});

paypalRouter.post('/capture-order', async (req: Request, res: Response) => {
  try {
    const { orderId, customerId, customerName, customerEmail, amount, description, paymentRequestId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const captureResult = await payPalService.captureOrder(orderId);

    if (captureResult.status === 'COMPLETED') {
      const finalAmount = amount ? Number(amount) : (captureResult.amount || 5000);
      const currency = captureResult.currency || dbService.getSettings().defaultCurrency || 'INR';

      // 1. Record transaction in database
      const txn = dbService.addTransaction({
        id: `txn_${Date.now()}`,
        paypalOrderId: orderId,
        customerId: customerId || 'cust_guest',
        customerName: customerName || 'Valued Client',
        customerEmail: customerEmail || 'client@example.com',
        amount: finalAmount,
        currency: currency,
        description: description || 'PayPal Checkout via PayFlow AI',
        status: 'COMPLETED',
        paymentMethod: 'PAYPAL',
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      // 2. If associated with a payment request, mark it paid
      if (paymentRequestId) {
        dbService.updatePaymentRequest(paymentRequestId, {
          status: 'PAID',
        });
      }

      // 3. Add AI notification insight about successful payment
      dbService.addInsight({
        id: `ins_pay_${Date.now()}`,
        type: 'REVENUE',
        title: `Payment Received: ₹${finalAmount.toLocaleString()}`,
        description: `Successfully captured PayPal payment from ${customerName || 'client'} for "${description || 'Services'}".`,
        severity: 'SUCCESS',
        metric: `+₹${finalAmount.toLocaleString()}`,
        createdAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        transaction: txn,
        capture: captureResult,
      });
    }

    res.status(400).json({
      success: false,
      error: 'PayPal capture failed or is still pending approval',
      capture: captureResult,
    });
  } catch (err: any) {
    console.error('PayPal capture error:', err);
    res.status(500).json({ error: err.message || 'Failed to capture PayPal order' });
  }
});
