import React, { useState } from 'react';
import { Customer, InvoiceItem } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Printer,
  Sparkles,
  Loader2,
  CreditCard,
} from 'lucide-react';

interface InvoiceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onInvoiceCreated: () => void;
  currency: string;
}

export const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({
  isOpen,
  onClose,
  customers,
  onInvoiceCreated,
  currency,
}) => {
  const { showToast } = useToast();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'new');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<'DUE_ON_RECEIPT' | 'NET_15' | 'NET_30'>('NET_15');
  const [taxRate, setTaxRate] = useState<number>(18);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('Thank you for your business. Please complete settlement securely via PayPal.');
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<Array<{ description: string; quantity: number; unitPrice: number }>>([
    { description: 'Cloud Architecture & Microservices Implementation', quantity: 1, unitPrice: 15000 },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 1000 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: val } : it))
    );
  };

  const subtotal = items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const taxAmount = Math.round((subtotal * (Number(taxRate) / 100)) * 100) / 100;
  const total = Math.max(0, Math.round((subtotal + taxAmount - Number(discount)) * 100) / 100);

  const currSymbol = currency === 'INR' ? '₹' : '$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cust = customers.find((c) => c.id === selectedCustomerId);
      const nameToSend = cust ? cust.name : customerName;
      const emailToSend = cust ? cust.email : customerEmail;

      if (!nameToSend || !emailToSend) {
        showToast('Customer name and email are required', 'error');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: cust?.id,
          customerName: nameToSend,
          customerEmail: emailToSend,
          customerPhone: customerPhone || cust?.phone,
          items,
          taxRate,
          discount,
          paymentTerms,
          notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate tax invoice');
      }

      const data = await res.json();
      showToast(`Tax Invoice ${data.invoice.invoiceNumber} created and linked to PayPal!`, 'success');
      onInvoiceCreated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Creation error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAiAutoPopulate = () => {
    setItems([
      { description: 'Quarterly Frontend UI/UX Design Sprint & Prototyping', quantity: 1, unitPrice: 20000 },
      { description: 'PayPal Smart Checkout & Webhook Integration Maintenance', quantity: 1, unitPrice: 12000 },
    ]);
    setTaxRate(18);
    setDiscount(2000);
    showToast('AI loaded standard retainer scope & tax lines!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden p-6 my-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate Enterprise Tax Invoice</h3>
              <p className="text-xs text-slate-400">Automated GST / VAT calculation with PayPal Sandbox link</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Client / Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
                <option value="new">+ Enter New Client</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                <option value="NET_15">Net 15 Days</option>
                <option value="NET_30">Net 30 Days</option>
              </select>
            </div>
          </div>

          {selectedCustomerId === 'new' && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <input
                type="text"
                required
                placeholder="Client Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
              <input
                type="email"
                required
                placeholder="Client Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
              <input
                type="text"
                placeholder="Phone (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          )}

          {/* Line Items Manager */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200">Itemized Billable Services</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiAutoPopulate}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Preload Scope</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    required
                    placeholder="Service description"
                    value={it.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center text-white"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1.5 text-slate-500 font-bold">{currSymbol}</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Rate"
                      value={it.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-5 pr-2 py-1.5 text-right font-bold text-white"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tax, Discount, Subtotal & Total */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-white">{currSymbol}{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span>Tax Rate (GST/VAT):</span>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18% (Standard IT/Services)</option>
                  <option value={28}>28%</option>
                </select>
              </span>
              <span className="font-semibold text-white">+{currSymbol}{taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span>Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right text-white"
                />
              </span>
              <span className="font-semibold text-red-400">-{currSymbol}{discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-extrabold">
              <span className="text-white">Invoice Net Payable:</span>
              <span className="text-emerald-400 text-base">{currSymbol}{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Issuing Tax Invoice & PayPal Order...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Issue Invoice & Generate PayPal Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
