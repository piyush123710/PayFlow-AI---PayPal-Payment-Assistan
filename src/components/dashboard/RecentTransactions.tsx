import React from 'react';
import { Transaction } from '../../types/index.js';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
  onViewAll: () => void;
  onSelectTransaction: (txn: Transaction) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  currency,
  onViewAll,
  onSelectTransaction,
}) => {
  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Recent PayPal Transactions</h3>
          <p className="text-xs text-slate-400">Latest settled and pending merchant activities</p>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pl-2">Customer & Details</th>
              <th className="pb-3">PayPal Order ID</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right pr-2">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-xs">
            {transactions.slice(0, 5).map((txn) => (
              <tr
                key={txn.id}
                onClick={() => onSelectTransaction(txn)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                <td className="py-3 pl-2">
                  <div className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    <span>{txn.customerName}</span>
                    {txn.isAnomaly && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30" title={txn.anomalyReason}>
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                        Anomaly Flagged
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-xs">{txn.description}</div>
                </td>
                <td className="py-3 text-slate-400 font-mono text-[11px]">
                  {txn.paypalOrderId}
                </td>
                <td className="py-3 text-slate-400">
                  {formatDate(txn.paymentDate)}
                </td>
                <td className="py-3">
                  {getStatusBadge(txn.status)}
                </td>
                <td className="py-3 text-right pr-2 font-bold text-white">
                  {currency === 'INR' ? '₹' : '$'}{txn.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
