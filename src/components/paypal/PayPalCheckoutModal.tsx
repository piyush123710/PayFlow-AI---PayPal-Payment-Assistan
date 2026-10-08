import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useToast } from '../../context/ToastContext.js';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId?: string;
    paymentRequestId?: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    amount?: number;
    description?: string;
    currency?: string;
  } | null;
  onPaymentSuccess: () => void;
  currency: string;
}

export const PayPalCheckoutModal: React.FC<PayPalCheckoutModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess,
  currency,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [activePaymentMethod, setActivePaymentMethod] = useState<'PAYPAL' | 'CARD'>('PAYPAL');

  if (!isOpen || !orderData) return null;

  const amount = orderData.amount || 5000;
  const orderId = orderData.orderId || `PAYPAL-SBX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const handleCapturePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentRequestId: orderData.paymentRequestId,
          customerId: orderData.customerId,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          amount,
          description: orderData.description,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Capture failed');
      }

      const data = await res.json();
      setReceipt(data);
      setCompleted(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast(`PayPal payment of ₹${amount.toLocaleString()} captured successfully!`, 'success');
      onPaymentSuccess();
    } catch (err: any) {
      showToast(err.message || 'Payment execution failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-md">
              <span className="font-serif italic text-lg">P</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>PayPal Checkout</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  SANDBOX
                </span>
              </h3>
              <p className="text-xs text-slate-300">Secure Merchant Settlement Gateway</p>
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
        {!completed ? (
          <div className="p-6 space-y-5">
            {/* Order Summary Card */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Billed To</span>
                  <p className="text-sm font-bold text-white">{orderData.customerName || 'Customer'}</p>
                  <p className="text-xs text-slate-400">{orderData.customerEmail || 'buyer@example.com'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Order Total</span>
                  <p className="text-2xl font-black text-white">
                    {currency === 'INR' ? '₹' : '$'}{amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between">
                <span>Description:</span>
                <span className="text-slate-200 font-medium">{orderData.description || 'Professional Services'}</span>
              </div>
              <div className="pt-1 text-[11px] text-slate-500 flex justify-between font-mono">
                <span>PayPal Order Ref:</span>
                <span>{orderId}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('PAYPAL')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    activePaymentMethod === 'PAYPAL'
                      ? 'bg-blue-600/15 border-blue-500 text-blue-400 font-bold'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-serif italic text-sm">
                    P
                  </div>
                  <span className="text-xs">PayPal Balance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePaymentMethod('CARD')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    activePaymentMethod === 'CARD'
                      ? 'bg-blue-600/15 border-blue-500 text-blue-400 font-bold'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-slate-300" />
                  <span className="text-xs">Credit / Debit Card</span>
                </button>
              </div>
            </div>

            {/* Simulated Card Form if Card selected */}
            {activePaymentMethod === 'CARD' && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
                <input
                  type="text"
                  readOnly
                  value="•••• •••• •••• 4242 (PayPal Sandbox Test Card)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-mono text-xs focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    readOnly
                    value="Exp: 12/28"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    readOnly
                    value="CVV: 123"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* PayPal Button / Call to Action */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleCapturePayment}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Communicating with PayPal Sandbox...</span>
                  </>
                ) : (
                  <>
                    <span className="font-serif italic text-base">Pay</span>
                    <span className="font-sans font-extrabold text-blue-900">Pal</span>
                    <span className="text-slate-900 font-bold ml-1">
                      • {currency === 'INR' ? '₹' : '$'}{amount.toLocaleString()}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by PayPal 256-Bit Sandbox Security & Encryption</span>
              </div>
            </div>
          </div>
        ) : (
          /* Receipt / Success Screen */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Payment Captured!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Transaction finalized in PayPal Sandbox & recorded into PayFlow AI ledger.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {currency === 'INR' ? '₹' : '$'}{amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">PayPal Order ID:</span>
                <span className="font-mono text-slate-300">{receipt?.transaction?.paypalOrderId || orderId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Payer Name:</span>
                <span className="text-slate-300">{orderData.customerName || 'Customer'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  COMPLETED
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
