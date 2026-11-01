import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  PackageCheck, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Filter
} from 'lucide-react';
import api from '../services/api';
import { sound } from '../utils/audioSynth';

export default function AIActionApprovalsModal({
  isOpen,
  onClose,
  onActionExecuted
}) {
  const [actions, setActions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'EXECUTED' | 'REJECTED'
  const [loading, setLoading] = useState(false);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const res = await api.getAiActions(params);
      if (res.success) {
        setActions(res.actions || []);
      }
    } catch (err) {
      console.error('Failed to load actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActions();
    }
  }, [isOpen, statusFilter]);

  const handleApprove = async (id) => {
    try {
      sound.playCoinClink();
      const res = await api.approveAiAction(id);
      if (res.success) {
        setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'EXECUTED', executed_at: new Date().toISOString() } : a));
        if (onActionExecuted) {
          onActionExecuted(res.action);
        }
      }
    } catch (err) {
      console.error('Approve failed:', err);
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = async (id) => {
    try {
      sound.playPotionBubble();
      const res = await api.rejectAiAction(id, 'Rejected by Madam Hex from Approvals Desk');
      if (res.success) {
        setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED' } : a));
      }
    } catch (err) {
      console.error('Reject failed:', err);
    }
  };

  if (!isOpen) return null;

  const pendingCount = actions.filter(a => a.status === 'PENDING').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[var(--bg-card-solid)] border-2 border-[var(--border-card)] rounded-2xl shadow-2xl overflow-hidden animate-scale-up"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-card)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-900/30 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-black text-[var(--text-primary)]">
                  Madam Hex's Action Approvals Desk
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    {pendingCount} Pending Review
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] font-sans">
                Level 3 Action Guardrails: AI proposes actions, but database execution requires explicit human confirmation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchActions}
              disabled={loading}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-card)] transition-colors"
              title="Refresh Actions List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-card)] transition-colors"
              title="Close Approvals Desk"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 border-b border-[var(--border-card)] flex items-center gap-1.5 overflow-x-auto bg-[var(--bg-primary)]/40">
          {['ALL', 'PENDING', 'APPROVED', 'EXECUTED', 'REJECTED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all ${
                statusFilter === filter
                  ? 'bg-[var(--color-purple)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Proposals List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && actions.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)] font-serif">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-purple-400" />
              Retrieving pending proposals...
            </div>
          ) : actions.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-muted)] font-serif">
              <div className="w-14 h-14 rounded-2xl bg-amber-900/20 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)] mb-1">
                No Proposals in Queue
              </h3>
              <p className="text-xs max-w-sm mx-auto">
                No {statusFilter.toLowerCase()} action proposals currently awaiting review. Ask Mystic AI to propose restocks or inventory adjustments.
              </p>
            </div>
          ) : (
            actions.map((act) => {
              const isPending = act.status === 'PENDING';
              const isExecuted = act.status === 'EXECUTED';
              const isRejected = act.status === 'REJECTED';

              return (
                <div
                  key={act.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPending
                      ? 'bg-purple-950/20 border-amber-500/50 shadow-md'
                      : isExecuted
                      ? 'bg-emerald-950/10 border-emerald-500/30'
                      : 'bg-[var(--bg-primary)] border-[var(--border-card)] opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-purple-900/40 text-purple-300 border border-purple-500/30">
                        {act.action_type}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Proposal #{act.id} &bull; {act.created_at}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isExecuted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isRejected
                        ? 'bg-zinc-700 text-zinc-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {act.status}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] mb-1">
                    {act.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed mb-3">
                    {act.justification}
                  </p>

                  {/* Proposed Payload Grid */}
                  {act.proposed_payload && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-card)] text-[11px] font-mono">
                      {act.proposed_payload.quantity && (
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px]">Quantity</span>
                          <strong>{act.proposed_payload.quantity} units</strong>
                        </div>
                      )}
                      {act.proposed_payload.totalCost && (
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px]">Total Cost</span>
                          <strong className="text-amber-400">{act.proposed_payload.totalCost}G</strong>
                        </div>
                      )}
                      {act.proposed_payload.supplierName && (
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px]">Supplier</span>
                          <strong>{act.proposed_payload.supplierName}</strong>
                        </div>
                      )}
                      {act.proposed_payload.leadTimeDays && (
                        <div>
                          <span className="text-[var(--text-muted)] block text-[10px]">Lead Time</span>
                          <strong>{act.proposed_payload.leadTimeDays} days</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Bar */}
                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-card)]/60">
                      <button
                        onClick={() => handleReject(act.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-950/30 text-red-300 text-xs font-serif font-bold transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(act.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-serif font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Approve & Execute</span>
                      </button>
                    </div>
                  )}

                  {isExecuted && (
                    <div className="flex items-center gap-1.5 text-[11px] font-serif font-bold text-emerald-400 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved by {act.approved_by || 'Madam Hex'} and executed into database records</span>
                    </div>
                  )}

                  {isRejected && (
                    <div className="flex items-center gap-1.5 text-[11px] font-serif text-[var(--text-muted)] pt-1">
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>Rejected: {act.rejection_reason || 'Disapproved by Madam Hex'}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between text-xs text-[var(--text-muted)] font-serif">
          <span>Apothecary Guardrail Desk &bull; Level 3 Authoritative Execution</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[var(--border-card)] hover:bg-[var(--border-card)] text-[var(--text-primary)] transition-colors font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

