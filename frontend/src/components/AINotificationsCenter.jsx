import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCheck, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  X, 
  ExternalLink,
  ChevronRight,
  Package
} from 'lucide-react';
import api from '../services/api';
import { sound } from '../utils/audioSynth';

export default function AINotificationsCenter({
  isOpen,
  onClose,
  onConsultOracle,
  onNavigateProduct
}) {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, critical: 0, warning: 0, info: 0 });
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'CRITICAL' | 'WARNING' | 'INFO'
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeFilter === 'UNREAD') {
        params.unreadOnly = 'true';
      } else if (['CRITICAL', 'WARNING', 'INFO'].includes(activeFilter)) {
        params.severity = activeFilter;
      }
      const res = await api.getAiNotifications(params);
      if (res.success) {
        setNotifications(res.notifications || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load AI notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, activeFilter]);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      sound.playSparkle();
      await api.markAiNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      sound.playSparkle();
      await api.markAllAiNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setStats(prev => ({ ...prev, unread: 0, critical: 0, warning: 0, info: 0 }));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDismiss = async (id, e) => {
    e.stopPropagation();
    try {
      sound.playPotionBubble();
      await api.dismissAiNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
  };

  const handleTriggerScan = async () => {
    try {
      setScanning(true);
      sound.playCastSpell();
      const res = await api.triggerAiScan();
      if (res.success) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[var(--bg-card-solid)] border-2 border-[var(--border-card)] rounded-2xl shadow-2xl overflow-hidden animate-scale-up"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-card)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-md">
              <Bell className="w-5 h-5 animate-bounce-short" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-black text-[var(--text-primary)]">
                  Apothecary Intelligence Alerts
                </h2>
                {stats.unread > 0 && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                    {stats.unread} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] font-sans">
                Continuous deterministic monitoring: stockouts, overstock, ingredient shortages & supplier risks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerScan}
              disabled={scanning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 text-xs font-serif font-bold transition-all disabled:opacity-50"
              title="Run instant deterministic inventory audit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{scanning ? 'Scrying...' : 'Audit Now'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-card)] transition-colors"
              title="Close Notification Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 border-b border-[var(--border-card)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-primary)]/50">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-[var(--color-purple)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveFilter('UNREAD')}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all ${
                activeFilter === 'UNREAD'
                  ? 'bg-[var(--color-purple)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              Unread ({stats.unread})
            </button>
            <button
              onClick={() => setActiveFilter('CRITICAL')}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'CRITICAL'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-red-400 hover:bg-red-950/20'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Critical ({stats.critical})</span>
            </button>
            <button
              onClick={() => setActiveFilter('WARNING')}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'WARNING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:bg-amber-950/20'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Warnings ({stats.warning})</span>
            </button>
            <button
              onClick={() => setActiveFilter('INFO')}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'INFO'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-400 hover:bg-blue-950/20'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Info ({stats.info})</span>
            </button>
          </div>

          {stats.unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-purple)] hover:underline font-serif font-bold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Notifications Scrollable List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && notifications.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)] font-serif">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-purple-400" />
              Consulting the ethereal ledgers...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-muted)] font-serif">
              <div className="w-14 h-14 rounded-2xl bg-purple-900/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 text-purple-400">
                <CheckCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)] mb-1">
                Apothecary is in Harmony
              </h3>
              <p className="text-xs max-w-sm mx-auto">
                No active {activeFilter.toLowerCase()} inventory alerts found. Stock levels, suppliers, and cauldrons are operating nominally.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const isCritical = item.severity === 'CRITICAL';
              const isWarning = item.severity === 'WARNING';

              const severityBadge = isCritical ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-red-500/20 text-red-400 border border-red-500/40">
                  CRITICAL
                </span>
              ) : isWarning ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  WARNING
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  INFO
                </span>
              );

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !item.is_read
                      ? 'bg-purple-950/20 border-purple-500/40 shadow-sm'
                      : 'bg-[var(--bg-primary)] border-[var(--border-card)] opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {severityBadge}
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        {item.created_at}
                      </span>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!item.is_read && (
                        <button
                          onClick={(e) => handleMarkRead(item.id, e)}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-purple-300 hover:bg-purple-900/30 transition-colors"
                          title="Mark as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDismiss(item.id, e)}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Dismiss alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed mb-3">
                    {item.message}
                  </p>

                  {/* Metadata and Contextual Pills */}
                  {item.metadata && (
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-mono">
                      {item.metadata.current_stock !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]">
                          Stock: <strong>{item.metadata.current_stock}</strong>
                        </span>
                      )}
                      {item.metadata.days_until_stockout !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-red-950/30 border border-red-500/30 text-red-300">
                          Stockout in: <strong>{item.metadata.days_until_stockout}d</strong>
                        </span>
                      )}
                      {item.metadata.capital_trapped !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-amber-950/30 border border-amber-500/30 text-amber-300">
                          Capital Trapped: <strong>{item.metadata.capital_trapped}G</strong>
                        </span>
                      )}
                      {item.metadata.limiting_ingredient && (
                        <span className="px-2 py-0.5 rounded bg-purple-950/30 border border-purple-500/30 text-purple-300">
                          Bottleneck: <strong>{item.metadata.limiting_ingredient}</strong>
                        </span>
                      )}
                      {item.metadata.suggested_reorder_qty !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                          Suggested Reorder: <strong>{item.metadata.suggested_reorder_qty} units</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border-card)]/60">
                    <button
                      onClick={() => {
                        onClose();
                        if (onConsultOracle) {
                          onConsultOracle(`Tell me more about the alert for ${item.product_name || item.title}. What actions do you recommend?`);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-serif font-bold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask Mystic AI About This</span>
                    </button>

                    {item.product_id && onNavigateProduct && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateProduct(item.product_id);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Inspect Product</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between text-xs text-[var(--text-muted)] font-serif">
          <span>Hallowmere Inventory Monitor &bull; Deterministic Oracle Engine</span>
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
