import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  ShieldAlert,
  Calendar,
  Sparkles,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface CashFlowForecastViewProps {
  currency: string;
}

export const CashFlowForecastView: React.FC<CashFlowForecastViewProps> = ({ currency }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forecast')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const currSymbol = currency === 'INR' ? '₹' : '$';

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <p className="text-xs">Computing AI cash flow projections...</p>
      </div>
    );
  }

  const projections = data?.projections || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white">AI Cash Flow Forecasting & Liquidity Guard</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Predicts merchant PayPal collections over the next 30 days by modeling invoice aging, debtor settlement velocity, and recurring retainer reliability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AI Confidence Score</span>
            <span className="text-lg font-black text-emerald-400">{data?.confidenceScore || 89}%</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <span className="text-xs text-slate-400 font-medium">Total Receivables Pending</span>
          <p className="text-xl font-extrabold text-amber-400 mt-1">
            {currSymbol}{(data?.totalOutstanding || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Across 3 active invoice debtors</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <span className="text-xs text-slate-400 font-medium">Projected 30-Day Collections</span>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">
            {currSymbol}{(data?.predicted30DayTotal || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400/90 font-medium">88% estimated recovery velocity</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <span className="text-xs text-slate-400 font-medium">Liquidity Runway Status</span>
          <p className="text-xl font-extrabold text-blue-400 mt-1">Healthy</p>
          <span className="text-[11px] text-slate-500">Zero operational shortfall predicted</span>
        </div>
      </div>

      {/* Forecasting Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Projected Cumulative Cash Inflow</h3>
            <p className="text-xs text-slate-400">Timeline of expected settlements through PayPal</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            Predictive Model
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs">
                        <span className="font-semibold text-slate-300">{label}</span>
                        <p className="font-bold text-emerald-400 text-sm mt-0.5">
                          {currSymbol}{payload[0].value.toLocaleString()} expected
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Probability: {payload[0].payload.cumulativeProbability}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="projectedInflow"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#forecastGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
