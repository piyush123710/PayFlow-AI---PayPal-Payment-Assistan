import React from 'react';
import { PaymentRequest } from '../../types/index.js';
import { AlertCircle, Bell, ArrowRight, CreditCard, Sparkles } from 'lucide-react';

interface PendingPaymentAlertsProps {
  requests: PaymentRequest[];
  currency: string;
  onOpenReminderModal: (req: PaymentRequest) => void;
  onPayNow: (req: PaymentRequest) => void;
  onTriggerAgent: () => void;
}

export const PendingPaymentAlerts: React.FC<PendingPaymentAlertsProps> = ({
  requests,
  currency,
  onOpenReminderModal,
  onPayNow,
  onTriggerAgent,
}) => {
  const pending = requests.filter((r) => r.status === 'PENDING');
  const totalPending = pending.reduce((sum, r) => sum + r.amount, 0);

  const getDaysOverdue = (dueDateStr: string) => {
    const diff = Date.now() - new Date(dueDateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
  };

  const getPriorityBadge = (days: number) => {
    if (days >= 10) {
      return { label: 'High Priority', color: 'bg-red-500/15 text-red-400 border-red-500/30' };
    }
    if (days >= 5) {
      return { label: 'Medium Priority', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    }
    return { label: 'Low Priority', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-amber-500/20 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">AI Pending Payment Detection</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pending.length} Overdue
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Total Outstanding: <span className="font-bold text-amber-400">{currency === 'INR' ? '₹' : '$'}{totalPending.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerAgent}
          className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-600/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch AI Recovery Agent</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {pending.map((req) => {
          const daysOverdue = getDaysOverdue(req.dueDate);
          const priority = getPriorityBadge(daysOverdue);

          return (
            <div
              key={req.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priority.color}`}>
                    {priority.label}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-400">
                    {daysOverdue} days overdue
                  </span>
                </div>

                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="text-sm font-bold text-white">{req.customerName}</h4>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{req.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-white">
                      {currency === 'INR' ? '₹' : '$'}{req.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-800/60">
                <button
                  onClick={() => onOpenReminderModal(req)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  <Bell className="w-3 h-3 text-amber-400" />
                  <span>AI Reminder</span>
                </button>
                <button
                  onClick={() => onPayNow(req)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-300 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/30 transition-colors"
                  title="Pay directly using PayPal Sandbox"
                >
                  <CreditCard className="w-3 h-3 text-blue-400" />
                  <span>Pay</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
