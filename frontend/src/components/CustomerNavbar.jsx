import React, { useState } from 'react';
import { ShoppingBag, Sun, Moon, LogOut, Shield, Compass, Sparkles, Package, UserCheck } from 'lucide-react';
import { PixelIcon } from './PixelArt';
import { sound } from '../utils/audioSynth';

export default function CustomerNavbar({
  activeTab,
  onNavigate,
  theme,
  setTheme,
  user,
  cartCount = 0,
  onLogout,
  onSwitchToAdmin
}) {
  const [avatarError, setAvatarError] = useState(false);
  const isNight = theme === 'night';

  const navItems = [
    { id: 'user_dashboard', label: 'Sanctuary', icon: Compass },
    { id: 'user_shop', label: 'Magical Shop', icon: Sparkles },
    { id: 'user_cart', label: 'Satchel', icon: ShoppingBag, badge: cartCount },
    { id: 'user_orders', label: 'My Orders', icon: Package },
    { id: 'user_profile', label: 'Profile', icon: UserCheck }
  ];

  const handleTabClick = (tabId) => {
    sound.playPotionBubble();
    onNavigate(tabId);
  };

  const toggleTheme = () => {
    sound.playPotionBubble();
    setTheme(isNight ? 'day' : 'night');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--border-card)] bg-[var(--bg-card)]/90 pt-[max(env(safe-area-inset-top),0px)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Madam Hex Moniker */}
        <div 
          onClick={() => handleTabClick('user_dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl p-1.5 bg-[var(--bg-primary)] border border-purple-500/40 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <PixelIcon name="WitchHat" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-sm sm:text-base tracking-wide text-[var(--text-primary)]">
                MYSTIC MATRIX
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-pixel bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 uppercase">
                Customer Portal
              </span>
            </div>
            <p className="text-[10px] font-serif text-[var(--text-muted)] hidden sm:block">
              Madam Hex's 8-Bit Apothecary & Ingredient Emporium
            </p>
          </div>
        </div>

        {/* Customer Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition-all relative ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-purple-900/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-400 text-purple-950 font-black animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Switch to Admin (Visible if user has ADMIN privileges) */}
          {user?.role === 'ADMIN' && (
            <button
              onClick={onSwitchToAdmin}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-serif font-bold bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 transition-all shadow-sm"
              title="Return to Madam Hex's Admin Command Center"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Mode</span>
            </button>
          )}

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isNight
                ? 'bg-purple-950/40 border-purple-500/30 text-amber-300 hover:border-purple-400'
                : 'bg-white border-purple-200 text-purple-900 shadow-sm hover:border-purple-300'
            }`}
            title={isNight ? 'Switch to Day Mode' : 'Switch to Night Mode'}
          >
            {isNight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart Icon (Mobile / Quick Click) */}
          <button
            onClick={() => handleTabClick('user_cart')}
            className="md:hidden relative p-2 rounded-xl border border-purple-500/30 bg-purple-950/30 text-purple-200"
            title="Open Satchel"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-purple-950 text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Moniker Badge */}
          <div 
            onClick={() => handleTabClick('user_profile')}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-primary)] cursor-pointer hover:border-purple-400 transition-all"
            title="View Profile"
          >
            <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xs font-serif font-bold text-purple-200 overflow-hidden">
              {(user?.avatar_url || user?.picture) && !avatarError ? (
                <img
                  src={user.avatar_url || user.picture}
                  alt={user?.name || "Avatar"}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                user?.name?.[0] || 'A'
              )}
            </div>
            <div className="text-left">
              <div className="text-[11px] font-serif font-bold text-[var(--text-primary)] leading-tight">
                {user?.name || 'Apprentice'}
              </div>
              <div className="text-[9px] font-mono text-[var(--text-muted)]">
                {user?.role === 'ADMIN' ? 'Arch-Mage Admin' : 'Customer'}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 hover:bg-red-950/40 transition-all"
            title="Depart the Apothecary"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Mobile Tab Strip */}
      <div className="md:hidden flex items-center justify-around border-t border-[var(--border-card)] px-2 py-1.5 bg-[var(--bg-primary)]/90 text-xs font-serif">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg relative ${
                isActive ? 'text-purple-400 font-bold' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}

