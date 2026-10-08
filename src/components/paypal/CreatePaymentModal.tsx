import React, { useState } from 'react';
import { Customer } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import { X, Plus, Sparkles, Loader2, CreditCard } from 'lucide-react';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onCreated: () => void;
  currency: string;
}

export const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({
  isOpen,
  onClose,
  customers,
  onCreated,
  currency,
}) => {
  const { showToast } = useToast();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'new');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('5000');
  const [description, setDescription] = useState('Website Maintenance & API Integration');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    setLoading(true);
    try {
      let cust = customers.find((c) => c.id === selectedCustomerId);
      const nameToSend = cust ? cust.name : customerName;
      const emailToSend = cust ? cust.email : customerEmail;

      if (!cust && (!nameToSend || !emailToSend)) {
        showToast('Customer name and email are required', 'error');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: cust?.id,
          customerName: nameToSend,
          customerEmail: emailToSend,
          amount: Number(amount),
          description,
          dueDate: new Date(dueDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create payment request');
      }

      const data = await res.json();
      showToast(
        `PayPal order created! Ref: ${data.paypalOrder.id}`,
        'success'
      );
      onCreated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Creation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAiAutoFill = () => {
    setDescription('Full-stack Web Application Milestone & Cloud Deployment Delivery');
    setAmount('15000');
    showToast('AI suggested invoice description & retainer amount', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create PayPal Payment Request</h3>
              <p className="text-xs text-slate-400">Generates instant PayPal checkout order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Customer selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Client / Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
              <option value="new">+ New Customer...</option>
            </select>
          </div>

          {selectedCustomerId === 'new' && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Amount & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Amount ({currency})</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                  {currency === 'INR' ? '₹' : '$'}
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">Invoice / Service Description</label>
              <button
                type="button"
                onClick={handleAiAutoFill}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Assist</span>
              </button>
            </div>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Website development & milestone 1 delivery"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering with PayPal Sandbox...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Generate PayPal Payment Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
