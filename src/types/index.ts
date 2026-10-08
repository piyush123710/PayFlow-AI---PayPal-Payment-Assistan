export interface User {
  id: string;
  name: string;
  email: string;
  businessName: string;
  currency: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalPaid: number;
  pendingAmount: number;
  transactionsCount: number;
  lastPaymentDate?: string;
  avatar?: string;
  createdAt: string;
}

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: string;
  paypalOrderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  paymentMethod: 'PAYPAL' | 'PAYPAL_CARD' | 'PAYPAL_CREDIT';
  paymentDate: string;
  createdAt: string;
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export type PaymentRequestStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';

export interface PaymentRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  description: string;
  paypalOrderId?: string;
  status: PaymentRequestStatus;
  dueDate: string;
  createdAt: string;
  reminderSentCount: number;
  lastReminderDate?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  paymentTerms: 'DUE_ON_RECEIPT' | 'NET_15' | 'NET_30' | 'NET_60';
  notes?: string;
  paypalOrderId?: string;
  dueDate: string;
  createdAt: string;
  paidAt?: string;
}

export interface WebhookEvent {
  id: string;
  eventType: 'PAYMENT.CAPTURE.COMPLETED' | 'PAYMENT.CAPTURE.DENIED' | 'CHECKOUT.ORDER.APPROVED' | 'CUSTOMER.DISPUTE.CREATED' | 'PAYMENT.CAPTURE.REFUNDED';
  summary: string;
  resourceType: 'capture' | 'order' | 'dispute' | 'refund';
  resourceId: string;
  status: 'SUCCESS' | 'PROCESSED' | 'PENDING' | 'SIMULATED';
  payload: any;
  createdAt: string;
}

export interface RefundRecord {
  id: string;
  transactionId: string;
  paypalOrderId: string;
  customerName: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'COMPLETED' | 'PENDING';
  createdAt: string;
}

export interface AIInsight {
  id: string;
  type: 'REVENUE' | 'PENDING' | 'ANOMALY' | 'CUSTOMER' | 'RECOMMENDATION' | 'CASH_FLOW' | 'DISPUTE_RISK';
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  metric?: string;
  actionLabel?: string;
  actionCommand?: string;
  createdAt: string;
}

export interface SummaryData {
  totalRevenue: number;
  pendingAmount: number;
  successfulCount: number;
  failedCount: number;
  customerCount: number;
  pendingCustomerCount: number;
  averageTransactionValue: number;
  monthlyRevenue: Array<{ month: string; revenue: number; transactions: number }>;
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionType?: 'SHOW_PENDING' | 'PROPOSE_PAYMENT_REQUEST' | 'SHOW_REMINDERS' | 'SHOW_INSIGHTS' | 'ANALYTICS' | 'AGENT_WORKFLOW' | 'INVOICE_CREATED' | 'REFUND_INITIATED';
  actionData?: any;
  requiresConfirmation?: boolean;
  confirmationPrompt?: string;
  confirmed?: boolean;
}

