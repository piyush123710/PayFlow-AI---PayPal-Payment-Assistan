import { Router, Request, Response } from 'express';
import { dbService } from '../db.js';
import { payPalService } from '../paypal.js';

export const paymentRequestsRouter = Router();

paymentRequestsRouter.get('/', (_req: Request, res: Response) => {
  const requests = dbService.getPaymentRequests();
  res.json(requests);
});

paymentRequestsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { customerId, customerName, customerEmail, amount, description, dueDate } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    let customer = customerId ? dbService.findCustomerById(customerId) : undefined;
    if (!customer && customerEmail) {
      customer = dbService.findCustomerByNameOrEmail(customerEmail);
    }

    if (!customer && customerName && customerEmail) {
      customer = dbService.addCustomer({
        id: `cust_${Date.now()}`,
        name: customerName,
        email: customerEmail,
        phone: '',
        totalPaid: 0,
        pendingAmount: 0,
        transactionsCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    const cName = customer ? customer.name : (customerName || 'Valued Client');
    const cEmail = customer ? customer.email : (customerEmail || 'client@example.com');
    const cId = customer ? customer.id : `cust_${Date.now()}`;

    // Create PayPal order link for this request
    const paypalOrder = await payPalService.createOrder({
      amount: Number(amount),
      currency: dbService.getSettings().defaultCurrency,
      description: description || `Payment request for ${cName}`,
      customerEmail: cEmail,
      customerName: cName,
    });

    const newRequest = dbService.addPaymentRequest({
      id: `req_${Date.now()}`,
      customerId: cId,
      customerName: cName,
      customerEmail: cEmail,
      amount: Number(amount),
      currency: dbService.getSettings().defaultCurrency,
      description: description || 'Professional services request',
      paypalOrderId: paypalOrder.id,
      status: 'PENDING',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      reminderSentCount: 0,
    });

    res.json({
      paymentRequest: newRequest,
      paypalOrder,
    });
  } catch (err: any) {
    console.error('Error creating payment request:', err);
    res.status(500).json({ error: err.message || 'Failed to create payment request' });
  }
});

paymentRequestsRouter.post('/:id/reminder', (req: Request, res: Response) => {
  const { id } = req.params;
  const requests = dbService.getPaymentRequests();
  const reqItem = requests.find((r) => r.id === id);

  if (!reqItem) {
    return res.status(404).json({ error: 'Payment request not found' });
  }

  const updated = dbService.updatePaymentRequest(id, {
    reminderSentCount: (reqItem.reminderSentCount || 0) + 1,
    lastReminderDate: new Date().toISOString(),
  });

  res.json(updated);
});
