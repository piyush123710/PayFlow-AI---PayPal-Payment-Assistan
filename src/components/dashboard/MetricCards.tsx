import React from 'react';
import { SummaryData } from '../../types/index.js';
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
} from 'lucide-react';

interface MetricCardsProps {
  summary: SummaryData | null;
  currency: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary, currency }) => {
  const formatAmount = (num: number) => {
    return `${currency === 'INR' ? '₹' : '$'}${num.toLocaleString()}`;
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: summary ? formatAmount(summary.totalRevenue) : '—',
      subtext: '+22.4% vs last month',
      subtextColor: 'text-emerald-400',
      icon: IndianRupee,
      glow: 'glow-blue',
      badge: 'Live PayPal',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Pending Receivables',
      value: summary ? formatAmount(summary.pendingAmount) : '—',
      subtext: `${summary?.pendingCustomerCount || 0} overdue accounts`,
      subtextColor: 'text-amber-400',
      icon: Clock,
      glow: 'glow-amber',
      badge: 'Needs Attention',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      title: 'Successful Payments',
      value: summary ? `${summary.successfulCount}` : '—',
      subtext: '96.2% settlement rate',
      subtextColor: 'text-emerald-400',
      icon: CheckCircle2,
      glow: 'glow-emerald',
      badge: 'Captured',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Failed Attempts',
      value: summary ? `${summary.failedCount}` : '0',
      subtext: 'Requires auto-retry',
      subtextColor: 'text-red-400',
      icon: AlertTriangle,
      glow: '',
      badge: 'Flagged',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    {
      title: 'Active Customers',
      value: summary ? `${summary.customerCount}` : '—',
      subtext: 'Retainer & one-time',
      subtextColor: 'text-slate-400',
      icon: Users,
      glow: '',
      badge: 'Portfolio',
      badgeColor: 'bg-slate-700/30 text-slate-300 border-slate-600/30',
    },
    {
      title: 'Avg. Transaction',
      value: summary ? formatAmount(summary.averageTransactionValue) : '—',
      subtext: 'Per payment order',
      subtextColor: 'text-slate-400',
      icon: TrendingUp,
      glow: '',
      badge: 'Metric',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all backdrop-blur-sm ${card.glow}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-slate-400 truncate">{card.title}</span>
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-white tracking-tight mb-1 truncate">
              {card.value}
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className={card.subtextColor}>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
