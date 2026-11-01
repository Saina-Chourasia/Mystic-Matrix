import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Key, AlertCircle, Search, RefreshCw, Eye } from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import { api } from '../../services/api';
import { sound } from '../../utils/audioSynth';

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAuditLogs({ limit: 100 });
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (l.action || '').toLowerCase().includes(q) || 
           (l.user_email || '').toLowerCase().includes(q) ||
           (l.entity_type || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-serif font-black text-[var(--text-primary)]">
              Security & Audit Grimoire
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              AUDIT TRAIL ACTIVE
            </span>
          </div>
          <p className="text-xs font-serif text-[var(--text-muted)] mt-1">
            Immutable log of all authentications, permission checks, administrative interventions, and customer orders.
          </p>
        </div>

        <button
          onClick={() => { sound.playPotionBubble(); loadLogs(); }}
          className="px-3.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-950/20 text-purple-200 hover:text-white text-xs font-serif font-bold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Security Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-serif">
        <div className="p-4 rounded-xl border border-purple-500/30 bg-[var(--bg-card)] space-y-1">
          <div className="flex items-center gap-2 text-purple-300 font-bold">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Session Protection</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            HttpOnly, SameSite=Lax server sessions in SQLite. Tokens never stored in localStorage.
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-[var(--bg-card)] space-y-1">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Adaptive Hashing</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Bcrypt cost 12 with salt generation. Single-use expiring tokens for account recovery.
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/30 bg-[var(--bg-card)] space-y-1">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>CSRF & Rate Limiting</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Origin and token verification for mutating requests. 15-minute brute-force limiter.
          </div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-500/30 bg-[var(--bg-card)] space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Object-Level RBAC</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Strict ownership enforcement. Users access only their own orders and profile data.
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, email, or entity..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none"
          />
        </div>

        <div className="text-xs font-mono text-[var(--text-muted)]">
          Total Logs: {filteredLogs.length}
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="font-serif text-xs text-purple-300">Summoning security records...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="pixel-card p-12 text-center rounded-2xl border border-dashed border-purple-500/30 space-y-2">
          <ShieldCheck className="w-8 h-8 mx-auto text-purple-400 opacity-60" />
          <h3 className="font-serif font-black text-base text-[var(--text-primary)]">
            No audit records match your query
          </h3>
        </div>
      ) : (
        <div className="pixel-card rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-serif">
              <thead className="bg-purple-950/40 border-b border-purple-500/20 text-purple-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">Action</th>
                  <th className="py-3 px-4 font-bold">Actor</th>
                  <th className="py-3 px-4 font-bold">Entity</th>
                  <th className="py-3 px-4 font-bold">IP Coordinates</th>
                  <th className="py-3 px-4 font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-900/15 transition-colors">
                    <td className="py-2.5 px-4 text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-purple-300">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-pixel ${
                        log.action.includes('FAILED') || log.action.includes('DENIED')
                          ? 'bg-red-950/70 text-red-300 border border-red-500/40'
                          : log.action.includes('SUCCESS') || log.action.includes('REGISTER') || log.action.includes('ORDER')
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                          : 'bg-purple-950/70 text-purple-300 border border-purple-500/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[var(--text-primary)]">
                      {log.user_email || 'Public / Anonymous'}
                    </td>
                    <td className="py-2.5 px-4 text-amber-300">
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--text-muted)]">
                      {log.ip_address || '::1 (local)'}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--text-secondary)] truncate max-w-xs">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

