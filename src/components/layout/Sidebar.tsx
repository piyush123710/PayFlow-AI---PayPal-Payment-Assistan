import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Receipt,
  Users,
  SendHorizontal,
  BarChart3,
  Sparkles,
  Settings,
  ShieldCheck,
  CreditCard,
  Zap,
  FileText,
  Radio,
  TrendingUp,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'assistant'
  | 'invoices'
  | 'transactions'
  | 'customers'
  | 'payment-requests'
  | 'analytics'
  | 'forecast'
  | 'insights'
  | 'webhooks'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pendingCount }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'assistant' as NavTab,
      label: 'AI Assistant',
      icon: Bot,
      highlight: true,
      badge: 'Agent',
    },
    { id: 'invoices' as NavTab, label: 'Tax Invoices', icon: FileText, badge: 'GST/VAT' },
    { id: 'transactions' as NavTab, label: 'Transactions', icon: Receipt },
    { id: 'customers' as NavTab, label: 'Customers', icon: Users },
    {
      id: 'payment-requests' as NavTab,
      label: 'Payment Requests',
      icon: SendHorizontal,
      badge: pendingCount > 0 ? `${pendingCount}` : undefined,
    },
    { id: 'forecast' as NavTab, label: 'Cash Flow Forecast', icon: TrendingUp, badge: 'AI 30d' },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'insights' as NavTab, label: 'AI Insights', icon: Sparkles },
    { id: 'webhooks' as NavTab, label: 'PayPal Webhooks', icon: Radio },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-xl">
      <div>
        {/* Brand header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">PayFlow</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
              </div>
              <p className="text-[11px] text-slate-400">PayPal Autonomous Agent</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.highlight
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* PayPal Sandbox Status Card */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/90 border border-slate-700/50 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200">PayPal Sandbox</span>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Connected to PayPal Sandbox REST engine & Gemini 3.8 Flash model.
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ready for Transactions</span>
        </div>
      </div>
    </aside>
  );
};
