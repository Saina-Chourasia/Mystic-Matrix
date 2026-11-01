import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Package, 
  TrendingUp, 
  ShieldAlert, 
  ShoppingCart, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Layers, 
  Flame, 
  Clock, 
  Menu, 
  X,
  ChevronDown,
  BookOpen,
  BarChart2
} from 'lucide-react';
import MagicalLandscapeScene from '../components/MagicalLandscapeScene';
import { PixelIcon } from '../components/PixelArt';
import { sound } from '../utils/audioSynth';

export default function WelcomePage({ 
  onGetStarted, 
  onNavigate, 
  theme = 'night', 
  setTheme, 
  onOpenSaleModal 
}) {
  const isNight = theme === 'night';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'night' ? 'day' : 'night';
    if (setTheme) setTheme(nextTheme);
    if (nextTheme === 'night') {
      sound.playCastSpell();
    } else {
      sound.playSparkle();
    }
  };

  const scrollToSection = (id) => {
    sound.playPotionBubble();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen transition-colors duration-500 overflow-x-hidden">
      
      {/* ══════════════════════════════════════════════════════════
          1. INTEGRATED FROSTED NAVIGATION BAR (Within the Scene)
          ══════════════════════════════════════════════════════════ */}
      <header className="absolute top-0 left-0 right-0 z-40 px-6 lg:px-12 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Witch Hat Badge + Mystic Matrix (Matching Reference) */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl cursor-pointer group select-none transition-all shadow-md ${
              isNight
                ? 'bg-[#1E113D]/80 border border-purple-500/40 text-white hover:border-purple-400'
                : 'bg-[#2A164D] border border-purple-900/40 text-white hover:bg-[#351C60]'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
              <PixelIcon name="WitchHat" size={20} />
            </div>
            <span className="font-serif font-black text-sm tracking-wide">
              Mystic Matrix
            </span>
          </div>

          {/* Center Links (Integrated & Frosted Pill) */}
          <nav className={`hidden md:flex items-center gap-1 p-1 rounded-full backdrop-blur-md text-xs font-serif font-bold tracking-wide transition-colors ${
            isNight 
              ? 'bg-[#150A26]/75 border border-purple-500/30 text-purple-200' 
              : 'bg-white/80 border border-purple-200/80 text-[#2D1654] shadow-sm'
          }`}>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`px-4 py-1.5 rounded-full transition-all ${
                isNight 
                  ? 'bg-purple-900/60 text-white font-black' 
                  : 'bg-purple-200/70 text-[#2D1654] font-black'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className={`px-4 py-1.5 rounded-full transition-colors ${
                isNight ? 'hover:text-amber-300 text-purple-200' : 'hover:text-purple-600 text-purple-800'
              }`}
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className={`px-4 py-1.5 rounded-full transition-colors ${
                isNight ? 'hover:text-amber-300 text-purple-200' : 'hover:text-purple-600 text-purple-800'
              }`}
            >
              About
            </button>
          </nav>

          {/* Right: Dual Sun/Moon Slider Pill (Matching Reference) */}
          <div className="flex items-center gap-3">
            
            {/* Dual Sun/Moon Switcher Pill */}
            <div 
              onClick={toggleTheme}
              className={`flex items-center p-1 rounded-full cursor-pointer select-none border backdrop-blur-md transition-all ${
                isNight 
                  ? 'bg-[#1B0D36]/80 border-purple-500/40 shadow-md' 
                  : 'bg-white/90 border-purple-300 shadow-md'
              }`}
              title={isNight ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            >
              <div className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
                !isNight 
                  ? 'bg-white text-purple-950 shadow-sm' 
                  : 'text-purple-400 hover:text-amber-300'
              }`}>
                <Sun className="w-3.5 h-3.5" />
              </div>
              <div className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
                isNight 
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]' 
                  : 'text-purple-400 hover:text-purple-700'
              }`}>
                <Moon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg border backdrop-blur-md ${
                isNight ? 'bg-purple-950/70 border-purple-500/40 text-white' : 'bg-white/80 border-amber-300 text-purple-950'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-3 p-4 rounded-2xl backdrop-blur-xl border space-y-3 text-xs font-serif font-bold ${
            isNight ? 'bg-[#150A26]/95 border-purple-500/40 text-purple-200' : 'bg-white/95 border-amber-200 text-purple-950 shadow-lg'
          }`}>
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }}
              className="block w-full text-left py-1 hover:text-amber-400"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-1 hover:text-amber-400"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="block w-full text-left py-1 hover:text-amber-400"
            >
              About
            </button>
            <button
              onClick={() => { onGetStarted(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 rounded-lg bg-purple-600 text-white text-center font-serif font-bold block"
            >
              Enter Pantry &rarr;
            </button>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════
          2. IMMERSIVE HERO SECTION (Matching Mystic Matrix Layout)
          ══════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[92vh] lg:min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        
        {/* Full-bleed Day/Night Landscape Illustration */}
        <MagicalLandscapeScene theme={theme} />

        {/* Main Center Content Box */}
        <div className="relative z-10 max-w-[460px] sm:max-w-[500px] lg:max-w-[560px] mx-auto text-center space-y-3 sm:space-y-4 mt-2 sm:mt-4 px-2">
          
          {/* Main Title: Mystic Matrix with Sparkle and Curved Swoosh Flourish */}
          <div className="space-y-0.5 inline-block relative">
            
            {/* Top 4-pointed sparkle star matching reference */}
            <div className="flex justify-center mb-0.5">
              <span className={`text-xl sm:text-2xl font-serif select-none animate-pulse ${
                isNight ? 'text-purple-300 drop-shadow-[0_0_12px_rgba(216,180,254,0.9)]' : 'text-[#3E1668]'
              }`}>
                ✦
              </span>
            </div>

            <div className="relative inline-block">
              <h1 className={`font-serif text-4xl sm:text-5xl lg:text-6xl tracking-normal leading-tight select-none ${
                isNight
                  ? 'text-white drop-shadow-[0_4px_24px_rgba(168,85,247,0.5)] font-normal'
                  : 'text-[#240F3E] font-medium drop-shadow-sm'
              }`}
              style={{ fontFamily: "'Cormorant Garamond', 'Cinzel', serif" }}
              >
                <span>Mystic </span>
                <span className="relative inline-block">
                  Matrix
                  {/* Elegant curved underline swoosh flourish under 'Matrix' matching reference */}
                  <svg 
                    className="absolute -bottom-2 left-0 w-[112%] h-4 sm:h-5 overflow-visible pointer-events-none select-none"
                    viewBox="0 0 160 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M2 4 C50 16, 120 16, 155 6" 
                      stroke={isNight ? '#C084FC' : '#4A1D7A'} 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      className={isNight ? 'drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : ''}
                    />
                    <circle 
                      cx="156" 
                      cy="6" 
                      r="2" 
                      fill={isNight ? '#E9D5FF' : '#4A1D7A'} 
                    />
                  </svg>
                </span>
              </h1>
            </div>
          </div>

          {/* Subtitles: Main & Business Tagline */}
          <div className="space-y-1">
            <p className={`font-serif text-xs sm:text-sm lg:text-base font-normal tracking-wide max-w-md mx-auto ${
              isNight 
                ? 'text-purple-200/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' 
                : 'text-[#3E1A66] font-medium'
            }`}
            style={{ fontFamily: "'Outfit', 'Cormorant Garamond', sans-serif" }}
            >
              The Enchanted Inventory for Every Potion and Prophecy
            </p>
            <p className={`font-serif italic text-[11px] sm:text-xs tracking-wider max-w-sm mx-auto ${
              isNight ? 'text-purple-300/80' : 'text-purple-800/80 font-medium'
            }`}>
              "Where Magic Meets Intelligent Inventory."
            </p>
          </div>

          {/* Two Prominent Action Buttons (Matching Reference Pills) */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
            
            {/* Primary: Enter the Pantry */}
            <button
              onClick={() => {
                sound.playCastSpell();
                onGetStarted();
              }}
              className={`px-7 py-3 rounded-full font-serif text-sm font-bold flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 shadow-lg select-none ${
                isNight
                  ? 'bg-[#7C3AED] hover:bg-[#8B5CF6] text-white shadow-purple-950/60 hover:shadow-[0_0_20px_rgba(124,58,237,0.6)]'
                  : 'bg-[#431B72] hover:bg-[#52238A] text-white shadow-purple-900/30'
              }`}
            >
              <span>Enter the Pantry</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary: Explore Features with Book Icon */}
            <button
              onClick={() => scrollToSection('features')}
              className={`px-6 py-3 rounded-full font-serif text-sm font-bold flex items-center gap-2.5 backdrop-blur-md border transition-all hover:-translate-y-0.5 select-none ${
                isNight
                  ? 'bg-[#1D103A]/70 border-purple-400/50 text-purple-200 hover:border-purple-300 hover:text-white hover:bg-[#2A1652]'
                  : 'bg-white/80 border-purple-300/90 text-[#3B1564] hover:bg-white hover:border-purple-500 shadow-sm'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Explore Features</span>
            </button>

          </div>

          {/* Underneath: Four Minimal Interactive Feature Shortcuts in a Frosted Pill Bar (Matching Reference) */}
          <div className="pt-3 max-w-xl mx-auto">
            <div className={`p-1.5 rounded-2xl backdrop-blur-md border shadow-lg flex items-center justify-between ${
              isNight
                ? 'bg-[#140A29]/75 border-purple-500/30 text-purple-200'
                : 'bg-white/85 border-purple-200 text-[#2D1654]'
            }`}>
              
              {/* Shortcut 1: Inventory */}
              <button
                onClick={() => {
                  sound.playPotionBubble();
                  onNavigate('inventory');
                }}
                className="flex-1 py-2 px-1 flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform group"
              >
                <div className={`p-1.5 rounded-lg ${isNight ? 'text-purple-300 group-hover:text-white' : 'text-[#491F78]'}`}>
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-serif font-bold text-[11px] sm:text-xs">Inventory</span>
              </button>

              <div className={`w-[1px] h-7 ${isNight ? 'bg-purple-500/20' : 'bg-purple-200'}`} />

              {/* Shortcut 2: Forecast */}
              <button
                onClick={() => {
                  sound.playPotionBubble();
                  onNavigate('forecast');
                }}
                className="flex-1 py-2 px-1 flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform group"
              >
                <div className={`p-1.5 rounded-lg ${isNight ? 'text-purple-300 group-hover:text-white' : 'text-[#491F78]'}`}>
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="font-serif font-bold text-[11px] sm:text-xs">Forecast</span>
              </button>

              <div className={`w-[1px] h-7 ${isNight ? 'bg-purple-500/20' : 'bg-purple-200'}`} />

              {/* Shortcut 3: Detect */}
              <button
                onClick={() => {
                  sound.playPotionBubble();
                  onNavigate('detect');
                }}
                className="flex-1 py-2 px-1 flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform group"
              >
                <div className={`p-1.5 rounded-lg ${isNight ? 'text-purple-300 group-hover:text-white' : 'text-[#491F78]'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-serif font-bold text-[11px] sm:text-xs">Detect</span>
              </button>

              <div className={`w-[1px] h-7 ${isNight ? 'bg-purple-500/20' : 'bg-purple-200'}`} />

              {/* Shortcut 4: Restock */}
              <button
                onClick={() => {
                  sound.playPotionBubble();
                  onNavigate('restock');
                }}
                className="flex-1 py-2 px-1 flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform group"
              >
                <div className={`p-1.5 rounded-lg ${isNight ? 'text-purple-300 group-hover:text-white' : 'text-[#491F78]'}`}>
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="font-serif font-bold text-[11px] sm:text-xs">Restock</span>
              </button>

            </div>
          </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════
          3. FEATURES SECTION (4 Spacious Cards)
          ══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="font-pixel text-[10px] text-[var(--color-orange)] uppercase tracking-wider">
            [ Core Capabilities ]
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text-primary)]">
            Apothecary Intelligence
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans">
            Engineered with Holt-Winters predictive equations and lead-time safety buffers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <div className="pixel-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-purple-subtle)] border border-[var(--color-purple)] flex items-center justify-center p-2">
                <PixelIcon name="Cauldron" size={32} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                1. Magical Inventory
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                Track every magical ingredient and potion across 22 canonical items with live shelf stock, minimum levels, and supplier lead times.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-card)] text-[11px] font-mono text-[var(--color-purple)]">
              Real-time SQLite Ledger
            </div>
          </div>

          {/* Feature 2 */}
          <div className="pixel-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-orange-subtle)] border border-[var(--color-orange)] flex items-center justify-center p-2">
                <PixelIcon name="Ghost Pepper" size={32} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                2. Demand Forecasting
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                Holt-Winters Exponential Smoothing evaluates 90 days of transactions to project 7-day and 30-day demand curves with 95% confidence bands.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-card)] text-[11px] font-mono text-[var(--color-orange)]">
              Exponential Level & Trend
            </div>
          </div>

          {/* Feature 3 */}
          <div className="pixel-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-gold-subtle)] border border-[var(--color-gold)] flex items-center justify-center p-2">
                <PixelIcon name="Stardust" size={32} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                3. Stockout Detection
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                Detect low stock, overstocking, and stockout risks before shelves empty. Automatic countdown calculates days until depletion.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-card)] text-[11px] font-mono text-[var(--color-gold)]">
              Depletion Countdown Timers
            </div>
          </div>

          {/* Feature 4 */}
          <div className="pixel-card p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-crimson-subtle)] border border-[var(--color-crimson)] flex items-center justify-center p-2">
                <PixelIcon name="Bat Wings" size={32} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                4. Smart Restocking
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                Receive prioritized reorder advice. Click "Execute Restock" to reorder exact quantities calculated via Reorder Points ($ROP$).
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border-card)] text-[11px] font-mono text-[var(--color-crimson)]">
              One-Click Reorder Action
            </div>
          </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════
          4. ABOUT MADAM HEX & THE HALLOWEEN DILEMMA
          ══════════════════════════════════════════════════════════ */}
      <section id="about" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="pixel-card p-8 sm:p-12 border-[var(--border-strong)] bg-gradient-to-r from-[var(--bg-card)] via-[var(--color-purple-subtle)] to-[var(--bg-card)]">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-serif font-bold text-[var(--color-gold)]">
                <Sparkles className="w-4 h-4 text-[var(--color-orange)]" />
                <span>The Story of Hallowmere</span>
              </div>
              
              <h2 className="font-serif font-black text-2xl sm:text-4xl text-[var(--text-primary)]">
                Why Madam Hex Created Mystic Matrix
              </h2>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans leading-relaxed">
                For centuries, Madam Hex trusted hand-written parchment ledgers to manage her shop. Every October, when witches and wizards prepared for the Halloween midnight sabbat, customer traffic spiked by over 300%.
              </p>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                High-demand reagents like <strong className="text-[var(--color-orange)]">Fairy Wings</strong> and <strong className="text-[var(--color-orange)]">Ghost Pepper</strong> vanished within hours, while slow-moving assets like <strong className="text-[var(--color-purple)]">Stardust</strong> trapped thousands of Gold Galleons on dusty shelves. Mystic Matrix replaces guesswork with predictive wizardry.
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs font-serif font-bold text-[var(--color-gold)]">
                <span>• 22 Canonical Items</span>
                <span>• 5 Realm Suppliers</span>
                <span>• 90 Days Historical Telemetry</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-card)] text-center space-y-3">
                <PixelIcon name="Spellbook" size={64} className="mx-auto" />
                <div className="font-serif font-bold text-sm text-[var(--text-primary)]">
                  Madam Hex's Apothecary Grimoire
                </div>
                <div className="text-[11px] font-mono text-[var(--text-muted)]">
                  "Control the Inventory. Predict the Magic."
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. HOW MYSTIC MATRIX WORKS & COMPACT CTA STRIP
          ══════════════════════════════════════════════════════════ */}
      <section className="pt-12 sm:pt-16 pb-10 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="font-pixel text-[10px] text-[var(--color-gold)] uppercase tracking-wider">
            [ Simple 3-Step Flow ]
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-4xl text-[var(--text-primary)]">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
            Track Sales &rarr; Forecast Demand &rarr; Optimize Inventory
          </p>
        </div>

        {/* 3 Step Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="pixel-card p-6 text-center space-y-3">
            <div className="font-pixel text-xl text-[var(--color-orange)]">01</div>
            <PixelIcon name="Spellbook" size={40} className="mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
              Track Sales
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              Log customer purchases with patron demographics (Witch, Wizard, Necromancer) and real-time inventory deductions.
            </p>
          </div>

          <div className="pixel-card p-6 text-center space-y-3">
            <div className="font-pixel text-xl text-[var(--color-gold)]">02</div>
            <PixelIcon name="Magic Wand" size={40} className="mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
              Forecast Demand
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              Holt-Winters models evaluate sales velocity, growth trends, and seasonal Halloween multipliers to project 30-day demand curves.
            </p>
          </div>

          <div className="pixel-card p-6 text-center space-y-3">
            <div className="font-pixel text-xl text-[var(--color-emerald)]">03</div>
            <PixelIcon name="Cauldron" size={40} className="mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
              Optimize Inventory
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              Receive smart reorder quantities, prevent stockouts with safety buffers, and halt purchases of overstocked reagents.
            </p>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            SLIM COMPACT CTA STRIP (Directly below How It Works)
            ══════════════════════════════════════════════════════════ */}
        <div className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-md transition-all shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isNight
            ? 'bg-gradient-to-r from-purple-950/70 via-purple-900/40 to-purple-950/70 border-purple-500/30 text-purple-100 shadow-purple-950/40'
            : 'bg-gradient-to-r from-purple-50/95 via-white to-purple-50/95 border-purple-200/90 text-[#240F3E] shadow-sm'
        }`}>
          
          {/* Left: Sparkle + Headline */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className={`p-2 rounded-xl shrink-0 ${
              isNight ? 'bg-purple-900/60 text-amber-300 border border-purple-500/30' : 'bg-purple-100 text-purple-900 border border-purple-200'
            }`}>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] leading-tight">
                Ready to Master Your Magical Inventory?
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-sans">
                Predictive spellcraft, real-time inventory telemetry, and instant apothecary orders.
              </p>
            </div>
          </div>

          {/* Right: Enter Madam Hex's Shop Button */}
          <button
            onClick={() => {
              sound.playCastSpell();
              onGetStarted();
            }}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 transition-all transform hover:-translate-y-0.5 shadow-md select-none ${
              isNight
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 shadow-amber-400/20'
                : 'bg-[#431B72] hover:bg-[#52238A] text-white shadow-purple-900/20'
            }`}
          >
            <span>Enter Madam Hex's Shop</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

        {/* Compact Footer */}
        <footer className="pt-4 pb-2 border-t border-[var(--border-card)] text-center text-[11px] text-[var(--text-muted)] font-serif">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-6">
            <span>Madam Hex's 8-Bit Apothecary &copy; 2026</span>
            <span className="hidden sm:inline">&bull;</span>
            <span>Hallowmere Nocturnal Market</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="font-mono text-[10px]">Predict the Magic. Control the Inventory.</span>
          </div>
        </footer>

      </section>

    </div>
  );
}
