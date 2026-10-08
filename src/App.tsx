import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastProvider, useToast } from './context/ToastContext.js';
import { Sidebar, NavTab } from './components/layout/Sidebar.js';
import { Navbar } from './components/layout/Navbar.js';
import { MetricCards } from './components/dashboard/MetricCards.js';
import { RevenueChart } from './components/dashboard/RevenueChart.js';
import { StatusChart } from './components/dashboard/StatusChart.js';
import { PendingPaymentAlerts } from './components/dashboard/PendingPaymentAlerts.js';
import { RecentTransactions } from './components/dashboard/RecentTransactions.js';
import { AiAssistantView } from './components/assistant/AiAssistantView.js';
import { InvoicesView } from './components/invoices/InvoicesView.js';
import { TransactionsView } from './components/transactions/TransactionsView.js';
import { CustomersView } from './components/customers/CustomersView.js';
import { PaymentRequestsView } from './components/payment-requests/PaymentRequestsView.js';
import { CashFlowForecastView } from './components/forecast/CashFlowForecastView.js';
import { AnalyticsView } from './components/analytics/AnalyticsView.js';
import { InsightsView } from './components/insights/InsightsView.js';
import { WebhooksAuditView } from './components/webhooks/WebhooksAuditView.js';
import { SettingsView } from './components/settings/SettingsView.js';
import { PayPalCheckoutModal } from './components/paypal/PayPalCheckoutModal.js';
import { CreatePaymentModal } from './components/paypal/CreatePaymentModal.js';
import { InvoiceGeneratorModal } from './components/invoices/InvoiceGeneratorModal.js';
import { PayPalQrModal } from './components/paypal/PayPalQrModal.js';
import { RefundModal } from './components/refunds/RefundModal.js';
import { AiReminderModal } from './components/reminders/AiReminderModal.js';
import { AuthModal } from './components/auth/AuthModal.js';
import {
  Transaction,
  Customer,
  PaymentRequest,
  SummaryData,
  AIInsight,
  Invoice,
} from './types/index.js';
import { Bot, Sparkles, Loader2, FileText } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [anomalies, setAnomalies] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutOrderData, setCheckoutOrderData] = useState<any>(null);

  const [createPaymentModalOpen, setCreatePaymentModalOpen] = useState(false);
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);

  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderRequest, setReminderRequest] = useState<PaymentRequest | null>(null);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{
    title: string;
    amount: number;
    customerName: string;
    orderId?: string;
    description: string;
  } | null>(null);

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundTxn, setRefundTxn] = useState<Transaction | null>(null);

  const currency = user?.currency || 'INR';

  const loadAllData = async () => {
    try {
      const [sumRes, txnRes, custRes, reqRes, invRes, insRes, anomRes] = await Promise.all([
        fetch('/api/transactions/summary'),
        fetch('/api/transactions'),
        fetch('/api/customers'),
        fetch('/api/payment-requests'),
        fetch('/api/invoices'),
        fetch('/api/ai/insights'),
        fetch('/api/transactions/anomalies'),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (txnRes.ok) setTransactions(await txnRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
      if (reqRes.ok) setPaymentRequests(await reqRes.json());
      if (invRes.ok) setInvoices(await invRes.json());
      if (insRes.ok) setInsights(await insRes.json());
      if (anomRes.ok) setAnomalies(await anomRes.json());
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const handleResetData = async () => {
    try {
      const res = await fetch('/api/transactions/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Demo data & invoices restored!', 'success');
        loadAllData();
      }
    } catch {
      showToast('Reset failed', 'error');
    }
  };

  const handleOpenCheckoutForRequest = (req: PaymentRequest) => {
    setCheckoutOrderData({
      orderId: req.paypalOrderId,
      paymentRequestId: req.id,
      customerId: req.customerId,
      customerName: req.customerName,
      customerEmail: req.customerEmail,
      amount: req.amount,
      description: req.description,
      currency: req.currency,
    });
    setCheckoutModalOpen(true);
  };

  const handleOpenCheckoutForInvoice = (inv: Invoice) => {
    setCheckoutOrderData({
      orderId: inv.paypalOrderId,
      customerId: inv.customerId,
      customerName: inv.customerName,
      customerEmail: inv.customerEmail,
      amount: inv.total,
      description: `Tax Invoice ${inv.invoiceNumber}`,
      currency: inv.currency,
    });
    setCheckoutModalOpen(true);
  };

  const handleShowQrForInvoice = (inv: Invoice) => {
    setQrModalData({
      title: `Invoice ${inv.invoiceNumber}`,
      amount: inv.total,
      customerName: inv.customerName,
      orderId: inv.paypalOrderId,
      description: inv.items[0]?.description || 'Services',
    });
    setQrModalOpen(true);
  };

  const handleOpenReminderForRequest = (req: PaymentRequest) => {
    setReminderRequest(req);
    setReminderModalOpen(true);
  };

  const handleExecuteAiCommand = (command: string) => {
    setActiveTab('assistant');
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs text-slate-400">Initializing PayFlow AI workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  const pendingRequestsCount = paymentRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingRequestsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenCreatePayment={() => setCreatePaymentModalOpen(true)}
          onOpenAiChat={() => setActiveTab('assistant')}
          onResetData={handleResetData}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <MetricCards summary={summary} currency={currency} />

              <PendingPaymentAlerts
                requests={paymentRequests}
                currency={currency}
                onOpenReminderModal={handleOpenReminderForRequest}
                onPayNow={handleOpenCheckoutForRequest}
                onTriggerAgent={() => setActiveTab('assistant')}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RevenueChart
                    data={summary?.monthlyRevenue || []}
                    currency={currency}
                  />
                </div>
                <div>
                  <StatusChart
                    data={summary?.statusBreakdown || []}
                  />
                </div>
              </div>

              <RecentTransactions
                transactions={transactions}
                currency={currency}
                onViewAll={() => setActiveTab('transactions')}
                onSelectTransaction={(txn) => {
                  if (txn.status === 'PENDING') {
                    setCheckoutOrderData({
                      orderId: txn.paypalOrderId,
                      customerId: txn.customerId,
                      customerName: txn.customerName,
                      customerEmail: txn.customerEmail,
                      amount: txn.amount,
                      description: txn.description,
                      currency: txn.currency,
                    });
                    setCheckoutModalOpen(true);
                  }
                }}
              />
            </div>
          )}

          {/* TAB 2: AI ASSISTANT */}
          {activeTab === 'assistant' && (
            <AiAssistantView
              currency={currency}
              onOpenPaymentModal={(reqData) => {
                setCheckoutOrderData(reqData);
                setCheckoutModalOpen(true);
              }}
              onRefreshData={loadAllData}
            />
          )}

          {/* TAB 3: TAX INVOICES */}
          {activeTab === 'invoices' && (
            <div className="max-w-7xl mx-auto">
              <InvoicesView
                invoices={invoices}
                currency={currency}
                onOpenCreateInvoice={() => setCreateInvoiceModalOpen(true)}
                onPayInvoice={handleOpenCheckoutForInvoice}
                onShowQr={handleShowQrForInvoice}
              />
            </div>
          )}

          {/* TAB 4: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h2 className="text-base font-bold text-white">Merchant Transactions</h2>
                <p className="text-xs text-slate-400">Complete record of PayPal orders, settlements, and AI anomaly scores</p>
              </div>
              <TransactionsView
                transactions={transactions}
                currency={currency}
                onPayNow={(txn) => {
                  setCheckoutOrderData({
                    orderId: txn.paypalOrderId,
                    customerId: txn.customerId,
                    customerName: txn.customerName,
                    customerEmail: txn.customerEmail,
                    amount: txn.amount,
                    description: txn.description,
                    currency: txn.currency,
                  });
                  setCheckoutModalOpen(true);
                }}
                onInitiateRefund={(txn) => {
                  setRefundTxn(txn);
                  setRefundModalOpen(true);
                }}
              />
            </div>
          )}

          {/* TAB 5: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h2 className="text-base font-bold text-white">Client Portfolio</h2>
                <p className="text-xs text-slate-400">Manage client accounts, track outstanding liabilities, and review payment histories</p>
              </div>
              <CustomersView
                customers={customers}
                transactions={transactions}
                paymentRequests={paymentRequests}
                currency={currency}
                onCreatePaymentForCustomer={(cust) => {
                  setCreatePaymentModalOpen(true);
                }}
                onSendReminderForCustomer={(cust) => {
                  const req = paymentRequests.find((r) => r.customerId === cust.id && r.status === 'PENDING');
                  if (req) {
                    handleOpenReminderForRequest(req);
                  } else {
                    showToast(`${cust.name} currently has no pending invoices!`, 'info');
                  }
                }}
              />
            </div>
          )}

          {/* TAB 6: PAYMENT REQUESTS */}
          {activeTab === 'payment-requests' && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h2 className="text-base font-bold text-white">PayPal Payment Requests & Links</h2>
                <p className="text-xs text-slate-400">Generate PayPal checkout links, automate client reminders, and monitor invoice lifecycles</p>
              </div>
              <PaymentRequestsView
                paymentRequests={paymentRequests}
                currency={currency}
                onOpenCreateModal={() => setCreatePaymentModalOpen(true)}
                onOpenCheckoutModal={handleOpenCheckoutForRequest}
                onOpenReminderModal={handleOpenReminderForRequest}
              />
            </div>
          )}

          {/* TAB 7: CASH FLOW FORECAST */}
          {activeTab === 'forecast' && (
            <div className="max-w-7xl mx-auto">
              <CashFlowForecastView currency={currency} />
            </div>
          )}

          {/* TAB 8: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h2 className="text-base font-bold text-white">Revenue & Payment Analytics</h2>
                <p className="text-xs text-slate-400">Deep-dive financial metrics and client contribution trends</p>
              </div>
              <AnalyticsView
                summary={summary}
                customers={customers}
                transactions={transactions}
                currency={currency}
              />
            </div>
          )}

          {/* TAB 9: AI INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-4">
                <h2 className="text-base font-bold text-white">AI Financial Insights & Anomaly Detection</h2>
                <p className="text-xs text-slate-400">Actionable business intelligence and transaction anomaly detection powered by Gemini</p>
              </div>
              <InsightsView
                insights={insights}
                anomalies={anomalies}
                currency={currency}
                onExecuteCommand={handleExecuteAiCommand}
              />
            </div>
          )}

          {/* TAB 10: PAYPAL WEBHOOKS AUDITOR */}
          {activeTab === 'webhooks' && (
            <div className="max-w-7xl mx-auto">
              <WebhooksAuditView />
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-7xl mx-auto">
              <SettingsView
                onResetData={handleResetData}
                currency={currency}
              />
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      <PayPalCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        orderData={checkoutOrderData}
        onPaymentSuccess={() => {
          loadAllData();
        }}
        currency={currency}
      />

      <CreatePaymentModal
        isOpen={createPaymentModalOpen}
        onClose={() => setCreatePaymentModalOpen(false)}
        customers={customers}
        onCreated={() => {
          loadAllData();
          setActiveTab('payment-requests');
        }}
        currency={currency}
      />

      <InvoiceGeneratorModal
        isOpen={createInvoiceModalOpen}
        onClose={() => setCreateInvoiceModalOpen(false)}
        customers={customers}
        onInvoiceCreated={() => {
          loadAllData();
          setActiveTab('invoices');
        }}
        currency={currency}
      />

      {qrModalData && (
        <PayPalQrModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          title={qrModalData.title}
          amount={qrModalData.amount}
          currency={currency}
          customerName={qrModalData.customerName}
          orderId={qrModalData.orderId}
          description={qrModalData.description}
        />
      )}

      <RefundModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        transaction={refundTxn}
        onRefundCompleted={() => {
          loadAllData();
        }}
        currency={currency}
      />

      <AiReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        request={reminderRequest}
        currency={currency}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
