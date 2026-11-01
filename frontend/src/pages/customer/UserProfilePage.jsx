import React, { useState, useEffect } from 'react';
import { UserCheck, Lock, Mail, Phone, Shield, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import { api } from '../../services/api';
import { sound } from '../../utils/audioSynth';

export default function UserProfilePage({ user, onProfileUpdated, onLogout }) {
  const [profile, setProfile] = useState(user || null);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMessage(null);
      sound.playPotionBubble();

      const res = await api.updateProfile({ name, phone });
      if (res.success) {
        sound.playSparkle();
        setProfile(res.data);
        setProfileMessage({ type: 'success', text: 'Alchemist moniker and scroll coordinates updated!' });
        if (onProfileUpdated) onProfileUpdated(res.data);
      }
    } catch (err) {
      sound.playWarningHex();
      setProfileMessage({ type: 'error', text: err.message || 'Could not update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New secret passphrases do not match!' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New passphrase must be at least 8 runes (characters).' });
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordMessage(null);
      sound.playCastSpell();

      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        sound.playSparkle();
        setPasswordMessage({ type: 'success', text: 'Passphrase successfully renewed and sealed in the grimoire!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      sound.playWarningHex();
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update passphrase.' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      
      {/* Profile Header Card */}
      <div className="pixel-card p-6 sm:p-8 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-center text-2xl font-serif font-black text-purple-300 shadow-md">
            {profile?.name?.[0] || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl font-serif font-black text-[var(--text-primary)]">
                {profile?.name || 'Apprentice Alchemist'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                {profile?.role || 'CUSTOMER'}
              </span>
            </div>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
              {profile?.email}
            </p>
            <p className="text-[10px] font-serif text-purple-300/70 mt-1">
              Member since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '2026'}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl border border-red-500/40 bg-red-950/20 text-red-300 hover:bg-red-950/40 text-xs font-serif font-bold flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Depart Apothecary</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details Form */}
        <div className="pixel-card p-6 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-3">
            <UserCheck className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-serif font-black text-[var(--text-primary)]">
              Alchemist Moniker & Coordinates
            </h2>
          </div>

          {profileMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              profileMessage.type === 'success' 
                ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-200' 
                : 'bg-red-950/30 border border-red-500/40 text-red-200'
            }`}>
              {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs font-serif">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                Moniker / Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                Registered Scroll Address (Email)
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/40 border border-purple-500/20 text-[var(--text-muted)] cursor-not-allowed"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-sans">
                Primary scroll identifier cannot be altered after inscription.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                Owl Contact / Communication
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 (Hallowmere Owl Dispatch)"
                className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{savingProfile ? 'Etching Changes...' : 'Save Profile Details'}</span>
            </button>
          </form>
        </div>

        {/* Security & Password Change Form */}
        <div className="pixel-card p-6 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-card)] pb-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-serif font-black text-[var(--text-primary)]">
              Account Security & Passphrase
            </h2>
          </div>

          {passwordMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              passwordMessage.type === 'success' 
                ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-200' 
                : 'bg-red-950/30 border border-red-500/40 text-red-200'
            }`}>
              {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs font-serif">
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                Current Passphrase
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                New Passphrase (8+ runes)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                Confirm New Passphrase
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new passphrase"
                className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-serif font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{changingPassword ? 'Renewing...' : 'Renew Secret Passphrase'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

