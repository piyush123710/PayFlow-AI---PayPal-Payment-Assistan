import fs from 'fs';
import path from 'path';
import { User, Customer, Transaction, PaymentRequest, AIInsight, Invoice, WebhookEvent, RefundRecord } from './types.js';

interface DatabaseSchema {
  users: User[];
  customers: Customer[];
  transactions: Transaction[];
  paymentRequests: PaymentRequest[];
  aiInsights: AIInsight[];
  invoices: Invoice[];
  webhookEvents: WebhookEvent[];
  refunds: RefundRecord[];
  settings: {
    paypalClientId: string;
    paypalClientSecret: string;
    paypalEnvironment: 'sandbox' | 'live';
    defaultCurrency: string;
    businessName: string;
    ownerEmail: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'payflow_db.json');

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_rahul_1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    totalPaid: 45000,
    pendingAmount: 5000,
    transactionsCount: 8,
    lastPaymentDate: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'cust_aman_2',
    name: 'Aman Gupta',
    email: 'aman.gupta@example.com',
    phone: '+91 98765 11223',
    totalPaid: 18500,
    pendingAmount: 2500,
    transactionsCount: 4,
    lastPaymentDate: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString(),
    createdAt: '2026-02-15T14:30:00Z',
  },
  {
    id: 'cust_priya_3',
    name: 'Priya Verma',
    email: 'priya.verma@example.com',
    phone: '+91 98765 99887',
    totalPaid: 32400,
    pendingAmount: 1800,
    transactionsCount: 6,
    lastPaymentDate: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    createdAt: '2026-03-01T09:15:00Z',
  },
  {
    id: 'cust_neha_4',
    name: 'Neha Patel',
    email: 'neha.patel@example.com',
    phone: '+91 98765 55443',
    totalPaid: 62000,
    pendingAmount: 0,
    transactionsCount: 11,
    lastPaymentDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    createdAt: '2025-11-20T11:00:00Z',
  },
  {
    id: 'cust_vikram_5',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 98765 33221',
    totalPaid: 28000,
    pendingAmount: 0,
    transactionsCount: 5,
    lastPaymentDate: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    createdAt: '2026-01-25T16:45:00Z',
  },
  {
    id: 'cust_sunita_6',
    name: 'Sunita Rao',
    email: 'sunita.rao@example.com',
    phone: '+91 98765 77665',
    totalPaid: 54000,
    pendingAmount: 0,
    transactionsCount: 9,
    lastPaymentDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    createdAt: '2025-12-05T08:30:00Z',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_001',
    paypalOrderId: 'PAYPAL-ORD-88219A',
    customerId: 'cust_neha_4',
    customerName: 'Neha Patel',
    customerEmail: 'neha.patel@example.com',
    amount: 12500,
    currency: 'INR',
    description: 'Q3 UI/UX Design Consultancy',
    status: 'COMPLETED',
    paymentMethod: 'PAYPAL',
    paymentDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'txn_002',
    paypalOrderId: 'PAYPAL-ORD-99381B',
    customerId: 'cust_vikram_5',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.singh@example.com',
    amount: 8000,
    currency: 'INR',
    description: 'Full-stack Bug Fixing & Performance Optimization',
    status: 'COMPLETED',
    paymentMethod: 'PAYPAL_CARD',
    paymentDate: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'txn_003',
    paypalOrderId: 'PAYPAL-ORD-33291C',
    customerId: 'cust_sunita_6',
    customerName: 'Sunita Rao',
    customerEmail: 'sunita.rao@example.com',
    amount: 15000,
    currency: 'INR',
    description: 'Custom Shopify Theme Development',
    status: 'COMPLETED',
    paymentMethod: 'PAYPAL',
    paymentDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'txn_004',
    paypalOrderId: 'PAYPAL-ORD-44910D',
    customerId: 'cust_rahul_1',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@example.com',
    amount: 24500,
    currency: 'INR',
    description: 'Enterprise Cloud Infrastructure Migration',
    status: 'COMPLETED',
    paymentMethod: 'PAYPAL',
    paymentDate: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
    isAnomaly: true,
    anomalyReason: 'Unusually high amount: ₹24,500 is 3.1x greater than Rahul\'s average ticket size of ₹7,800',
  },
  {
    id: 'txn_005',
    paypalOrderId: 'PAYPAL-ORD-55102E',
    customerId: 'cust_aman_2',
    customerName: 'Aman Gupta',
    customerEmail: 'aman.gupta@example.com',
    amount: 3500,
    currency: 'INR',
    description: 'Logo & Brand Identity Kit',
    status: 'COMPLETED',
    paymentMethod: 'PAYPAL',
    paymentDate: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'txn_006',
    paypalOrderId: 'PAYPAL-ORD-66712F',
    customerId: 'cust_priya_3',
    customerName: 'Priya Verma',
    customerEmail: 'priya.verma@example.com',
    amount: 4200,
    currency: 'INR',
    description: 'Social Media Marketing Graphics',
    status: 'COMPLETED',
    paymentMethod: 'PAYPAL',
    paymentDate: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'txn_007',
    paypalOrderId: 'PAYPAL-ORD-77123G',
    customerId: 'cust_aman_2',
    customerName: 'Aman Gupta',
    customerEmail: 'aman.gupta@example.com',
    amount: 2500,
    currency: 'INR',
    description: 'E-commerce Checkout Integration (Attempt)',
    status: 'FAILED',
    paymentMethod: 'PAYPAL_CARD',
    paymentDate: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: 'req_001',
    customerId: 'cust_rahul_1',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@example.com',
    amount: 5000,
    currency: 'INR',
    description: 'Backend API Integration & Maintenance retainer',
    paypalOrderId: 'PAYPAL-REQ-RAHUL-5K',
    status: 'PENDING',
    dueDate: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    reminderSentCount: 1,
    lastReminderDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'req_002',
    customerId: 'cust_aman_2',
    customerName: 'Aman Gupta',
    customerEmail: 'aman.gupta@example.com',
    amount: 2500,
    currency: 'INR',
    description: 'Mobile App Wireframes and User Testing',
    paypalOrderId: 'PAYPAL-REQ-AMAN-2K5',
    status: 'PENDING',
    dueDate: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    reminderSentCount: 0,
  },
  {
    id: 'req_003',
    customerId: 'cust_priya_3',
    customerName: 'Priya Verma',
    customerEmail: 'priya.verma@example.com',
    amount: 1800,
    currency: 'INR',
    description: 'Newsletter Template Design & Copywriting',
    paypalOrderId: 'PAYPAL-REQ-PRIYA-1K8',
    status: 'PENDING',
    dueDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    reminderSentCount: 0,
  },
];

