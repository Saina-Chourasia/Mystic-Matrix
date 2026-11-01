import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FlaskConical, 
  TrendingUp, 
  ShieldAlert, 
  ShoppingCart, 
  BarChart3, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  X,
  ExternalLink,
  Package,
  Truck,
  Users,
  ShieldCheck,
  Database,
  ShoppingBag,
  User,
  Settings,
  Sparkles
} from 'lucide-react';
import { PixelIcon } from './PixelArt';
import { sound } from '../utils/audioSynth';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  theme = 'night',
  setTheme,
  onOpenSaleModal,
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
  onOpenOracleChat
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const isNight = theme === 'night';

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: FlaskConical },
    { id: 'forecast', label: 'Forecasting', icon: TrendingUp },
    { id: 'restock', label: 'Recommendations', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'orders', label: 'Store Orders', icon: Package },
    { id: 'suppliers', label: 'Suppliers & POs', icon: Truck },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'security', label: 'Security Logs', icon: ShieldCheck },
    { id: 'datasets', label: 'Datasets & UCI', icon: Database },
    { id: 'detect', label: 'Smart Tools', icon: ShieldAlert },
  ];

  const handleTabClick = (id) => {
    sound.playPotionBubble();
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-fade-in"
        />
      )}

      {/* Primary Vertical Navigation Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between
        bg-[var(--bg-card-solid)] border-r border-[var(--border-card)]
        transition-all duration-300 ease-in-out select-none
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top: Branding & Collapse Toggle */}
        <div className="p-4 pt-[max(env(safe-area-inset-top),1rem)] border-b border-[var(--border-card)]">
          <div className="flex items-center justify-between gap-2">
            
            {/* Brand Logo & Name */}
            <div 
              onClick={() => handleTabClick('overview')}
              className={`flex items-center gap-3 cursor-pointer group overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--color-purple-subtle)] border border-[var(--color-purple)] flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <PixelIcon name="WitchHat" size={24} />
              </div>
              
              {!collapsed && (
                <div className="min-w-0">
                  <span className="font-serif font-black text-sm tracking-wide text-[var(--text-primary)] truncate block">
                    Mystic Matrix
                  </span>
                  <span className="text-[10px] font-pixel text-[var(--color-purple)] tracking-wider block">
                    ADMIN SANCTUM
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Desktop Collapse Button */}
            {!collapsed && setCollapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className="hidden lg:flex p-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

          </div>

          {/* Re-expand button when collapsed */}
          {collapsed && setCollapsed && (
            <div className="hidden lg:flex justify-center mt-3">
              <button
                onClick={() => setCollapsed(false)}
                className="p-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Middle: 11 Primary Navigation Links (Scrolls Independently) */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'overview' && activeTab === 'dashboard');
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
                  isActive
                    ? isNight 
                      ? 'bg-purple-900/60 text-white border border-purple-500/50 shadow-md shadow-purple-950/50' 
                      : 'bg-purple-100 text-purple-950 border border-purple-300 font-black shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--color-purple)]' : 'text-[var(--text-muted)]'}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {/* AI Oracle & External Portal Shortcuts */}
          <div className="pt-2 mt-2 border-t border-[var(--border-card)] space-y-1">
            {onOpenOracleChat && (
              <button
                onClick={() => {
                  sound.playSparkle();
                  onOpenOracleChat();
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-serif text-purple-300 hover:text-white bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 transition-all ${
                  collapsed ? 'justify-center px-0' : ''
                }`}
                title="Consult Mystic AI Oracle"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-purple-400 animate-pulse" />
                {!collapsed && <span className="font-bold">Ask Mystic AI</span>}
              </button>
            )}

            <button
              onClick={() => handleTabClick('user_dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-serif text-purple-300 hover:text-white hover:bg-purple-900/30 transition-all ${
                collapsed ? 'justify-center px-0' : ''
              }`}
              title="Switch to Customer Portal"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              {!collapsed && <span>Customer Portal</span>}
            </button>

            <button
              onClick={() => handleTabClick('welcome')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-serif text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all ${
                collapsed ? 'justify-center px-0' : ''
              }`}
              title="View Public Landing Page"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              {!collapsed && <span>Public Landing</span>}
            </button>
          </div>
        </nav>

        {/* Bottom: Single Compact Profile Section with Dropdown Menu */}
        <div className="p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] border-t border-[var(--border-card)] bg-[var(--bg-primary)]/80 relative">
          
          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className={`absolute bottom-full left-2 right-2 mb-2 p-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl backdrop-blur-md space-y-1 text-xs font-serif z-50 animate-fade-in ${collapsed ? 'w-48 left-0' : ''}`}>
              
              <div className="px-3 py-2 border-b border-[var(--border-card)]">
                <div className="font-bold text-[var(--text-primary)] truncate">{user?.name || 'Madam Hex'}</div>
                <div className="text-[10px] font-mono text-[var(--text-muted)] truncate">{user?.email || 'madam.hex@gmail.com'}</div>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-pixel bg-purple-950 text-purple-300 border border-purple-500/30">
                  ROLE: ADMIN
                </span>
              </div>

              {/* Action 1: My Profile */}
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleTabClick('users');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>My Profile</span>
              </button>

              {/* Action 2: Account Settings */}
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  handleTabClick('security');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>Account Settings</span>
              </button>

              <div className="border-t border-[var(--border-card)] my-1" />

              {/* Action 3: Logout */}
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  sound.playCastSpell();
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-950/30 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Compact Profile Section Card / Trigger */}
          <div 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className={`p-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:border-purple-400/50 cursor-pointer flex items-center justify-between gap-2.5 transition-all group ${
              collapsed ? 'justify-center p-2' : ''
            }`}
            title="Admin Profile & Settings Menu"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'Madam Hex'} 
                  className="w-7 h-7 rounded-full border border-purple-500 shrink-0 object-cover" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[var(--color-purple-subtle)] border border-[var(--color-purple)] flex items-center justify-center shrink-0">
                  <PixelIcon name="WitchHat" size={16} />
                </div>
              )}
              
              {!collapsed && (
                <div className="min-w-0">
                  <div className="font-serif font-bold text-xs text-[var(--text-primary)] truncate group-hover:text-purple-300 transition-colors">
                    {user?.name || 'Madam Hex'}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Admin</span>
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <ChevronUp className={`w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </div>

        </div>

      </aside>
    </>
  );
}
