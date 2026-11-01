import React from 'react';

/**
 * MagicalLandscapeScene
 * High-definition, authentic 16-bit pixel-art fantasy landscape for Mystic Matrix.
 * Day mode: Sunny magical valley with purple-roof potion shop cottage on left, cliffside castle & waterfall on right.
 * Night mode: Celestial midnight starfield with glowing moon, cozy illuminated potion shop cottage on left, illuminated castle & glowing waterfall on right.
 */
export default function MagicalLandscapeScene({ theme = 'night', className = '' }) {
  const isNight = theme === 'night';

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none ${className}`}>
      {/* Day Background (Pristine 1920x1080 Pixel Art) */}
      <div 
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
          isNight ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: "url('/images/mystic_bg_day.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />

      {/* Night Background (Pristine 1920x1080 Pixel Art) */}
      <div 
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
          isNight ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: "url('/images/mystic_bg_night.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />

      {/* Subtle floating magical stardust / fireflies */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-300/80 blur-[0.5px] animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.2s' }} />
        <div className="absolute top-1/3 left-1/3 w-2 h-2 rounded-full bg-purple-300/90 blur-[0.5px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1.2s' }} />
        <div className="absolute top-1/2 left-[20%] w-1.5 h-1.5 rounded-full bg-emerald-300/70 blur-[0.5px] animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
        <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-cyan-300/80 blur-[0.5px] animate-pulse" style={{ animationDuration: '3.8s', animationDelay: '2s' }} />
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 rounded-full bg-amber-200/70 blur-[0.5px] animate-ping" style={{ animationDuration: '4.2s', animationDelay: '0.9s' }} />
        <div className="absolute top-3/5 left-[48%] w-1 h-1 rounded-full bg-violet-400/80 animate-ping" style={{ animationDuration: '6s', animationDelay: '3s' }} />
      </div>

      {/* Bottom gradient blend transition into page content */}
      <div className={`absolute bottom-0 left-0 right-0 h-16 pointer-events-none transition-colors duration-500 z-15 ${
        isNight 
          ? 'bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/40 to-transparent' 
          : 'bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/40 to-transparent'
      }`} />
    </div>
  );
}
