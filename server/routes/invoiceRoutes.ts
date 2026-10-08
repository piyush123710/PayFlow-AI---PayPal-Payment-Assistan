import { Router, Request, Response } from 'express';
import { dbService } from '../db.js';
import { payPalService } from '../paypal.js';
import { Invoice, InvoiceItem } from '../types.js';

export const invoiceRouter = Router();

invoiceRouter.get('/', (_req: Request, res: Response) => {
  const invoices = dbService.getInvoices();
  res.json(invoices);
});

invoiceRouter.get('/:id', (req: Request, res: Response) => {
  const invoice = dbService.findInvoiceById(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

invoiceRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      taxRate = 18,
      discount = 0,
      paymentTerms = 'NET_15',
      notes,
      dueDate,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one invoice line item is required' });
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
        phone: customerPhone || '',
        totalPaid: 0,
        pendingAmount: 0,
        transactionsCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    const cName = customer ? customer.name : (customerName || 'Valued Client');
    const cEmail = customer ? customer.email : (customerEmail || 'client@example.com');
    const cId = customer ? customer.id : `cust_${Date.now()}`;

    // Calculate subtotal
    const processedItems: InvoiceItem[] = items.map((it: any, idx: number) => {
      const q = Number(it.quantity) || 1;
      const p = Number(it.unitPrice) || 0;
      return {
        id: `it_${idx + 1}`,
        description: it.description || 'Consulting / Development Service',
        quantity: q,
        unitPrice: p,
        total: Math.round(q * p * 100) / 100,
      };
    });

    const subtotal = processedItems.reduce((acc, it) => acc + it.total, 0);
    const taxAmount = Math.round((subtotal * (Number(taxRate) / 100)) * 100) / 100;
    const finalTotal = Math.max(0, Math.round((subtotal + taxAmount - Number(discount)) * 100) / 100);

    const existingCount = dbService.getInvoices().length;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(existingCount + 1).padStart(3, '0')}`;

    // Create associated PayPal order
    const paypalOrder = await payPalService.createOrder({
      amount: finalTotal,
      currency: dbService.getSettings().defaultCurrency,
      description: `Tax Invoice ${invoiceNumber} for ${cName}`,
      customerEmail: cEmail,
      customerName: cName,
    });

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber,
      customerId: cId,
      customerName: cName,
      customerEmail: cEmail,
      customerPhone: customerPhone || customer?.phone,
      items: processedItems,
      subtotal,
      taxRate: Number(taxRate),
      taxAmount,
      discount: Number(discount),
      total: finalTotal,
      currency: dbService.getSettings().defaultCurrency,
      status: 'SENT',
      paymentTerms,
      notes: notes || 'Thank you for your business. Please complete settlement securely via PayPal.',
      paypalOrderId: paypalOrder.id,
      dueDate: dueDate || new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    dbService.addInvoice(newInvoice);

    // Also add to Payment Requests so it shows in the recovery list
    dbService.addPaymentRequest({
      id: `req_from_inv_${newInvoice.id}`,
      customerId: cId,
      customerName: cName,
      customerEmail: cEmail,
      amount: finalTotal,
      currency: dbService.getSettings().defaultCurrency,
      description: `Invoice ${invoiceNumber}: ${processedItems[0]?.description || 'Services'}`,
      paypalOrderId: paypalOrder.id,
      status: 'PENDING',
      dueDate: newInvoice.dueDate,
      createdAt: new Date().toISOString(),
      reminderSentCount: 0,
    });

    res.json({ invoice: newInvoice, paypalOrder });
  } catch (err: any) {
    console.error('Invoice creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to create tax invoice' });
  }
});
