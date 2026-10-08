import React, { useState } from 'react';
import { Transaction } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import { X, RotateCcw, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onRefundCompleted: () => void;
  currency: string;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onRefundCompleted,
  currency,
}) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState('Service Milestone Revision');
  const [amount, setAmount] = useState<string>(transaction ? String(transaction.amount) : '0');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          amount: Number(amount) || transaction.amount,
          reason,
        }),
      });

      if (!res.ok) throw new Error('Refund failed');
      showToast(`PayPal refund of ${currency === 'INR' ? '₹' : '$'}${amount} processed!`, 'success');
      onRefundCompleted();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error processing refund', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Process PayPal Refund</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Target Client:</span>
            <p className="font-bold text-white text-sm">{transaction.customerName}</p>
            <p className="text-[11px] font-mono text-slate-400">{transaction.paypalOrderId}</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Refund Amount ({currency})</label>
            <input
              type="number"
              required
              max={transaction.amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Reason for Refund</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Customer Request">Customer Request / Mutual Cancellation</option>
              <option value="Service Milestone Revision">Service Milestone Revision</option>
              <option value="Duplicate Order">Duplicate Order Settlement</option>
              <option value="Goodwill Dispute Prevention">Dispute Prevention Resolution</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Execute PayPal Settlement Refund</span>}
          </button>
        </form>
      </div>
    </div>
  );
};
