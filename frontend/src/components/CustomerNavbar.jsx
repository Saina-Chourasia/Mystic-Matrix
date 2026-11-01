import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Sun, Moon, LogOut, Shield, Compass, Sparkles, Package, UserCheck, ChevronDown, User as UserIcon } from 'lucide-react';
import { PixelIcon } from './PixelArt';
import { sound } from '../utils/audioSynth';

/**
 * CustomerNavbar
 * Streamlined, clean, and responsive navigation for the Customer Portal.
 * Features:
 * - Compact height (h-14) with minimal visual clutter
 * - Clean primary navigation: Sanctuary (Home), Magical Shop, Satchel (Cart), My Orders
 * - Day/Night magical theme toggle
 * - Clean profile dropdown containing user details and the Sign Out action
 * - Mobile-friendly bottom navigation bar with live cart count badge
 */
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const isNight = theme === 'night';

  const navItems = [
    { id: 'user_dashboard', label: 'Sanctuary', icon: Compass },
    { id: 'user_shop', label: 'Magical Shop', icon: Sparkles },
    { id: 'user_cart', label: 'Satchel', icon: ShoppingBag, badge: cartCount },
    { id: 'user_orders', label: 'My Orders', icon: Package }
  ];

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tabId) => {
    sound.playPotionBubble();
    setIsProfileOpen(false);
    onNavigate(tabId);
  };

  const toggleTheme = () => {
    sound.playPotionBubble();
    setTheme(isNight ? 'day' : 'night');
  };

  return (
    <>
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--border-card)] bg-[var(--bg-card)]/90 pt-[max(env(safe-area-inset-top),0px)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => handleTabClick('user_dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg p-1 bg-[var(--bg-primary)] border border-purple-500/40 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <PixelIcon name="WitchHat" size={20} />
            </div>
            <span className="font-serif font-black text-sm sm:text-base tracking-wider text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">
              MYSTIC MATRIX
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 transition-all relative ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-purple-900/15'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-400 text-purple-950 font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Day/Night Toggle & Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Day / Night Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                isNight
                  ? 'bg-purple-950/40 border-purple-500/30 text-amber-300 hover:border-purple-400'
                  : 'bg-white border-purple-200 text-purple-900 shadow-sm hover:border-purple-300'
              }`}
              title={isNight ? 'Switch to Day Mode' : 'Switch to Night Mode'}
              aria-label="Toggle Theme"
            >
              {isNight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile Dropdown Container */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl border border-[var(--border-card)] bg-[var(--bg-primary)] hover:border-purple-400 transition-all select-none"
                aria-expanded={isProfileOpen}
              >
                <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-xs font-serif font-bold text-purple-200 overflow-hidden">
                  {(user?.avatar_url || user?.picture) && !avatarError ? (
                    <img
                      src={user.avatar_url || user.picture}
                      alt={user?.name || 'Profile'}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || 'A'
                  )}
                </div>
                <span className="hidden sm:inline font-serif font-bold text-xs text-[var(--text-primary)] max-w-[120px] truncate">
                  {user?.name || 'Apprentice'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-purple-500/30 bg-[var(--bg-card)] shadow-2xl p-2 z-50 animate-scale-up">
                  {/* User Header */}
                  <div className="px-3 py-2 border-b border-[var(--border-card)]">
                    <div className="font-serif font-black text-sm text-[var(--text-primary)] truncate">
                      {user?.name || 'Apprentice Alchemist'}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--text-muted)] truncate">
                      {user?.email || 'customer@hallowmere.com'}
                    </div>
                    <div className="mt-1 inline-block px-1.5 py-0.2 rounded text-[9px] font-pixel bg-purple-950/50 text-purple-300 border border-purple-500/30">
                      {user?.role === 'ADMIN' ? 'ARCH-MAGE ADMIN' : 'CUSTOMER APPRENTICE'}
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => handleTabClick('user_profile')}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-serif font-bold text-[var(--text-primary)] hover:bg-purple-900/20 flex items-center gap-2 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Alchemist Profile</span>
                    </button>
                    <button
                      onClick={() => handleTabClick('user_cart')}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-serif font-bold text-[var(--text-primary)] hover:bg-purple-900/20 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                        <span>My Satchel</span>
                      </div>
                      {cartCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-400 text-purple-950 font-bold">
                          {cartCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleTabClick('user_orders')}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-serif font-bold text-[var(--text-primary)] hover:bg-purple-900/20 flex items-center gap-2 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                      <span>Order Grimoire</span>
                    </button>

                    {/* Switch to Admin Mode if privileged */}
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (onSwitchToAdmin) onSwitchToAdmin();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-serif font-bold text-amber-300 hover:bg-amber-950/30 flex items-center gap-2 transition-colors border border-amber-500/20 mt-1"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Switch to Admin Sanctum</span>
                      </button>
                    )}
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-1 mt-1 border-t border-[var(--border-card)]">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        sound.playCastSpell();
                        if (onLogout) onLogout();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-serif font-bold text-red-400 hover:bg-red-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t border-[var(--border-card)] bg-[var(--bg-card)]/95 shadow-2xl px-2 py-1 flex items-center justify-around pb-[max(env(safe-area-inset-bottom),6px)]"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-purple-400 font-bold bg-purple-950/40'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-mono bg-amber-400 text-purple-950 font-black">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-serif">{item.label}</span>
            </button>
          );
        })}

        {/* Profile Tab in Mobile Bottom Bar */}
        <button
          onClick={() => handleTabClick('user_profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'user_profile'
              ? 'text-purple-400 font-bold bg-purple-950/40'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span className="text-[10px] font-serif">Profile</span>
        </button>
      </nav>
    </>
  );
}
