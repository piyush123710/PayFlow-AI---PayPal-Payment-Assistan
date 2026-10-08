import React, { useState, useEffect } from 'react';
import { PaymentRequest } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import {
  X,
  Sparkles,
  Copy,
  Send,
  Check,
  RefreshCw,
  Loader2,
  Mail,
  MessageSquare,
} from 'lucide-react';

interface AiReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PaymentRequest | null;
  currency: string;
}

export const AiReminderModal: React.FC<AiReminderModalProps> = ({
  isOpen,
  onClose,
  request,
  currency,
}) => {
  const { showToast } = useToast();
  const [reminderText, setReminderText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && request) {
      generateReminder();
    }
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  const daysOverdue = Math.max(
    0,
    Math.floor((Date.now() - new Date(request.dueDate).getTime()) / (1000 * 3600 * 24))
  );

  const generateReminder = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: request.customerName,
          amount: request.amount,
          currency: request.currency || currency,
          daysOverdue,
          serviceDescription: request.description,
        }),
      });

      if (!res.ok) throw new Error('Reminder generation failed');
      const data = await res.json();
      setReminderText(data.reminderText);
    } catch (err: any) {
      // Fallback
      setReminderText(
        `Hi ${request.customerName},\n\nI hope you're having a great week! This is a gentle reminder that your invoice of ${currency === 'INR' ? '₹' : '$'}${request.amount.toLocaleString()} for "${request.description}" is currently pending (${daysOverdue} days past due).\n\nYou can conveniently and securely clear this invoice using PayPal at any time.\n\nPlease let me know if you need any assistance or have questions. Thanks!`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reminderText);
    setCopied(true);
    showToast('Reminder copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await fetch(`/api/payment-requests/${request.id}/reminder`, {
        method: 'POST',
      });
      showToast(`Reminder sent to ${request.customerEmail}!`, 'success');
      setTimeout(() => {
        setSending(false);
        onClose();
      }, 700);
    } catch {
      showToast('Error recording reminder transmission', 'error');
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Payment Reminder Generator</h3>
              <p className="text-xs text-slate-400">
                Personalized courtesy note for {request.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Metadata pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="text-slate-400">Client: </span>
              <span className="font-bold text-white">{request.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400">Amount: </span>
              <span className="font-bold text-amber-400">
                {currency === 'INR' ? '₹' : '$'}{request.amount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Overdue: </span>
              <span className="font-bold text-red-400">{daysOverdue} days</span>
            </div>
          </div>

          {/* Editable Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">
                Generated Message (Editable)
              </label>
              <button
                onClick={generateReminder}
                disabled={loading}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate with Gemini</span>
              </button>
            </div>

            {loading ? (
              <div className="h-40 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span>Gemini is crafting a polite, persuasive reminder...</span>
              </div>
            ) : (
              <textarea
                rows={6}
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500 font-sans"
              />
            )}
          </div>

          {/* Action Buttons: Copy, Edit, Send */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleSend}
              disabled={sending || loading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Client</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
