import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PaymentRequest } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import { VoiceInputButton } from './VoiceInputButton.js';
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  ExternalLink,
  CreditCard,
} from 'lucide-react';

interface AiAssistantViewProps {
  onOpenPaymentModal: (req: Partial<PaymentRequest>) => void;
  onRefreshData: () => void;
  currency: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  onOpenPaymentModal,
  onRefreshData,
  currency,
}) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **PayFlow AI**, your autonomous PayPal payment assistant.

I can help you monitor revenue, identify overdue customers, generate personalized reminders, detect anomalies, and execute PayPal payments.

💡 **Try commands like:**
• *"Show my pending payments"*
• *"How much did I earn this month?"*
• *"Create a ₹5000 payment request for Rahul"*
• *"Collect all pending payments"* (Autonomous Agent workflow)
• *"Show unusual or suspicious transactions"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentStep, setAgentStep] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    'Show my pending payments',
    'How much did I earn this month?',
    'Create a ₹5000 payment request for Rahul',
    'Collect all pending payments',
    'Show my biggest transactions',
    'Generate reminders for all overdue customers',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error('AI response failed');
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: data.action?.type,
        actionData: data.action?.data,
        requiresConfirmation: data.action?.requiresConfirmation,
        confirmationPrompt: data.action?.confirmationPrompt,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If user launched autonomous agent workflow, set agent visual step
      if (data.action?.type === 'AGENT_WORKFLOW') {
        setAgentStep(2);
      }
    } catch (err: any) {
      showToast('Error communicating with PayFlow AI', 'error');
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (msg: ChatMessage) => {
    if (!msg.actionData) return;

    setLoading(true);
    try {
      if (msg.actionType === 'PROPOSE_PAYMENT_REQUEST') {
        // Call backend to create payment request + PayPal Sandbox order
        const res = await fetch('/api/payment-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: msg.actionData.customerId,
            customerName: msg.actionData.customerName,
            customerEmail: msg.actionData.customerEmail,
            amount: msg.actionData.amount,
            description: msg.actionData.description,
          }),
        });

        if (!res.ok) throw new Error('Failed to create payment request');
        const result = await res.json();

        // Mark message as confirmed
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, confirmed: true } : m))
        );

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_conf_${Date.now()}`,
            role: 'assistant',
            content: `✅ **PayPal Order Created Successfully!**\n\n• **Order ID:** \`${result.paypalOrder.id}\`\n• **Customer:** ${result.paymentRequest.customerName}\n• **Amount:** ₹${result.paymentRequest.amount.toLocaleString()}\n• **Status:** Active in PayPal Sandbox\n\nThe customer can now complete payment securely via PayPal.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionType: 'PROPOSE_PAYMENT_REQUEST',
            actionData: result.paymentRequest,
          },
        ]);

        showToast('PayPal payment request created!', 'success');
        onRefreshData();
      } else if (msg.actionType === 'AGENT_WORKFLOW') {
        // Execute batch reminders & sync
        setAgentStep(3);
        const res = await fetch('/api/ai/agent-workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'EXECUTE_BATCH_REMINDERS' }),
        });

        if (!res.ok) throw new Error('Failed to execute agent workflow');
        const result = await res.json();

        setAgentStep(4);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, confirmed: true } : m))
        );

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_agent_done_${Date.now()}`,
            role: 'assistant',
            content: `🎯 **AI Payment Agent Workflow Completed!**\n\n• Successfully dispatched ${result.dispatchedCount} personalized payment reminders via Gemini.\n• Verified active PayPal Sandbox checkout links for Rahul, Aman, and Priya.\n• Updated payment recovery tracking on your dashboard.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        showToast(`Dispatched ${result.dispatchedCount} payment reminders!`, 'success');
        onRefreshData();
      }
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">PayFlow AI Autonomous Assistant</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected • Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">Natural Language PayPal Order & Debt Workflow Engine</p>
          </div>
        </div>

        {agentStep && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-xs text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span>Agent Workflow Active (Step {agentStep}/4)</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-2">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-lg ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Interactive Confirmation Card */}
                {msg.requiresConfirmation && !msg.confirmed && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Financial Action Confirmation Required</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {msg.confirmationPrompt || 'Please verify and approve this action.'}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleConfirmAction(msg)}
                        disabled={loading}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm & Execute</span>
                      </button>
                      <button
                        onClick={() => {
                          setMessages((prev) =>
                            prev.map((m) => (m.id === msg.id ? { ...m, confirmed: true } : m))
                          );
                          showToast('Action cancelled', 'info');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {/* Direct Action for Created Payment */}
                {msg.actionType === 'PROPOSE_PAYMENT_REQUEST' && msg.actionData && (
                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="text-xs font-bold text-white">
                          PayPal Order Ready
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {msg.actionData.customerName} • {currency === 'INR' ? '₹' : '$'}{msg.actionData.amount?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenPaymentModal(msg.actionData)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1"
                    >
                      <span>Checkout Flow</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className={`text-[10px] text-slate-500 ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-3xl mr-auto items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 rounded-tl-none flex items-center gap-2 text-xs text-slate-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Analyzing PayPal transactions & preparing intelligence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-950/50 border-t border-slate-800/80 overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Suggestions:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/60 transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/70">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or speak a payment command (e.g. 'Show overdue clients', 'Collect all pending payments')..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <VoiceInputButton
            onTranscript={(spokenText) => {
              setInput(spokenText);
              handleSend(spokenText);
            }}
            isProcessing={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
