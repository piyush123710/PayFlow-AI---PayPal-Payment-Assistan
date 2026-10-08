import React, { useState } from 'react';
import { Transaction } from '../../types/index.js';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  currency: string;
  onPayNow?: (txn: Transaction) => void;
  onInitiateRefund?: (txn: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  currency,
  onPayNow,
  onInitiateRefund,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED'>('ALL');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const filtered = transactions.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.paypalOrderId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'PayPal Order ID', 'Customer Name', 'Customer Email', 'Amount', 'Currency', 'Status', 'Date', 'Description'];
    const rows = filtered.map((t) => [
      t.id,
      t.paypalOrderId,
      `"${t.customerName}"`,
      t.customerEmail,
      t.amount,
      t.currency,
      t.status,
      t.paymentDate,
      `"${t.description}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PayFlow_PayPal_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer, PayPal order ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status filter tabs & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['ALL', 'COMPLETED', 'PENDING', 'FAILED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 pl-4">Customer & Service</th>
                <th className="py-3.5">PayPal Order ID</th>
                <th className="py-3.5">Payment Method</th>
                <th className="py-3.5">Date</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pl-4">
                      <div className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        <span>{txn.customerName}</span>
                        {txn.isAnomaly && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            title={txn.anomalyReason}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                            AI Anomaly
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{txn.description}</div>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-300">
                      {txn.paypalOrderId}
                    </td>
                    <td className="py-3 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                        {txn.paymentMethod === 'PAYPAL_CARD' ? 'PayPal Card' : 'PayPal Wallet'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(txn.paymentDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3">{getStatusBadge(txn.status)}</td>
                    <td className="py-3 text-right pr-4 font-bold text-white text-sm">
                      {currency === 'INR' ? '₹' : '$'}{txn.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Inspector Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Transaction Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-white">{selectedTxn.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300">{selectedTxn.customerEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">PayPal Order ID:</span>
                <span className="font-mono text-slate-300">{selectedTxn.paypalOrderId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {currency === 'INR' ? '₹' : '$'}{selectedTxn.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Status:</span>
                <span>{getStatusBadge(selectedTxn.status)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Date:</span>
                <span className="text-slate-300">{new Date(selectedTxn.paymentDate).toLocaleString()}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 block mb-1">Description:</span>
                <p className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
                  {selectedTxn.description}
                </p>
              </div>

              {selectedTxn.isAnomaly && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Gemini AI Anomaly Flag</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{selectedTxn.anomalyReason}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {selectedTxn.status === 'COMPLETED' && onInitiateRefund && (
                <button
                  onClick={() => {
                    onInitiateRefund(selectedTxn);
                    setSelectedTxn(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Issue PayPal Refund</span>
                </button>
              )}
              <button
                onClick={() => setSelectedTxn(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
