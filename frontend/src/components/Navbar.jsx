import React, { useState } from 'react';
import { 
  Home,
  LayoutDashboard, 
  FlaskConical, 
  TrendingUp, 
  Lightbulb, 
  BarChart3, 
  Sun,
  Moon,
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Flame,
  PlusCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { PixelIcon } from './PixelArt';
import { sound } from '../utils/audioSynth';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme,
  setTheme,
  halloweenMultiplier, 
  setHalloweenMultiplier, 
  soundEnabled, 
  setSoundEnabled,
  onResetDemo,
  onOpenSaleModal
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'welcome', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: FlaskConical },
    { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const handleTabClick = (tabId) => {
    sound.playPotionBubble();
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'night' ? 'day' : 'night';
    setTheme(nextTheme);
    if (nextTheme === 'night') {
      sound.playCastSpell();
    } else {
      sound.playSparkle();
    }
  };

  const toggleSound = () => {
    const nextState = sound.toggle();
    setSoundEnabled(nextState);
    if (nextState) sound.playSparkle();
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-card)] backdrop-blur-md border-b border-[var(--border-card)] px-4 lg:px-8 py-2.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand: Pixel Witch Hat + Mystic Matrix */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group"
          onClick={() => handleTabClick('welcome')}
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--color-purple-subtle)] border border-[var(--color-purple)] flex items-center justify-center p-1 group-hover:scale-105 transition-transform shadow-md">
            <PixelIcon name="WitchHat" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-base tracking-wide text-[var(--text-primary)]">
                Mystic Matrix
              </span>
              <span className="font-pixel text-[8px] px-1.5 py-0.5 rounded bg-[var(--color-purple-subtle)] border border-[var(--color-purple)] text-[var(--color-purple)]">
                16-BIT
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-sans hidden sm:block">
              The Enchanted Inventory for Every Potion and Prophecy
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-card)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all ${
                  isActive
                    ? 'bg-[var(--color-orange)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-purple-subtle)]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[var(--color-orange)]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Theme Switcher, Sound, Reset, Profile, Mobile Menu */}
        <div className="flex items-center gap-2">
          
          {/* Halloween Surge Mode Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-orange-subtle)] border border-[var(--color-orange)] text-[11px] font-mono">
            <Flame className="w-3.5 h-3.5 text-[var(--color-orange)] animate-bounce" />
            <span className="font-bold text-[var(--color-orange)]">Surge:</span>
            <span className="font-bold text-[var(--color-gold)]">{halloweenMultiplier}x</span>
          </div>

          {/* Quick Counter Sale Button */}
          <button
            onClick={() => {
              sound.playSparkle();
              onOpenSaleModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-emerald-subtle)] border border-[var(--color-emerald)] text-[var(--color-emerald)] hover:bg-[var(--color-emerald)] hover:text-white text-xs font-serif font-bold transition-all"
            title="Record Counter Customer Sale"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Sale</span>
          </button>

          {/* Day / Night Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--color-gold)] transition-colors"
            title={theme === 'night' ? 'Switch to Sunlit Library (Day Mode)' : 'Switch to Halloween Apothecary (Night Mode)'}
            aria-label="Toggle Day / Night theme"
          >
            {theme === 'night' ? (
              <Sun className="w-4 h-4 text-[var(--color-gold)] animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--color-purple)]" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--color-orange)] transition-colors"
            title={soundEnabled ? 'Mute 8-Bit Audio' : 'Enable 8-Bit Audio'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[var(--color-orange)]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[var(--text-muted)]" />
            )}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              sound.playWarningHex();
              onResetDemo();
            }}
            className="p-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--color-orange)] hover:border-[var(--color-orange)] transition-colors hidden sm:block"
            title="Reset to Original Seed State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User/Profile Badge: Madam Hex */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-[var(--border-card)]">
            <div className="w-7 h-7 rounded-full bg-[var(--color-purple-subtle)] border border-[var(--color-purple)] flex items-center justify-center text-xs font-pixel text-[var(--color-gold)]">
              H
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-serif font-bold text-[var(--text-primary)]">Madam Hex</div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">Head Apothecary</div>
            </div>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-[var(--border-card)] bg-[var(--bg-primary)] text-[var(--text-primary)] md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 border-t border-[var(--border-card)] mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-serif font-bold transition-all ${
                  isActive
                    ? 'bg-[var(--color-orange)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--color-purple-subtle)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--color-orange)]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-[var(--border-card)] flex items-center justify-between px-2 text-xs text-[var(--text-muted)] font-sans">
            <span>Surge Multiplier: <strong className="text-[var(--color-orange)]">{halloweenMultiplier}x</strong></span>
            <button
              onClick={onResetDemo}
              className="text-[var(--color-orange)] font-serif font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
