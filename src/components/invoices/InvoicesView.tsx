import React, { useState } from 'react';
import { Invoice } from '../../types/index.js';
import {
  FileText,
  Printer,
  QrCode,
  CreditCard,
  MessageCircle,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';

interface InvoicesViewProps {
  invoices: Invoice[];
  currency: string;
  onOpenCreateInvoice: () => void;
  onPayInvoice: (invoice: Invoice) => void;
  onShowQr: (invoice: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  currency,
  onOpenCreateInvoice,
  onPayInvoice,
  onShowQr,
}) => {
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Settled in Full</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>Overdue</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
            <Clock className="w-3 h-3" />
            <span>Active / Sent</span>
          </span>
        );
    }
  };

  const currSymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Tax Invoices & GST/VAT Billing</h2>
          <p className="text-xs text-slate-400">Formal itemized billing documents with embedded PayPal settlements</p>
        </div>

        <button
          onClick={onOpenCreateInvoice}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Tax Invoice</span>
        </button>
      </div>

      {/* Invoices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 backdrop-blur-sm transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  {inv.invoiceNumber}
                </span>
                {getStatusBadge(inv.status)}
              </div>

              <div className="flex justify-between items-start mt-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{inv.customerName}</h4>
                  <p className="text-xs text-slate-400">{inv.customerEmail}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-white">
                    {currSymbol}{inv.total.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    incl. {inv.taxRate}% GST
                  </span>
                </div>
              </div>

              <div className="my-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                <span className="text-[11px] text-slate-500 block mb-0.5">Primary Service:</span>
                <p className="truncate font-medium">{inv.items[0]?.description || 'Services'}</p>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Due Date: {new Date(inv.dueDate).toLocaleDateString()}</span>
                <span>Terms: {inv.paymentTerms.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={() => setSelectedInvoiceForPrint(inv)}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="View & Print Official PDF Invoice"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Invoice PDF</span>
              </button>

              <button
                onClick={() => onShowQr(inv)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Show PayPal Payment QR"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
              </button>

              {inv.status !== 'PAID' && (
                <button
                  onClick={() => onPayInvoice(inv)}
                  className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-blue-600/20"
                  title="Checkout via PayPal Sandbox"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden p-8 my-8 space-y-6">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Tax Invoice Document
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Sheet */}
            <div className="space-y-6 text-xs text-slate-800">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight">TAX INVOICE</h1>
                  <p className="text-sm font-semibold text-slate-700 mt-1">NextWave Digital Studio</p>
                  <p className="text-slate-500">GSTIN / Tax ID: 27AABCS1429B1Z8</p>
                  <p className="text-slate-500">Merchant: pnagbansi123@gmail.com</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-base font-bold text-blue-600">
                    {selectedInvoiceForPrint.invoiceNumber}
                  </div>
                  <p className="text-slate-500 mt-1">
                    Date: {new Date(selectedInvoiceForPrint.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-slate-500">
                    Due Date: {new Date(selectedInvoiceForPrint.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-slate-500">
                    Terms: {selectedInvoiceForPrint.paymentTerms.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Billed To */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed To:</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedInvoiceForPrint.customerName}</p>
                <p className="text-slate-600">{selectedInvoiceForPrint.customerEmail}</p>
                {selectedInvoiceForPrint.customerPhone && (
                  <p className="text-slate-600">{selectedInvoiceForPrint.customerPhone}</p>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoiceForPrint.items.map((it, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2.5 font-medium text-slate-900">{it.description}</td>
                      <td className="py-2.5 text-center text-slate-600">{it.quantity}</td>
                      <td className="py-2.5 text-right text-slate-600">
                        {currSymbol}{it.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        {currSymbol}{it.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">{currSymbol}{selectedInvoiceForPrint.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST ({selectedInvoiceForPrint.taxRate}%):</span>
                    <span className="font-semibold text-slate-900">+{currSymbol}{selectedInvoiceForPrint.taxAmount.toLocaleString()}</span>
                  </div>
                  {selectedInvoiceForPrint.discount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Discount:</span>
                      <span className="font-semibold text-red-600">-{currSymbol}{selectedInvoiceForPrint.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-extrabold text-slate-950">
                    <span>Total Due:</span>
                    <span className="text-blue-600 text-base">{currSymbol}{selectedInvoiceForPrint.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* PayPal Settlement Footer */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <span>Pay Online Securely with PayPal</span>
                  </span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Order Ref: <span className="font-mono font-bold">{selectedInvoiceForPrint.paypalOrderId}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-sm">
                    PayPal Sandbox Verified
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t">
                {selectedInvoiceForPrint.notes}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
