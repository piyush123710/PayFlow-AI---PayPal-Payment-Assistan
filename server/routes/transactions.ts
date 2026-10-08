import { Router, Request, Response } from 'express';
import { dbService } from '../db.js';

export const transactionsRouter = Router();

transactionsRouter.get('/', (req: Request, res: Response) => {
  let txns = dbService.getTransactions();
  const { status, search } = req.query;

  if (status && status !== 'ALL') {
    txns = txns.filter((t) => t.status === (status as string).toUpperCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    txns = txns.filter(
      (t) =>
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.paypalOrderId.toLowerCase().includes(q)
    );
  }

  res.json(txns);
});

transactionsRouter.get('/summary', (_req: Request, res: Response) => {
  const txns = dbService.getTransactions();
  const customers = dbService.getCustomers();
  const paymentRequests = dbService.getPaymentRequests();

  const completed = txns.filter((t) => t.status === 'COMPLETED');
  const failed = txns.filter((t) => t.status === 'FAILED');
  const pendingRequests = paymentRequests.filter((r) => r.status === 'PENDING');

  const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = pendingRequests.reduce((sum, r) => sum + r.amount, 0);

  // Group by month for Recharts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyMap: Record<string, { month: string; revenue: number; transactions: number }> = {};

  // Initialize last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    monthlyMap[key] = { month: key, revenue: 0, transactions: 0 };
  }

  completed.forEach((t) => {
    const d = new Date(t.paymentDate);
    const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    if (monthlyMap[key]) {
      monthlyMap[key].revenue += t.amount;
      monthlyMap[key].transactions += 1;
    }
  });

  // Status breakdown for Recharts Pie
  const statusBreakdown = [
    { name: 'Completed', value: completed.length, color: '#10b981' },
    { name: 'Pending Requests', value: pendingRequests.length, color: '#f59e0b' },
    { name: 'Failed', value: failed.length, color: '#ef4444' },
  ];

  res.json({
    totalRevenue,
    pendingAmount,
    successfulCount: completed.length,
    failedCount: failed.length,
    customerCount: customers.length,
    pendingCustomerCount: pendingRequests.length,
    averageTransactionValue: completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0,
    monthlyRevenue: Object.values(monthlyMap),
    statusBreakdown,
  });
});

transactionsRouter.get('/anomalies', (_req: Request, res: Response) => {
  const txns = dbService.getTransactions().filter((t) => t.isAnomaly);
  res.json(txns);
});

transactionsRouter.post('/reset', (_req: Request, res: Response) => {
  const result = dbService.resetDemoData();
  res.json(result);
});
