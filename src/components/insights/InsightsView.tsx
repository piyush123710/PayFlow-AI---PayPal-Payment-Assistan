import React from 'react';
import { AIInsight, Transaction } from '../../types/index.js';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface InsightsViewProps {
  insights: AIInsight[];
  anomalies: Transaction[];
  currency: string;
  onExecuteCommand: (command: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  insights,
  anomalies,
  currency,
  onExecuteCommand,
}) => {
  const getSeverityStyle = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'ALERT':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          badge: 'High Alert',
          icon: ShieldAlert,
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badge: 'Warning',
          icon: AlertTriangle,
        };
      case 'SUCCESS':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          badge: 'Growth Signal',
          icon: TrendingUp,
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          badge: 'Insight',
          icon: Sparkles,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white">AI Financial Intelligence & Anomaly Engine</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Continuously analyzing all PayPal transactions, payment frequency, overdue debtor trends, and flagging unusual ticket sizes using Gemini AI models.
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Live Pattern Guard Active
          </span>
          <span className="text-[11px] text-slate-400">Model: Gemini 3.8 Flash</span>
        </div>
      </div>

      {/* Flagged Anomaly Highlight Card */}
      {anomalies.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Unusual Transaction Detected</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Anomaly Score: 92/100
            </span>
          </div>

          {anomalies.map((anom) => (
            <div key={anom.id} className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-white">{anom.customerName}</h4>
                  <p className="text-xs text-slate-400">{anom.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-amber-400">
                    {currency === 'INR' ? '₹' : '$'}{anom.amount.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">{anom.paypalOrderId}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                💡 <span className="font-semibold text-white">AI Detection:</span> {anom.anomalyReason}
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => onExecuteCommand(`Show details of unusual transaction for ${anom.customerName}`)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Ask PayFlow AI to Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid of AI Financial Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => {
          const style = getSeverityStyle(ins.severity);
          const Icon = style.icon;

          return (
            <div
              key={ins.id}
              className={`p-5 rounded-2xl bg-slate-900/70 border backdrop-blur-sm transition-all flex flex-col justify-between ${style.border}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}>
                    {style.badge}
                  </span>
                  {ins.metric && (
                    <span className="text-xs font-extrabold text-white">
                      {ins.metric}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${style.text}`} />
                  <h4 className="text-sm font-bold text-white">{ins.title}</h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {ins.description}
                </p>
              </div>

              {ins.actionLabel && ins.actionCommand && (
                <div className="pt-3 mt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => onExecuteCommand(ins.actionCommand!)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>{ins.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
