import React from 'react';
import { Sparkles, Moon, Sun } from 'lucide-react';
import { PixelIcon } from './PixelArt';

/**
 * ApothecaryRightDecor
 * As specified in Section 7 of MYSTIC MATRIX Master Prompt:
 * - Magical arched window with distant castle view
 * - Wooden potion shelves with glowing bottles
 * - Creeping flowers and hanging ivy vines
 * - Glowing, bubbling cauldron in Night Mode
 * - Completely isolated in its own layout column so it NEVER overlaps inventory controls.
 */
export default function ApothecaryRightDecor({ theme = 'night' }) {
  const isNight = theme === 'night';

  return (
    <aside className="w-80 shrink-0 hidden xl:flex flex-col gap-5 select-none sticky top-24 self-start">
      
      {/* 1. Enchanted Arched Window with Castle View */}
      <div className="pixel-card p-3 overflow-hidden group shadow-lg">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-card)] text-[11px] font-serif font-bold text-[var(--color-purple)]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hallowmere Valley View</span>
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {isNight ? 'Midnight' : 'Midday'}
          </span>
        </div>

        {/* Arched Stone Frame with Live Pixel Landscape */}
        <div className="relative mt-2.5 h-44 rounded-t-full border-2 border-[var(--color-purple)] overflow-hidden shadow-inner bg-slate-900">
          <div
            className="absolute inset-0 bg-cover bg-no-repeat transition-all duration-700 transform group-hover:scale-105"
            style={{
              backgroundImage: `url(${isNight ? '/images/mystic_hero_clean_night_2x.png' : '/images/mystic_hero_clean_day_2x.png'})`,
              backgroundPosition: 'right 30% center',
              imageRendering: 'pixelated'
            }}
          />
          {/* Soft atmospheric overlay */}
          <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
            isNight ? 'bg-purple-950/20' : 'bg-amber-100/10'
          }`} />

          {/* Window Stone Grille Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="50" y1="0" x2="50" y2="100" stroke="#4C1D95" strokeWidth="2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#4C1D95" strokeWidth="2" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="#4C1D95" strokeWidth="1.5" />
          </svg>

          {/* Window Sill Badge */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-purple-400/50 text-[10px] font-serif text-purple-200">
            Distant Citadel
          </div>
        </div>
      </div>

      {/* 2. Wooden Potion Shelves & Herbarium */}
      <div className="pixel-card p-4 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between text-xs font-serif font-bold text-[var(--text-primary)] border-b border-[var(--border-card)] pb-2">
          <span>Apothecary Curiosities</span>
          <span className="text-[10px] font-mono text-emerald-400">Fresh Stock</span>
        </div>

        {/* Shelf 1 */}
        <div className="relative pt-2">
          <div className="flex items-end justify-around px-2 pb-1 gap-1">
            <div className="hover:-translate-y-1 transition-transform" title="Love Potion">
              <PixelIcon name="Love Potion" size={28} />
            </div>
            <div className="hover:-translate-y-1 transition-transform" title="Stardust">
              <PixelIcon name="Stardust" size={24} />
            </div>
            <div className="hover:-translate-y-1 transition-transform" title="Flying Potion">
              <PixelIcon name="Flying Potion" size={26} />
            </div>
            <div className="hover:-translate-y-1 transition-transform" title="Fairy Wings">
              <PixelIcon name="Fairy Wings" size={28} />
            </div>
          </div>
          {/* Polished Mahogany Shelf Board */}
          <div className="h-2 rounded bg-amber-950 border-t border-amber-600 shadow-sm" />
          <div className="h-1 bg-amber-900/60 rounded-b" />
        </div>

        {/* Shelf 2 with Books & Ingredients */}
        <div className="relative pt-1">
          <div className="flex items-end justify-around px-2 pb-1 gap-1">
            <div className="hover:-translate-y-1 transition-transform" title="Ancient Spellbook">
              <PixelIcon name="Spellbook" size={26} />
            </div>
            <div className="hover:-translate-y-1 transition-transform" title="Ghost Pepper">
              <PixelIcon name="Ghost Pepper" size={26} />
            </div>
            <div className="hover:-translate-y-1 transition-transform" title="Bat Wings">
              <PixelIcon name="Bat Wings" size={28} />
            </div>
            <div className="hover:-translate-y-1 transition-transform" title="Invisibility Potion">
              <PixelIcon name="Invisibility Potion" size={26} />
            </div>
          </div>
          {/* Polished Mahogany Shelf Board */}
          <div className="h-2 rounded bg-amber-950 border-t border-amber-600 shadow-sm" />
          <div className="h-1 bg-amber-900/60 rounded-b" />
        </div>

        {/* Hanging Ivy & Lavender Bellflowers */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-[var(--text-muted)] font-serif italic">
          <span>🌿 Mandrake Root extract</span>
          <span className="text-purple-400 font-bold">In-Brew</span>
        </div>
      </div>

      {/* 3. Glowing Bubbling Cauldron (Especially prominent in Night Mode) */}
      <div className={`pixel-card p-4 text-center space-y-3 transition-colors ${
        isNight 
          ? 'bg-gradient-to-b from-[#1E0F38] to-[#120824] border-purple-500/40 shadow-purple-950/80' 
          : 'bg-white/90 border-purple-200'
      }`}>
        <div className="text-[10px] font-pixel text-[var(--color-orange)] uppercase tracking-wider">
          Active Brew Cauldron
        </div>

        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {/* Animated Steam Bubbles */}
          <div className="absolute -top-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" style={{ animationDuration: '2.5s' }} />
          <div className="absolute top-1 left-4 w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-0 right-4 w-2 h-2 rounded-full bg-amber-400 animate-ping" style={{ animationDuration: '2s' }} />
          
          <PixelIcon name="Cauldron" size={68} />
        </div>

        <div>
          <div className="font-serif font-bold text-xs text-[var(--text-primary)]">
            {isNight ? 'Midnight Elixir Infusion' : 'Dawn Sun-Essence Decoction'}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-sans mt-0.5">
            Holt-Winters buffer auto-simulating live sales velocity.
          </p>
        </div>
      </div>

    </aside>
  );
}

