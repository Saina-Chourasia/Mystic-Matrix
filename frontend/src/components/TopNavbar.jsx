import React from 'react';
import { Sun, Moon, LogOut, User, Sparkles, Menu, Bell, ShieldCheck } from 'lucide-react';
import { PixelIcon } from './PixelArt';
import { sound } from '../utils/audioSynth';

/**
 * TopNavbar
 * Streamlined Top Header for Mystic Matrix Admin Portal:
 * - Mystic Matrix branding & breadcrumbs on the left
 * - Mobile drawer toggle
 * - AI Inventory Oracle Copilot button
 * - AI Notification Bell with live unread badge
 * - Global Day/Night toggle (#top-theme-toggle) on the right
 * - Admin profile avatar & direct Sign Out action on the right
 */
export default function TopNavbar({
  activeTab = 'overview',
  onNavigate,
  theme = 'night',
  setTheme,
  user,
  onLogout,
  onToggleSidebar,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenOracleChat,
  onOpenApprovals
}) {
  const isNight = theme === 'night';

  const pageTitles = {
    overview: 'Overview Dashboard',
    dashboard: 'Overview Dashboard',
    inventory: 'Inventory Grimoire',
    forecast: 'Demand Forecasting',
    restock: 'Recommendations & Restock',
    analytics: 'Sales Analytics',
    orders: 'Customer Store Orders',
    suppliers: 'Suppliers & Purchase Orders',
    users: 'User & Role Directory',
    security: 'Security & Audit Logs',
    datasets: 'Datasets & UCI Retail II',
    detect: 'Smart Anomaly Detection'
  };

  const currentTitle = pageTitles[activeTab] || 'Apothecary Sanctum';

  const toggleTheme = () => {
    sound.playPotionBubble();
    if (setTheme) setTheme(isNight ? 'day' : 'night');
  };

  return (
    <header className="sticky top-0 z-30 w-full px-3 sm:px-4 lg:px-8 py-2.5 pt-[max(env(safe-area-inset-top),0.625rem)] bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border-card)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle + Mystic Matrix Branding & Breadcrumb */}
        <div className="flex items-center gap-3">
          
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-purple-400 transition-colors"
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Brand Logo & Name */}
          <div 
            onClick={() => {
              sound.playSparkle();
              onNavigate('overview');
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            title="Return to Admin Dashboard"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-500/50 flex items-center justify-center p-1 group-hover:scale-105 transition-transform shadow-md">
              <PixelIcon name="WitchHat" size={20} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-sm text-[var(--text-primary)] tracking-wide">
                Mystic Matrix
              </span>
              <span className="hidden sm:inline-block text-[9px] font-pixel px-1.5 py-0.5 rounded bg-[var(--color-purple-subtle)] text-[var(--color-purple)] border border-purple-500/30">
                ADMIN
              </span>
            </div>
          </div>

          {/* Breadcrumb / Current Page Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-serif pl-3 border-l border-[var(--border-card)] select-none">
            <span className="text-[var(--text-muted)]">Sanctum</span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="font-bold text-[var(--text-primary)]">
              {currentTitle}
            </span>
          </div>

        </div>

        {/* Right: AI Tools, Notification Bell, Theme Switcher & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Ask Mystic AI Oracle Quick Launcher */}
          {onOpenOracleChat && (
            <button
              id="top-ask-oracle-btn"
              onClick={() => {
                sound.playSparkle();
                onOpenOracleChat();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 hover:text-white text-xs font-serif font-bold transition-all shadow-xs group"
              title="Consult Mystic AI — The Inventory Oracle"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Ask Oracle</span>
            </button>
          )}

          {/* AI Persistent Notifications Bell with Unread Count Badge */}
          {onOpenNotifications && (
            <button
              id="top-ai-notifications-btn"
              onClick={() => {
                sound.playPotionBubble();
                onOpenNotifications();
              }}
              className="relative p-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-primary)] hover:border-purple-400 text-[var(--text-primary)] transition-all"
              title={unreadNotificationsCount > 0 ? `${unreadNotificationsCount} unread AI inventory notifications` : 'Inventory Alerts'}
              aria-label="Apothecary Notifications"
            >
              <Bell className="w-4 h-4 text-[var(--color-purple)]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold flex items-center justify-center border-2 border-[var(--bg-card)] shadow-xs animate-pulse">
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Dual Sun / Moon Switcher Slider Pill */}
          <div 
            id="top-theme-toggle"
            onClick={toggleTheme}
            className={`flex items-center p-1 rounded-full cursor-pointer select-none border backdrop-blur-md transition-all ${
              isNight 
                ? 'bg-[#1B0D36]/80 border-purple-500/40' 
                : 'bg-white/90 border-purple-300 shadow-sm'
            }`}
            title={isNight ? 'Switch to Day Mode' : 'Switch to Night Mode'}
          >
            <div className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
              !isNight 
                ? 'bg-amber-400 text-purple-950 shadow-sm' 
                : 'text-purple-400 hover:text-amber-300'
            }`}>
              <Sun className="w-3.5 h-3.5" />
            </div>
            <div className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
              isNight 
                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]' 
                : 'text-purple-300 hover:text-purple-600'
            }`}>
              <Moon className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Profile Icon / User Avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('overview')}
              className="w-8 h-8 rounded-full border border-[var(--color-purple)] overflow-hidden flex items-center justify-center bg-[var(--bg-primary)] shadow-sm hover:ring-2 hover:ring-[var(--color-purple)] transition-all"
              title={user?.email ? `Signed in as ${user.email} (Admin)` : "Madam Hex's Profile"}
            >
              {user?.avatar_url || user?.picture ? (
                <img src={user.avatar_url || user.picture} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-[var(--color-purple)]" />
              )}
            </button>

            {/* Quick Sign Out Action (Preserved for convenience and test compatibility) */}
            {onLogout && (
              <button
                onClick={() => {
                  sound.playCastSpell();
                  onLogout();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 hover:border-red-500/60 bg-red-950/20 text-red-300 hover:text-white text-xs font-serif font-bold transition-all"
                title="Sign Out of Admin Sanctum"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
