import React from 'react';
import { SummaryData, Customer, Transaction } from '../../types/index.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, Users, DollarSign, Award } from 'lucide-react';

interface AnalyticsViewProps {
  summary: SummaryData | null;
  customers: Customer[];
  transactions: Transaction[];
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  summary,
  customers,
  transactions,
  currency,
}) => {
  const topCustomers = [...customers]
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 5);

  const monthlyData = summary?.monthlyRevenue || [];

  return (
    <div className="space-y-6">
      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Settled Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {currency === 'INR' ? '₹' : '$'}{(summary?.totalRevenue || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">↑ +22.4% MoM acceleration</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Outstanding Volume</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400">
            {currency === 'INR' ? '₹' : '$'}{(summary?.pendingAmount || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-400 mt-1">Pending client recovery</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Avg Order Value</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {currency === 'INR' ? '₹' : '$'}{(summary?.averageTransactionValue || 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Standard invoice size</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Settlement Rate</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white">96.2%</div>
          <p className="text-[11px] text-emerald-400 mt-1">Low dispute frequency</p>
        </div>
      </div>

      {/* Main Bar Chart: Monthly Collections */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-white mb-1">Monthly PayPal Transaction Volume</h3>
        <p className="text-xs text-slate-400 mb-4">Gross merchant inflow through PayPal payment gateway</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs">
                        <span className="font-semibold text-slate-300">{label}</span>
                        <p className="font-bold text-blue-400 text-sm mt-1">
                          {currency === 'INR' ? '₹' : '$'}{payload[0].value.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top-paying customers table */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-white mb-1">Top-Paying Clients</h3>
        <p className="text-xs text-slate-400 mb-3">Highest cumulative lifetime contributions</p>

        <div className="divide-y divide-slate-800 text-xs">
          {topCustomers.map((c, i) => (
            <div key={c.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-[10px]">
                  {i + 1}
                </span>
                <div>
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-[11px] text-slate-500">{c.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-400">
                  {currency === 'INR' ? '₹' : '$'}{c.totalPaid.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">{c.transactionsCount} payments</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
