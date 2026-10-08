import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.js';
import {
  Settings,
  CreditCard,
  Key,
  Building,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Shield,
  Loader2,
} from 'lucide-react';

interface SettingsViewProps {
  onResetData: () => void;
  currency: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetData, currency }) => {
  const { showToast } = useToast();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'live'>('sandbox');
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [businessName, setBusinessName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setClientId(data.paypalClientId || '');
        setClientSecret(data.paypalClientSecret || '');
        setEnvironment(data.paypalEnvironment || 'sandbox');
        setDefaultCurrency(data.defaultCurrency || 'INR');
        setBusinessName(data.businessName || 'NextWave Digital Studio');
        setOwnerEmail(data.ownerEmail || 'pnagbansi123@gmail.com');
        setHasGeminiKey(data.hasGeminiKey);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalClientId: clientId,
          paypalClientSecret: clientSecret,
          paypalEnvironment: environment,
          defaultCurrency,
          businessName,
          ownerEmail,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');
      showToast('Settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-base font-bold text-white">Merchant & Payment Settings</h2>
          <p className="text-xs text-slate-400">Configure PayPal Sandbox credentials and business preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* PayPal Credentials Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">PayPal REST API Credentials</h3>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300">
            💡 <span className="font-semibold text-white">Hackathon Sandbox Ready:</span> Pre-configured with PayPal Sandbox mode. You can enter your own credentials from <a href="https://developer.paypal.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">developer.paypal.com</a> anytime.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">PayPal Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="sb-client-id-..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">PayPal Client Secret</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Target Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="sandbox">Sandbox (Testing & Hackathon evaluation)</option>
                <option value="live">Live (Production)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Default Currency</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ United States Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="GBP">GBP (£ British Pound)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Business Profile */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Business & Invoice Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Business / Studio Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Merchant Account Email</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Gemini AI Engine Status */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Gemini AI Model Engine</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active (gemini-3.8-flash)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Powers the autonomous chat assistant, natural-language query routing, personalized debtor reminders, and transaction anomaly detector.
          </p>
        </div>

        {/* Save & Reset buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onResetData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Transactions</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
