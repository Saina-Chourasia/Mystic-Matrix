import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import { api } from '../../services/api';
import { sound } from '../../utils/audioSynth';

export default function AdminUsersPage({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      sound.playPotionBubble();
      setActionMessage(null);
      const res = await api.updateAdminUser(userId, { role: newRole });
      if (res.success) {
        sound.playSparkle();
        setActionMessage({ type: 'success', text: res.message });
        loadUsers();
      }
    } catch (err) {
      sound.playWarningHex();
      setActionMessage({ type: 'error', text: err.message || 'Could not update role.' });
    }
  };

  const handleToggleStatus = async (userId, currentActive) => {
    try {
      sound.playPotionBubble();
      setActionMessage(null);
      const res = await api.updateAdminUser(userId, { is_active: !currentActive });
      if (res.success) {
        sound.playSparkle();
        setActionMessage({ type: 'success', text: res.message });
        loadUsers();
      }
    } catch (err) {
      sound.playWarningHex();
      setActionMessage({ type: 'error', text: err.message || 'Could not alter active status.' });
    }
  };

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-serif font-black text-[var(--text-primary)]">
              Alchemist & User Directory
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-purple-950 text-purple-300 border border-purple-500/30">
              ROLE-BASED ACCESS CONTROL
            </span>
          </div>
          <p className="text-xs font-serif text-[var(--text-muted)] mt-1">
            Manage authenticated accounts across Madam Hex's private sanctum and the apprentice customer portal.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by moniker or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none"
          />
        </div>
      </div>

      {actionMessage && (
        <div className={`p-3.5 rounded-xl text-xs font-serif flex items-center gap-2 ${
          actionMessage.type === 'success'
            ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-200'
            : 'bg-red-950/30 border border-red-500/40 text-red-200'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="font-serif text-xs text-purple-300">Summoning user roster...</p>
        </div>
      ) : (
        <div className="pixel-card rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-serif">
              <thead className="bg-purple-950/40 border-b border-purple-500/20 text-purple-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Moniker</th>
                  <th className="py-3 px-4 font-bold">Scroll Address</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">Account Status</th>
                  <th className="py-3 px-4 font-bold">Inscribed Date</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-purple-900/15 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center font-bold text-purple-200">
                            {u.name?.[0] || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-[var(--text-primary)]">{u.name}</span>
                            {isCurrent && (
                              <span className="ml-2 text-[9px] font-mono text-amber-400 font-bold">(You)</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">
                        {u.email}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          disabled={isCurrent}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-pixel focus:outline-none border ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-950 text-purple-300 border-purple-500/50'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          } ${isCurrent ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          title={isCurrent ? 'Cannot alter own administrative role' : 'Change user role'}
                        >
                          <option value="USER">USER (Customer)</option>
                          <option value="ADMIN">ADMIN (Sanctum)</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-pixel ${
                          u.is_active 
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-red-950/60 text-red-300 border border-red-500/40'
                        }`}>
                          {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[var(--text-muted)]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleToggleStatus(u.id, u.is_active)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-serif font-bold border transition-all ${
                              u.is_active
                                ? 'border-red-500/30 text-red-300 hover:bg-red-950/40'
                                : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

