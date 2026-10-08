import React, { useState } from 'react';
import { Customer, Transaction, PaymentRequest } from '../../types/index.js';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  SendHorizontal,
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  transactions: Transaction[];
  paymentRequests: PaymentRequest[];
  currency: string;
  onCreatePaymentForCustomer: (customer: Customer) => void;
  onSendReminderForCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  transactions,
  paymentRequests,
  currency,
  onCreatePaymentForCustomer,
  onSendReminderForCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const customerTransactions = selectedCustomer
    ? transactions.filter((t) => t.customerId === selectedCustomer.id)
    : [];

  const customerRequests = selectedCustomer
    ? paymentRequests.filter((r) => r.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Total Client Directory:</span>
          <span className="font-bold text-white px-2 py-0.5 rounded-md bg-slate-800">
            {customers.length} Accounts
          </span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 pl-4">Customer Details</th>
                <th className="py-3.5">Contact Info</th>
                <th className="py-3.5">Total Paid</th>
                <th className="py-3.5">Pending Debt</th>
                <th className="py-3.5">Orders</th>
                <th className="py-3.5">Last Settlement</th>
                <th className="py-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {filtered.map((cust) => (
                <tr
                  key={cust.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3.5 pl-4">
                    <div
                      onClick={() => setSelectedCustomer(cust)}
                      className="font-bold text-white group-hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      {cust.name}
                    </div>
                    <div className="text-[11px] text-slate-500">ID: {cust.id}</div>
                  </td>
                  <td className="py-3.5 text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{cust.email}</span>
                    </div>
                    {cust.phone && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{cust.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 font-bold text-emerald-400">
                    {currency === 'INR' ? '₹' : '$'}{cust.totalPaid.toLocaleString()}
                  </td>
                  <td className="py-3.5">
                    {cust.pendingAmount > 0 ? (
                      <span className="font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                        {currency === 'INR' ? '₹' : '$'}{cust.pendingAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="py-3.5 text-slate-300 font-semibold">
                    {cust.transactionsCount} txns
                  </td>
                  <td className="py-3.5 text-slate-400">
                    {cust.lastPaymentDate
                      ? new Date(cust.lastPaymentDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Never'}
                  </td>
                  <td className="py-3.5 text-right pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onCreatePaymentForCustomer(cust)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                        title="Create new PayPal payment request"
                      >
                        <SendHorizontal className="w-3 h-3" />
                        <span>Request</span>
                      </button>
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="View Customer Payment History"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Payment History Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-base">
                  {selectedCustomer.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400">Total Settled</span>
                <p className="text-base font-bold text-emerald-400">
                  {currency === 'INR' ? '₹' : '$'}{selectedCustomer.totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400">Pending Receivables</span>
                <p className="text-base font-bold text-amber-400">
                  {currency === 'INR' ? '₹' : '$'}{selectedCustomer.pendingAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400">Total Transactions</span>
                <p className="text-base font-bold text-white">
                  {selectedCustomer.transactionsCount} payments
                </p>
              </div>
            </div>

            {/* Past Transactions */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-bold text-slate-300">PayPal Transaction History</h4>
              {customerTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No completed transactions recorded yet.</p>
              ) : (
                customerTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{t.description}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {t.paypalOrderId} • {new Date(t.paymentDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">
                        {currency === 'INR' ? '₹' : '$'}{t.amount.toLocaleString()}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  onCreatePaymentForCustomer(selectedCustomer);
                  setSelectedCustomer(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20"
              >
                + Create PayPal Payment Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
