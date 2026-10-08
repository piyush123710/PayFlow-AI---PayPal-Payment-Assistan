import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Bot, Plus, RefreshCw, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onOpenCreatePayment: () => void;
  onOpenAiChat: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreatePayment,
  onOpenAiChat,
  onResetData,
}) => {
  const { user, logout } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{getGreeting()}, {user?.name.split(' ')[0] || 'Partner'}</span>
            <span className="text-lg">👋</span>
          </h2>
          <p className="text-xs text-slate-400">
            {user?.businessName || 'NextWave Digital Studio'} • Autonomous PayPal Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={onResetData}
          title="Reset sandbox demo transactions and pending debts"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Ask AI quick button */}
        <button
          onClick={onOpenAiChat}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/30 transition-all shadow-sm group"
        >
          <Bot className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          <span>Ask PayFlow AI</span>
        </button>

        {/* Create Payment Request Button */}
        <button
          onClick={onOpenCreatePayment}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Payment Request</span>
        </button>

        {/* User Profile / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-slate-200 text-xs font-bold border border-slate-600">
            {user?.name ? user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
