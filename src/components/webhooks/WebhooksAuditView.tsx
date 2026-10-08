import React, { useState, useEffect } from 'react';
import { WebhookEvent } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  Code,
  XCircle,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';

export const WebhooksAuditView: React.FC = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/webhooks');
      if (res.ok) setEvents(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSimulate = async (eventType: WebhookEvent['eventType']) => {
    setSimulating(true);
    try {
      const res = await fetch('/api/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          amount: eventType === 'CUSTOMER.DISPUTE.CREATED' ? 4200 : 7500,
          customerName: 'Aman Gupta',
        }),
      });

      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      showToast(`PayPal Webhook event ${eventType} dispatched!`, 'success');
      fetchEvents();
    } catch (err: any) {
      showToast(err.message || 'Webhook simulation error', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const getEventBadge = (type: WebhookEvent['eventType']) => {
    switch (type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Capture Completed</span>;
      case 'PAYMENT.CAPTURE.DENIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">Capture Denied</span>;
      case 'CUSTOMER.DISPUTE.CREATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Dispute Opened</span>;
      case 'PAYMENT.CAPTURE.REFUNDED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">Refund Issued</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-base font-bold text-white">PayPal Webhooks & Event Auditor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live asynchronous event stream ensuring bank-grade reconciliation for captures, disputes, chargebacks, and refund settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulate('PAYMENT.CAPTURE.COMPLETED')}
            disabled={simulating}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Capture Event</span>
          </button>
          <button
            onClick={() => handleSimulate('CUSTOMER.DISPUTE.CREATED')}
            disabled={simulating}
            className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Test Dispute Event</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 pl-4">Event Type</th>
                <th className="py-3.5">Summary</th>
                <th className="py-3.5">Resource ID</th>
                <th className="py-3.5">Timestamp</th>
                <th className="py-3.5 text-right pr-4">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-4">
                    {getEventBadge(evt.eventType)}
                  </td>
                  <td className="py-3 font-medium text-slate-200 max-w-sm truncate">
                    {evt.summary}
                  </td>
                  <td className="py-3 font-mono text-slate-400 text-[11px]">
                    {evt.resourceId}
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 text-right pr-4">
                    <button
                      onClick={() => setSelectedEvent(evt)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                      title="Inspect Webhook JSON payload"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload JSON Inspector Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">PayPal Webhook Payload</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-400 max-h-80">
              <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
