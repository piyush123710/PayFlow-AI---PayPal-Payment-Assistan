import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { useToast } from '../../context/ToastContext.js';
import {
  X,
  QrCode,
  Download,
  Copy,
  MessageCircle,
  Mail,
  ShieldCheck,
  Check,
  CreditCard,
} from 'lucide-react';

interface PayPalQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  currency: string;
  customerName: string;
  orderId?: string;
  description: string;
}

export const PayPalQrModal: React.FC<PayPalQrModalProps> = ({
  isOpen,
  onClose,
  title,
  amount,
  currency,
  customerName,
  orderId,
  description,
}) => {
  const { showToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const paymentUrl = `${window.location.origin}/checkout?order=${orderId || 'SBX-DEMO'}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(
        paymentUrl,
        {
          width: 280,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [isOpen, paymentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    showToast('Payment link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `PayPal_QR_${orderId || 'Payment'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('QR code downloaded!', 'success');
  };

  const currSymbol = currency === 'INR' ? '₹' : '$';
  const shareText = encodeURIComponent(
    `Hi ${customerName}, please complete your PayPal payment of ${currSymbol}${amount.toLocaleString()} for "${description}". You can pay securely here: ${paymentUrl}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden p-6 text-center space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">PayPal Payment QR</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <span className="text-xs text-slate-400">{title}</span>
          <p className="text-2xl font-black text-white mt-0.5">
            {currSymbol}{amount.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">For {customerName}</p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl shadow-xl mx-auto w-fit flex items-center justify-center border-4 border-blue-500/30">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="PayPal QR Code" className="w-48 h-48 rounded-lg" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-500 text-xs">
              Generating PayPal QR...
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400">
          Scan with PayPal app or any smartphone camera to launch instant sandbox checkout.
        </p>

        {/* 1-Click Share & Download Actions */}
        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 font-semibold flex flex-col items-center gap-1 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-[10px]">WhatsApp</span>
          </a>

          <button
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex flex-col items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="text-[10px]">{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-2.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 font-semibold flex flex-col items-center gap-1 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px]">Save QR</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
