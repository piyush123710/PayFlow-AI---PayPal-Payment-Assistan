import { Router, Request, Response } from 'express';
import { dbService } from '../db.js';

export const customersRouter = Router();

customersRouter.get('/', (_req: Request, res: Response) => {
  const customers = dbService.getCustomers();
  res.json(customers);
});

customersRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Customer name and email are required' });
    }

    const existing = dbService.findCustomerByNameOrEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'A customer with this email already exists' });
    }

    const newCust = dbService.addCustomer({
      id: `cust_${Date.now()}`,
      name,
      email,
      phone: phone || '',
      totalPaid: 0,
      pendingAmount: 0,
      transactionsCount: 0,
      createdAt: new Date().toISOString(),
    });

    res.json(newCust);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create customer' });
  }
});

customersRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const customer = dbService.findCustomerById(id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const txns = dbService.getTransactions().filter((t) => t.customerId === id);
  const requests = dbService.getPaymentRequests().filter((r) => r.customerId === id);

  res.json({
    customer,
    transactions: txns,
    paymentRequests: requests,
  });
});
