import React, { useState } from 'react';
import { PaymentRequest } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import {
  SendHorizontal,
  Clock,
  CheckCircle2,
  Bell,
  CreditCard,
  Copy,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface PaymentRequestsViewProps {
  paymentRequests: PaymentRequest[];
  currency: string;
  onOpenCreateModal: () => void;
  onOpenCheckoutModal: (req: PaymentRequest) => void;
  onOpenReminderModal: (req: PaymentRequest) => void;
}

export const PaymentRequestsView: React.FC<PaymentRequestsViewProps> = ({
  paymentRequests,
  currency,
  onOpenCreateModal,
  onOpenCheckoutModal,
  onOpenReminderModal,
}) => {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  const filtered = paymentRequests.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const getDaysOverdue = (dueDateStr: string) => {
    const diff = Date.now() - new Date(dueDateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
  };

  const handleCopyLink = (req: PaymentRequest) => {
    const link = `${window.location.origin}/checkout?order=${req.paypalOrderId || req.id}`;
    navigator.clipboard.writeText(link);
    showToast('Direct PayPal payment link copied!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['ALL', 'PENDING', 'PAID'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === st
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New PayPal Request</span>
        </button>
      </div>

      {/* Grid of Payment Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((req) => {
          const isPending = req.status === 'PENDING';
          const daysOverdue = getDaysOverdue(req.dueDate);

          return (
            <div
              key={req.id}
              className={`p-5 rounded-2xl bg-slate-900/70 border backdrop-blur-sm transition-all flex flex-col justify-between ${
                isPending
                  ? daysOverdue > 7
                    ? 'border-red-500/30 hover:border-red-500/50'
                    : 'border-amber-500/30 hover:border-amber-500/50'
                  : 'border-emerald-500/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isPending
                        ? daysOverdue > 0
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isPending ? (daysOverdue > 0 ? `${daysOverdue} Days Overdue` : 'Pending') : 'Paid & Settled'}
                  </span>

                  <span className="text-lg font-black text-white">
                    {currency === 'INR' ? '₹' : '$'}{req.amount.toLocaleString()}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-0.5">{req.customerName}</h4>
                <p className="text-xs text-slate-400">{req.customerEmail}</p>

                <div className="my-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                  <span className="text-[11px] text-slate-400 block mb-0.5 font-medium">Service Description:</span>
                  <p className="truncate">{req.description}</p>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>PayPal Ref:</span>
                    <span className="text-slate-300">{req.paypalOrderId || 'PENDING-SBX'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span>{new Date(req.dueDate).toLocaleDateString()}</span>
                  </div>
                  {req.reminderSentCount > 0 && (
                    <div className="flex justify-between text-amber-400/90 font-sans">
                      <span>Reminders Dispatched:</span>
                      <span>{req.reminderSentCount} times</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                {isPending ? (
                  <>
                    <button
                      onClick={() => onOpenCheckoutModal(req)}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                      title="Checkout directly via PayPal Sandbox"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>PayPal Pay</span>
                    </button>

                    <button
                      onClick={() => onOpenReminderModal(req)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                      title="Draft personalized AI reminder"
                    >
                      <Bell className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleCopyLink(req)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Copy PayPal payment URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Settled in Full</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