const INITIAL_INSIGHTS: AIInsight[] = [
  {
    id: 'ins_001',
    type: 'PENDING',
    title: 'Outstanding Payment Alert',
    description: '3 customers currently owe ₹9,300. Rahul Sharma is 12 days overdue on ₹5,000.',
    severity: 'WARNING',
    metric: '₹9,300 Pending',
    actionLabel: 'Generate AI Reminders',
    actionCommand: 'Generate reminders for all overdue customers',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ins_002',
    type: 'REVENUE',
    title: 'Strong MoM Growth Momentum',
    description: 'Monthly PayPal collections surged +22.4% compared to previous cycle, driven by recurring retainers.',
    severity: 'SUCCESS',
    metric: '+22.4% Growth',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ins_003',
    type: 'ANOMALY',
    title: 'Unusual Transaction Flagged',
    description: 'Transaction of ₹24,500 from Rahul Sharma is 314% higher than typical median transaction value.',
    severity: 'ALERT',
    metric: '₹24,500 Flagged',
    actionLabel: 'Review Anomaly',
    actionCommand: 'Show details of unusual transaction for Rahul',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ins_004',
    type: 'RECOMMENDATION',
    title: 'Optimal Reminder Window',
    description: 'Historical data shows 85% of your clients settle within 48 hours when reminded between 10 AM - 12 PM.',
    severity: 'INFO',
    metric: '85% Clearance Rate',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ins_005',
    type: 'CASH_FLOW',
    title: 'Predicted 30-Day Cash Inflow',
    description: 'AI model projects ₹48,500 in collections over next 30 days based on invoice due dates and client settlement velocity.',
    severity: 'SUCCESS',
    metric: '₹48,500 Projected',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust_rahul_1',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@example.com',
    customerPhone: '+91 98765 43210',
    items: [
      { id: 'item_1', description: 'Backend API Integration & Microservices Architecture', quantity: 1, unitPrice: 4237.29, total: 4237.29 },
    ],
    subtotal: 4237.29,
    taxRate: 18,
    taxAmount: 762.71,
    discount: 0,
    total: 5000,
    currency: 'INR',
    status: 'OVERDUE',
    paymentTerms: 'NET_15',
    notes: 'Thank you for your business. Please settle via PayPal.',
    paypalOrderId: 'PAYPAL-REQ-RAHUL-5K',
    dueDate: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2026-002',
    customerId: 'cust_aman_2',
    customerName: 'Aman Gupta',
    customerEmail: 'aman.gupta@example.com',
    customerPhone: '+91 98765 11223',
    items: [
      { id: 'item_2', description: 'Mobile App Wireframes and User Experience Testing', quantity: 1, unitPrice: 2118.64, total: 2118.64 },
    ],
    subtotal: 2118.64,
    taxRate: 18,
    taxAmount: 381.36,
    discount: 0,
    total: 2500,
    currency: 'INR',
    status: 'OVERDUE',
    paymentTerms: 'DUE_ON_RECEIPT',
    notes: 'Includes Figma source files and interactive prototypes.',
    paypalOrderId: 'PAYPAL-REQ-AMAN-2K5',
    dueDate: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-2026-003',
    customerId: 'cust_sunita_6',
    customerName: 'Sunita Rao',
    customerEmail: 'sunita.rao@example.com',
    customerPhone: '+91 98765 77665',
    items: [
      { id: 'item_3', description: 'Custom Shopify Theme Development & Payment Gateway Setup', quantity: 1, unitPrice: 12711.86, total: 12711.86 },
    ],
    subtotal: 12711.86,
    taxRate: 18,
    taxAmount: 2288.14,
    discount: 0,
    total: 15000,
    currency: 'INR',
    status: 'PAID',
    paymentTerms: 'DUE_ON_RECEIPT',
    notes: 'Payment settled in full via PayPal Sandbox.',
    paypalOrderId: 'PAYPAL-ORD-33291C',
    dueDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    id: 'wh_evt_001',
    eventType: 'PAYMENT.CAPTURE.COMPLETED',
    summary: 'Payment capture completed for 15,000 INR from Sunita Rao',
    resourceType: 'capture',
    resourceId: 'CAP-33291C-SUNITA',
    status: 'SUCCESS',
    payload: { id: 'CAP-33291C-SUNITA', status: 'COMPLETED', amount: { value: '15000.00', currency_code: 'INR' }, payer: { email_address: 'sunita.rao@example.com' } },
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'wh_evt_002',
    eventType: 'PAYMENT.CAPTURE.COMPLETED',
    summary: 'Payment capture completed for 12,500 INR from Neha Patel',
    resourceType: 'capture',
    resourceId: 'CAP-88219A-NEHA',
    status: 'SUCCESS',
    payload: { id: 'CAP-88219A-NEHA', status: 'COMPLETED', amount: { value: '12500.00', currency_code: 'INR' }, payer: { email_address: 'neha.patel@example.com' } },
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'wh_evt_003',
    eventType: 'PAYMENT.CAPTURE.DENIED',
    summary: 'Card payment attempt of 2,500 INR failed for Aman Gupta (Card Expired)',
    resourceType: 'capture',
    resourceId: 'CAP-77123G-AMAN',
    status: 'PROCESSED',
    payload: { id: 'CAP-77123G-AMAN', status: 'DENIED', reason_code: 'EXPIRED_CREDIT_CARD' },
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'wh_evt_004',
    eventType: 'CHECKOUT.ORDER.APPROVED',
    summary: 'PayPal Order approved by Rahul Sharma for 5,000 INR',
    resourceType: 'order',
    resourceId: 'PAYPAL-REQ-RAHUL-5K',
    status: 'PENDING',
    payload: { id: 'PAYPAL-REQ-RAHUL-5K', status: 'APPROVED' },
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_REFUNDS: RefundRecord[] = [];


class DatabaseService {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDb();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }
  }

  private loadDb(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        parsed.invoices = parsed.invoices && parsed.invoices.length > 0 ? parsed.invoices : INITIAL_INVOICES;
        parsed.webhookEvents = parsed.webhookEvents && parsed.webhookEvents.length > 0 ? parsed.webhookEvents : INITIAL_WEBHOOK_EVENTS;
        parsed.refunds = parsed.refunds || INITIAL_REFUNDS;
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing db file, initializing seed data:', e);
    }

    const initial: DatabaseSchema = {
      users: [
        {
          id: 'user_demo_1',
          name: 'Priyanshu (Business Owner)',
          email: 'pnagbansi123@gmail.com',
          businessName: 'NextWave Digital Studio',
          currency: 'INR',
          createdAt: new Date().toISOString(),
        },
      ],
      customers: INITIAL_CUSTOMERS,
      transactions: INITIAL_TRANSACTIONS,
      paymentRequests: INITIAL_PAYMENT_REQUESTS,
      aiInsights: INITIAL_INSIGHTS,
      invoices: INITIAL_INVOICES,
      webhookEvents: INITIAL_WEBHOOK_EVENTS,
      refunds: INITIAL_REFUNDS,
      settings: {
        paypalClientId: process.env.PAYPAL_CLIENT_ID || 'sb-client-id-demo',
        paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || 'sb-client-secret-demo',
        paypalEnvironment: (process.env.PAYPAL_ENVIRONMENT as any) || 'sandbox',
        defaultCurrency: 'INR',
        businessName: 'NextWave Digital Studio',
        ownerEmail: 'pnagbansi123@gmail.com',
      },
    };

    this.saveDb(initial);
    return initial;
  }

  private saveDb(data = this.db) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save DB to disk:', err);
    }
  }

  // Getters & Setters
  getUsers(): User[] {
    return this.db.users;
  }

  findUserByEmail(email: string): User | undefined {
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User): User {
    this.db.users.push(user);
    this.saveDb();
    return user;
  }

  getCustomers(): Customer[] {
    return this.db.customers;
  }

  findCustomerById(id: string): Customer | undefined {
    return this.db.customers.find((c) => c.id === id);
  }

  findCustomerByNameOrEmail(query: string): Customer | undefined {
    const q = query.toLowerCase();
    return this.db.customers.find((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }

  addCustomer(customer: Customer): Customer {
    this.db.customers.unshift(customer);
    this.saveDb();
    return customer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const idx = this.db.customers.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.db.customers[idx] = { ...this.db.customers[idx], ...updates };
      this.saveDb();
      return this.db.customers[idx];
    }
    return undefined;
  }

  getTransactions(): Transaction[] {
    return this.db.transactions;
  }

  addTransaction(txn: Transaction): Transaction {
    this.db.transactions.unshift(txn);

    // Update customer stats if completed
    if (txn.status === 'COMPLETED') {
      const customer = this.findCustomerById(txn.customerId);
      if (customer) {
        this.updateCustomer(customer.id, {
          totalPaid: customer.totalPaid + txn.amount,
          pendingAmount: Math.max(0, customer.pendingAmount - txn.amount),
          transactionsCount: customer.transactionsCount + 1,
          lastPaymentDate: txn.paymentDate,
        });
      }
    }

    this.saveDb();
    return txn;
  }

  getPaymentRequests(): PaymentRequest[] {
    return this.db.paymentRequests;
  }

  addPaymentRequest(req: PaymentRequest): PaymentRequest {
    this.db.paymentRequests.unshift(req);
    // Update customer pending amount
    const customer = this.findCustomerById(req.customerId);
    if (customer) {
      this.updateCustomer(customer.id, {
        pendingAmount: customer.pendingAmount + req.amount,
      });
    }
    this.saveDb();
    return req;
  }

  updatePaymentRequest(id: string, updates: Partial<PaymentRequest>): PaymentRequest | undefined {
    const idx = this.db.paymentRequests.findIndex((r) => r.id === id);
    if (idx !== -1) {
      const existing = this.db.paymentRequests[idx];
      this.db.paymentRequests[idx] = { ...existing, ...updates };

      // If marked paid, reduce customer pending
      if (existing.status !== 'PAID' && updates.status === 'PAID') {
        const customer = this.findCustomerById(existing.customerId);
        if (customer) {
          this.updateCustomer(customer.id, {
            pendingAmount: Math.max(0, customer.pendingAmount - existing.amount),
          });
        }
      }

      this.saveDb();
      return this.db.paymentRequests[idx];
    }
    return undefined;
  }

  getInsights(): AIInsight[] {
    return this.db.aiInsights;
  }

  addInsight(insight: AIInsight): AIInsight {
    this.db.aiInsights.unshift(insight);
    this.saveDb();
    return insight;
  }

  getSettings() {
    return this.db.settings;
  }

  updateSettings(settings: Partial<DatabaseSchema['settings']>) {
    this.db.settings = { ...this.db.settings, ...settings };
    this.saveDb();
    return this.db.settings;
  }

  getInvoices(): Invoice[] {
    return this.db.invoices || [];
  }

  findInvoiceById(id: string): Invoice | undefined {
    return (this.db.invoices || []).find((inv) => inv.id === id);
  }

  addInvoice(invoice: Invoice): Invoice {
    if (!this.db.invoices) this.db.invoices = [];
    this.db.invoices.unshift(invoice);

    // Also update or add customer pending amount
    const customer = this.findCustomerById(invoice.customerId);
    if (customer) {
      this.updateCustomer(customer.id, {
        pendingAmount: customer.pendingAmount + invoice.total,
      });
    }

    this.saveDb();
    return invoice;
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | undefined {
    if (!this.db.invoices) this.db.invoices = [];
    const idx = this.db.invoices.findIndex((inv) => inv.id === id);
    if (idx !== -1) {
      const existing = this.db.invoices[idx];
      this.db.invoices[idx] = { ...existing, ...updates };

      if (existing.status !== 'PAID' && updates.status === 'PAID') {
        const customer = this.findCustomerById(existing.customerId);
        if (customer) {
          this.updateCustomer(customer.id, {
            pendingAmount: Math.max(0, customer.pendingAmount - existing.total),
          });
        }
      }

      this.saveDb();
      return this.db.invoices[idx];
    }
    return undefined;
  }

  getWebhookEvents(): WebhookEvent[] {
    return this.db.webhookEvents || [];
  }

  addWebhookEvent(event: WebhookEvent): WebhookEvent {
    if (!this.db.webhookEvents) this.db.webhookEvents = [];
    this.db.webhookEvents.unshift(event);
    this.saveDb();
    return event;
  }

  getRefunds(): RefundRecord[] {
    return this.db.refunds || [];
  }

  processRefund(transactionId: string, amount: number, reason: string): RefundRecord | null {
    const txn = this.db.transactions.find((t) => t.id === transactionId);
    if (!txn || txn.status !== 'COMPLETED') return null;

    const refundRecord: RefundRecord = {
      id: `ref_${Date.now()}`,
      transactionId: txn.id,
      paypalOrderId: txn.paypalOrderId,
      customerName: txn.customerName,
      amount,
      currency: txn.currency,
      reason,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    if (!this.db.refunds) this.db.refunds = [];
    this.db.refunds.unshift(refundRecord);

    // Update original transaction status to REFUNDED if full, or record
    txn.status = 'REFUNDED';

    // Update customer totalPaid
    const customer = this.findCustomerById(txn.customerId);
    if (customer) {
      this.updateCustomer(customer.id, {
        totalPaid: Math.max(0, customer.totalPaid - amount),
      });
    }

    // Add webhook audit event
    this.addWebhookEvent({
      id: `wh_evt_${Date.now()}`,
      eventType: 'PAYMENT.CAPTURE.REFUNDED',
      summary: `PayPal refund of ${amount} ${txn.currency} processed for ${txn.customerName}`,
      resourceType: 'refund',
      resourceId: refundRecord.id,
      status: 'SUCCESS',
      payload: refundRecord,
      createdAt: new Date().toISOString(),
    });

    this.saveDb();
    return refundRecord;
  }

  getCashFlowForecast() {
    const invoices = this.getInvoices();
    const pendingInvoices = invoices.filter((i) => i.status === 'OVERDUE' || i.status === 'SENT' || i.status === 'DRAFT');
    const totalPending = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

    const today = new Date();
    const days = [7, 14, 21, 30];
    const projections = days.map((dayCount) => {
      const d = new Date(today);
      d.setDate(d.getDate() + dayCount);
      // Realistic velocity modeling: 85% recovered in 30 days
      const recoveryRate = dayCount === 7 ? 0.35 : dayCount === 14 ? 0.60 : dayCount === 21 ? 0.75 : 0.88;
      return {
        dayLabel: `Day +${dayCount}`,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        projectedInflow: Math.round(totalPending * recoveryRate),
        cumulativeProbability: Math.round(recoveryRate * 100),
      };
    });

    return {
      totalOutstanding: totalPending,
      predicted30DayTotal: Math.round(totalPending * 0.88),
      confidenceScore: 89,
      projections,
    };
  }

  resetDemoData() {
    this.db.customers = [...INITIAL_CUSTOMERS];
    this.db.transactions = [...INITIAL_TRANSACTIONS];
    this.db.paymentRequests = [...INITIAL_PAYMENT_REQUESTS];
    this.db.aiInsights = [...INITIAL_INSIGHTS];
    this.db.invoices = [...INITIAL_INVOICES];
    this.db.webhookEvents = [...INITIAL_WEBHOOK_EVENTS];
    this.db.refunds = [...INITIAL_REFUNDS];
    this.saveDb();
    return { success: true, message: 'Demo data reset successfully' };
  }
}

export const dbService = new DatabaseService();
