import React from 'react';

/**
 * Mystic Matrix Original 16-Bit / 8-Bit Pixel Art Design System
 * Crisp, authentic pixel graphics constructed on virtual 16x16 / 24x24 / 32x32 pixel grids.
 * Uses shapeRendering="crispEdges" to guarantee sharp retro pixel aesthetics.
 */

// Helper to render pixel blocks
export function PixelIcon({ name, size = 48, className = '' }) {
  const s = size;

  switch (name) {
    case 'Bat Wings':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Bat Wings */}
          {/* Main Wing silhouette */}
          <rect x="2" y="7" width="2" height="3" fill="#3D1D5A" />
          <rect x="4" y="5" width="3" height="3" fill="#3D1D5A" />
          <rect x="7" y="4" width="3" height="3" fill="#3D1D5A" />
          <rect x="10" y="5" width="2" height="4" fill="#3D1D5A" />
          
          <rect x="12" y="5" width="2" height="4" fill="#3D1D5A" />
          <rect x="14" y="4" width="3" height="3" fill="#3D1D5A" />
          <rect x="17" y="5" width="3" height="3" fill="#3D1D5A" />
          <rect x="20" y="7" width="2" height="3" fill="#3D1D5A" />
          
          {/* Wing Body / Membrane */}
          <rect x="3" y="10" width="8" height="4" fill="#5E2C8A" />
          <rect x="13" y="10" width="8" height="4" fill="#5E2C8A" />
          
          {/* Wing rib highlights - Glowing Orange */}
          <rect x="5" y="7" width="1" height="6" fill="#FF6B2B" />
          <rect x="8" y="6" width="1" height="7" fill="#FF854D" />
          <rect x="15" y="6" width="1" height="7" fill="#FF854D" />
          <rect x="18" y="7" width="1" height="6" fill="#FF6B2B" />
          
          {/* Bat Center Body */}
          <rect x="11" y="9" width="2" height="5" fill="#1B0A2A" />
          <rect x="10" y="8" width="4" height="2" fill="#2A103D" />
          {/* Glowing Eyes */}
          <rect x="10" y="9" width="1" height="1" fill="#FFD700" />
          <rect x="13" y="9" width="1" height="1" fill="#FFD700" />
          {/* Bottom tips */}
          <rect x="4" y="14" width="2" height="2" fill="#3D1D5A" />
          <rect x="8" y="14" width="2" height="2" fill="#3D1D5A" />
          <rect x="14" y="14" width="2" height="2" fill="#3D1D5A" />
          <rect x="18" y="14" width="2" height="2" fill="#3D1D5A" />
        </svg>
      );

    case 'Fairy Wings':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Gossamer Iridescent 8-bit Wings */}
          {/* Outer Border */}
          <rect x="3" y="4" width="6" height="2" fill="#00C49F" />
          <rect x="2" y="6" width="2" height="6" fill="#00C49F" />
          <rect x="4" y="12" width="6" height="2" fill="#00C49F" />
          
          <rect x="15" y="4" width="6" height="2" fill="#00C49F" />
          <rect x="20" y="6" width="2" height="6" fill="#00C49F" />
          <rect x="14" y="12" width="6" height="2" fill="#00C49F" />
          
          {/* Wing fill (Ethereal cyan & gold) */}
          <rect x="4" y="6" width="6" height="6" fill="#72F1D6" opacity="0.85" />
          <rect x="14" y="6" width="6" height="6" fill="#72F1D6" opacity="0.85" />
          
          {/* Shimmer pixels */}
          <rect x="5" y="7" width="2" height="2" fill="#FFFFFF" />
          <rect x="17" y="7" width="2" height="2" fill="#FFFFFF" />
          <rect x="7" y="10" width="2" height="2" fill="#FFD700" />
          <rect x="15" y="10" width="2" height="2" fill="#FFD700" />
          
          {/* Lower wing lobes */}
          <rect x="5" y="14" width="4" height="4" fill="#38BDF8" opacity="0.8" />
          <rect x="15" y="14" width="4" height="4" fill="#38BDF8" opacity="0.8" />
          
          {/* Golden fairy thorax core */}
          <rect x="11" y="5" width="2" height="12" fill="#F5BA42" />
          <rect x="11" y="6" width="2" height="3" fill="#FFFFFF" />
        </svg>
      );

    case 'Stardust':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Celestial Star with sparkling satellites */}
          {/* Main 4-pointed Star */}
          <rect x="11" y="2" width="2" height="5" fill="#FFD700" />
          <rect x="11" y="17" width="2" height="5" fill="#FFD700" />
          <rect x="2" y="11" width="5" height="2" fill="#FFD700" />
          <rect x="17" y="11" width="5" height="2" fill="#FFD700" />
          
          {/* Core diamond */}
          <rect x="9" y="9" width="6" height="6" fill="#F5BA42" />
          <rect x="10" y="10" width="4" height="4" fill="#FFF4B8" />
          <rect x="11" y="11" width="2" height="2" fill="#FFFFFF" />
          
          {/* Star corners */}
          <rect x="7" y="7" width="2" height="2" fill="#FFA500" />
          <rect x="15" y="7" width="2" height="2" fill="#FFA500" />
          <rect x="7" y="15" width="2" height="2" fill="#FFA500" />
          <rect x="15" y="15" width="2" height="2" fill="#FFA500" />
          
          {/* Orbiting cosmic dust particles */}
          <rect x="4" y="4" width="2" height="2" fill="#72F1D6" />
          <rect x="19" y="5" width="1" height="1" fill="#FF6B2B" />
          <rect x="18" y="19" width="2" height="2" fill="#A855F7" />
          <rect x="5" y="18" width="1" height="1" fill="#FFFFFF" />
        </svg>
      );

    case 'Dragon Scales':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Overlapping Crimson & Gold Scales */}
          {/* Scale 1 */}
          <rect x="4" y="3" width="7" height="2" fill="#B91C1C" />
          <rect x="3" y="5" width="9" height="4" fill="#DC2626" />
          <rect x="5" y="9" width="5" height="2" fill="#EF4444" />
          <rect x="6" y="11" width="3" height="1" fill="#F5BA42" />
          
          {/* Scale 2 */}
          <rect x="13" y="3" width="7" height="2" fill="#B91C1C" />
          <rect x="12" y="5" width="9" height="4" fill="#DC2626" />
          <rect x="14" y="9" width="5" height="2" fill="#EF4444" />
          <rect x="15" y="11" width="3" height="1" fill="#F5BA42" />
          
          {/* Lower Center Scale */}
          <rect x="8" y="10" width="8" height="2" fill="#991B1B" />
          <rect x="7" y="12" width="10" height="5" fill="#B91C1C" />
          <rect x="9" y="17" width="6" height="3" fill="#DC2626" />
          <rect x="11" y="20" width="2" height="1" fill="#F5BA42" />
          {/* Core Gold sheen */}
          <rect x="10" y="13" width="4" height="2" fill="#F5BA42" />
        </svg>
      );

    case 'Phoenix Feathers':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Flame Feather */}
          <rect x="17" y="2" width="3" height="3" fill="#FFD700" />
          <rect x="15" y="4" width="4" height="3" fill="#FFA500" />
          <rect x="13" y="6" width="5" height="4" fill="#FF6B2B" />
          <rect x="11" y="9" width="6" height="4" fill="#EF4444" />
          <rect x="9" y="12" width="6" height="4" fill="#DC2626" />
          <rect x="7" y="15" width="5" height="4" fill="#B91C1C" />
          <rect x="4" y="18" width="4" height="3" fill="#7F1D1D" />
          
          {/* Golden Quill shaft */}
          <rect x="18" y="3" width="1" height="1" fill="#FFFFFF" />
          <rect x="15" y="6" width="1" height="1" fill="#FFD700" />
          <rect x="12" y="10" width="1" height="1" fill="#FFD700" />
          <rect x="9" y="14" width="1" height="1" fill="#FFD700" />
          <rect x="5" y="19" width="1" height="3" fill="#F5BA42" />
        </svg>
      );

    case 'Ghost Pepper':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Ghost Pepper with green stem */}
          <rect x="12" y="2" width="2" height="3" fill="#10B981" />
          <rect x="10" y="4" width="4" height="2" fill="#059669" />
          
          {/* Pepper Body */}
          <rect x="8" y="6" width="8" height="4" fill="#FF6B2B" />
          <rect x="7" y="10" width="10" height="4" fill="#FF854D" />
          <rect x="9" y="14" width="7" height="4" fill="#9D4EDD" />
          <rect x="11" y="18" width="4" height="3" fill="#7B2CBF" />
          <rect x="12" y="21" width="2" height="1" fill="#4A154B" />
          
          {/* Ghost Face */}
          <rect x="10" y="8" width="1" height="2" fill="#150A26" />
          <rect x="13" y="8" width="1" height="2" fill="#150A26" />
          <rect x="11" y="11" width="2" height="2" fill="#150A26" />
        </svg>
      );

    case 'Love Potion':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Heart-Flask Potion */}
          {/* Cork */}
          <rect x="10" y="2" width="4" height="2" fill="#8B4513" />
          {/* Bottle Neck */}
          <rect x="10" y="4" width="4" height="3" fill="#C084FC" />
          
          {/* Bottle Body */}
          <rect x="7" y="7" width="10" height="2" fill="#E879F9" />
          <rect x="5" y="9" width="14" height="7" fill="#F43F5E" />
          <rect x="7" y="16" width="10" height="4" fill="#BE123C" />
          <rect x="9" y="20" width="6" height="2" fill="#881337" />
          
          {/* White pixel heart emblem */}
          <rect x="10" y="11" width="1" height="1" fill="#FFFFFF" />
          <rect x="13" y="11" width="1" height="1" fill="#FFFFFF" />
          <rect x="9" y="12" width="3" height="1" fill="#FFFFFF" />
          <rect x="12" y="12" width="3" height="1" fill="#FFFFFF" />
          <rect x="10" y="13" width="4" height="1" fill="#FFFFFF" />
          <rect x="11" y="14" width="2" height="1" fill="#FFFFFF" />
          
          {/* Bubble */}
          <rect x="6" y="10" width="1" height="1" fill="#FFE4E6" />
        </svg>
      );

    case 'Flying Potion':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Winged Sky-Blue Potion */}
          <rect x="10" y="3" width="4" height="2" fill="#D97706" />
          <rect x="10" y="5" width="4" height="3" fill="#BAE6FD" />
          
          {/* Body */}
          <rect x="7" y="8" width="10" height="10" fill="#0284C7" />
          <rect x="9" y="18" width="6" height="2" fill="#0369A1" />
          
          {/* Liquid bubbles */}
          <rect x="8" y="9" width="3" height="3" fill="#38BDF8" />
          <rect x="13" y="13" width="2" height="2" fill="#BAE6FD" />
          
          {/* Pixel Wings on Sides */}
          <rect x="3" y="10" width="4" height="2" fill="#E0F2FE" />
          <rect x="2" y="8" width="3" height="2" fill="#E0F2FE" />
          <rect x="17" y="10" width="4" height="2" fill="#E0F2FE" />
          <rect x="19" y="8" width="3" height="2" fill="#E0F2FE" />
        </svg>
      );

    case 'Beauty Potion':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Golden Glamour Flask */}
          <rect x="10" y="2" width="4" height="2" fill="#F5BA42" />
          <rect x="11" y="4" width="2" height="3" fill="#FEF08A" />
          
          <rect x="7" y="7" width="10" height="3" fill="#F59E0B" />
          <rect x="5" y="10" width="14" height="8" fill="#FBBF24" />
          <rect x="7" y="18" width="10" height="3" fill="#D97706" />
          
          {/* Glamour Sparkles */}
          <rect x="11" y="12" width="2" height="2" fill="#FFFFFF" />
          <rect x="10" y="13" width="4" height="1" fill="#FFFFFF" />
        </svg>
      );

    case 'Invisibility Potion':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Translucent Mist Phial */}
          <rect x="10" y="2" width="4" height="2" fill="#64748B" />
          <rect x="10" y="4" width="4" height="3" fill="#CBD5E1" opacity="0.6" />
          
          <rect x="6" y="7" width="12" height="12" fill="#E2E8F0" opacity="0.4" />
          <rect x="8" y="19" width="8" height="2" fill="#94A3B8" opacity="0.6" />
          
          {/* Stealth dashed corners */}
          <rect x="7" y="8" width="2" height="2" fill="#FFFFFF" />
          <rect x="15" y="8" width="2" height="2" fill="#FFFFFF" />
          <rect x="11" y="12" width="2" height="2" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );

    case 'WitchHat':
    case 'Witch Hat':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Tip of conical hat */}
          <rect x="11" y="2" width="2" height="2" fill="#3B1261" />
          <rect x="10" y="4" width="3" height="2" fill="#4C1D95" />
          <rect x="9" y="6" width="5" height="2" fill="#5B21B6" />
          <rect x="8" y="8" width="7" height="2" fill="#5B21B6" />
          <rect x="7" y="10" width="9" height="3" fill="#6D28D9" />
          <rect x="6" y="13" width="11" height="2" fill="#6D28D9" />
          {/* Hat Ribbon (Purple/Violet) */}
          <rect x="6" y="15" width="12" height="2" fill="#A855F7" />
          {/* Golden Buckle */}
          <rect x="10" y="14" width="4" height="3" fill="#F59E0B" />
          <rect x="11" y="15" width="2" height="1" fill="#FEF08A" />
          {/* Wide Brim */}
          <rect x="2" y="17" width="20" height="2" fill="#4C1D95" />
          <rect x="1" y="18" width="22" height="1" fill="#3B1261" />
          {/* Sparkle */}
          <rect x="13" y="3" width="1" height="1" fill="#FDE047" />
        </svg>
      );

    case 'Cauldron':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Bubbling Witch Cauldron */}
          {/* Bubbles rising */}
          <rect x="8" y="2" width="2" height="2" fill="#00F5D4" />
          <rect x="14" y="1" width="2" height="2" fill="#FFD700" />
          <rect x="11" y="3" width="2" height="2" fill="#FF6B2B" />
          
          {/* Rim */}
          <rect x="4" y="6" width="16" height="2" fill="#F5BA42" />
          {/* Handles */}
          <rect x="2" y="8" width="2" height="3" fill="#D97706" />
          <rect x="20" y="8" width="2" height="3" fill="#D97706" />
          
          {/* Cauldron Belly */}
          <rect x="4" y="8" width="16" height="10" fill="#1A0D2E" />
          <rect x="6" y="8" width="12" height="3" fill="#00F5D4" /> {/* Glowing potion surface */}
          <rect x="6" y="18" width="12" height="2" fill="#130922" />
          
          {/* Feet */}
          <rect x="5" y="20" width="3" height="2" fill="#0B0416" />
          <rect x="16" y="20" width="3" height="2" fill="#0B0416" />
          
          {/* Embers */}
          <rect x="10" y="21" width="4" height="2" fill="#FF6B2B" />
        </svg>
      );

    case 'Spellbook':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Ancient Grimoire */}
          <rect x="3" y="4" width="18" height="16" fill="#4A154B" />
          <rect x="2" y="5" width="2" height="14" fill="#F5BA42" /> {/* Spine */}
          <rect x="6" y="5" width="14" height="14" fill="#F4EBD9" /> {/* Pages */}
          
          {/* Rune on page */}
          <rect x="12" y="8" width="2" height="8" fill="#9D4EDD" />
          <rect x="9" y="11" width="8" height="2" fill="#9D4EDD" />
          <rect x="10" y="9" width="6" height="1" fill="#FF6B2B" />
          <rect x="10" y="14" width="6" height="1" fill="#FF6B2B" />
          
          {/* Bookmark ribbon */}
          <rect x="13" y="16" width="2" height="6" fill="#EF4444" />
        </svg>
      );

    case 'Magic Wand':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Wand emitting stars */}
          {/* Shaft */}
          <rect x="4" y="18" width="3" height="3" fill="#8B4513" />
          <rect x="7" y="15" width="3" height="3" fill="#A0522D" />
          <rect x="10" y="12" width="3" height="3" fill="#CD853F" />
          <rect x="13" y="9" width="3" height="3" fill="#DEB887" />
          <rect x="16" y="6" width="3" height="3" fill="#F5BA42" />
          {/* Sparkle Tip */}
          <rect x="19" y="3" width="3" height="3" fill="#FFFFFF" />
          
          {/* Magic Sparks */}
          <rect x="17" y="1" width="2" height="2" fill="#FFD700" />
          <rect x="22" y="4" width="2" height="2" fill="#FF6B2B" />
          <rect x="21" y="9" width="1" height="1" fill="#72F1D6" />
        </svg>
      );

    case 'Unicorn Hair':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Silken Rainbow-White Hair Strand */}
          <rect x="5" y="4" width="3" height="3" fill="#E0F2FE" />
          <rect x="7" y="7" width="3" height="3" fill="#BAE6FD" />
          <rect x="9" y="10" width="3" height="3" fill="#F472B6" />
          <rect x="12" y="12" width="3" height="3" fill="#FBBF24" />
          <rect x="15" y="15" width="3" height="3" fill="#34D399" />
          <rect x="17" y="18" width="3" height="3" fill="#FFFFFF" />
          {/* Star sparkle */}
          <rect x="6" y="2" width="1" height="1" fill="#FFFFFF" />
          <rect x="19" y="16" width="1" height="1" fill="#FFFFFF" />
        </svg>
      );

    case 'Mandrake Roots':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* 8-bit Screaming Root */}
          <rect x="10" y="2" width="4" height="3" fill="#10B981" />
          <rect x="8" y="5" width="8" height="8" fill="#92400E" />
          <rect x="9" y="7" width="2" height="2" fill="#000000" /> {/* Eye */}
          <rect x="13" y="7" width="2" height="2" fill="#000000" /> {/* Eye */}
          <rect x="10" y="10" width="4" height="2" fill="#451A03" /> {/* Screaming mouth */}
          {/* Root legs */}
          <rect x="7" y="13" width="3" height="7" fill="#78350F" />
          <rect x="14" y="13" width="3" height="7" fill="#78350F" />
        </svg>
      );

    case 'Moon Dust':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Silver Eclipse Moon & dust */}
          <rect x="7" y="4" width="10" height="16" fill="#CBD5E1" />
          <rect x="5" y="6" width="14" height="12" fill="#E2E8F0" />
          <rect x="9" y="6" width="10" height="12" fill="#0B0416" />
          <rect x="4" y="16" width="2" height="2" fill="#94A3B8" />
          <rect x="18" y="8" width="2" height="2" fill="#FFFFFF" />
          <rect x="16" y="18" width="2" height="2" fill="#F5BA42" />
        </svg>
      );

    case 'Vampire Blood':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Crimson Blood Droplet */}
          <rect x="11" y="3" width="2" height="3" fill="#DC2626" />
          <rect x="9" y="6" width="6" height="4" fill="#DC2626" />
          <rect x="7" y="10" width="10" height="7" fill="#B91C1C" />
          <rect x="9" y="17" width="6" height="3" fill="#7F1D1D" />
          <rect x="9" y="11" width="2" height="3" fill="#FECACA" /> {/* Specular highlight */}
        </svg>
      );

    case 'Witch Hazel':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Golden bark twigs */}
          <rect x="11" y="2" width="2" height="20" fill="#78350F" />
          <rect x="6" y="7" width="5" height="2" fill="#F5BA42" />
          <rect x="13" y="12" width="6" height="2" fill="#F5BA42" />
          <rect x="5" y="15" width="6" height="2" fill="#F5BA42" />
          <rect x="7" y="6" width="2" height="2" fill="#FF6B2B" />
          <rect x="17" y="11" width="2" height="2" fill="#FF6B2B" />
        </svg>
      );

    case 'Crystal Shards':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Violet Quartz Crystal */}
          <rect x="11" y="2" width="2" height="4" fill="#C084FC" />
          <rect x="8" y="6" width="8" height="12" fill="#A855F7" />
          <rect x="9" y="7" width="3" height="10" fill="#E9D5FF" />
          <rect x="10" y="18" width="4" height="4" fill="#7E22CE" />
          <rect x="16" y="10" width="4" height="8" fill="#00F5D4" />
        </svg>
      );

    case 'Disguise Potion':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Shapeshifter Mask Phial */}
          <rect x="10" y="2" width="4" height="2" fill="#4B5563" />
          <rect x="10" y="4" width="4" height="3" fill="#9333EA" />
          <rect x="6" y="7" width="12" height="11" fill="#6B21A8" />
          <rect x="8" y="18" width="8" height="3" fill="#3B0764" />
          {/* Mask eye cutouts */}
          <rect x="8" y="11" width="2" height="2" fill="#F5BA42" />
          <rect x="14" y="11" width="2" height="2" fill="#F5BA42" />
        </svg>
      );

    case 'Fame Potion':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Golden Star Liqueur */}
          <rect x="10" y="2" width="4" height="2" fill="#CA8A04" />
          <rect x="10" y="4" width="4" height="3" fill="#FDE047" />
          <rect x="6" y="7" width="12" height="12" fill="#EAB308" />
          <rect x="8" y="19" width="8" height="2" fill="#A16207" />
          <rect x="11" y="11" width="2" height="4" fill="#FFFFFF" />
          <rect x="10" y="12" width="4" height="2" fill="#FFFFFF" />
        </svg>
      );

    case 'Luck Potion':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Emerald Lucky Phial */}
          <rect x="10" y="2" width="4" height="2" fill="#15803D" />
          <rect x="10" y="4" width="4" height="3" fill="#6EE7B7" />
          <rect x="6" y="7" width="12" height="12" fill="#10B981" />
          <rect x="8" y="19" width="8" height="2" fill="#047857" />
          {/* 4-leaf clover pixel */}
          <rect x="10" y="10" width="2" height="2" fill="#FFFFFF" />
          <rect x="12" y="10" width="2" height="2" fill="#FFFFFF" />
          <rect x="10" y="12" width="2" height="2" fill="#FFFFFF" />
          <rect x="12" y="12" width="2" height="2" fill="#FFFFFF" />
        </svg>
      );

    case 'Memory Potion':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Cobalt Cerebral Elixir */}
          <rect x="10" y="2" width="4" height="2" fill="#1E3A8A" />
          <rect x="10" y="4" width="4" height="3" fill="#93C5FD" />
          <rect x="6" y="7" width="12" height="12" fill="#2563EB" />
          <rect x="8" y="19" width="8" height="2" fill="#1D4ED8" />
          <rect x="9" y="11" width="6" height="4" fill="#93C5FD" />
        </svg>
      );

    case 'Healing Potion':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Emerald Health Potion with White Cross */}
          <rect x="10" y="2" width="4" height="2" fill="#065F46" />
          <rect x="10" y="4" width="4" height="3" fill="#A7F3D0" />
          <rect x="6" y="7" width="12" height="12" fill="#10B981" />
          <rect x="8" y="19" width="8" height="2" fill="#047857" />
          {/* White cross */}
          <rect x="11" y="10" width="2" height="6" fill="#FFFFFF" />
          <rect x="9" y="12" width="6" height="2" fill="#FFFFFF" />
        </svg>
      );

    case 'Truth Serum':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Crystal Clear Honest Draught */}
          <rect x="10" y="2" width="4" height="2" fill="#334155" />
          <rect x="10" y="4" width="4" height="3" fill="#E2E8F0" />
          <rect x="6" y="7" width="12" height="12" fill="#F8FAFC" opacity="0.8" />
          <rect x="8" y="19" width="8" height="2" fill="#94A3B8" />
          <rect x="11" y="11" width="2" height="3" fill="#00F5D4" />
        </svg>
      );

    case 'PotionCrate':
    case 'Potion Crate':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Wooden Potion Crate with Glass Vials & Straw */}
          {/* Crate Frame */}
          <rect x="3" y="14" width="26" height="15" fill="#8B4513" />
          <rect x="2" y="15" width="28" height="2" fill="#5C2C16" />
          <rect x="2" y="26" width="28" height="2" fill="#5C2C16" />
          <rect x="3" y="16" width="2" height="11" fill="#3E1A0A" />
          <rect x="27" y="16" width="2" height="11" fill="#3E1A0A" />
          <rect x="15" y="16" width="2" height="11" fill="#5C2C16" />
          {/* Iron Corner Brackets */}
          <rect x="2" y="14" width="3" height="3" fill="#4B5563" />
          <rect x="27" y="14" width="3" height="3" fill="#4B5563" />
          <rect x="2" y="26" width="3" height="3" fill="#4B5563" />
          <rect x="27" y="26" width="3" height="3" fill="#4B5563" />
          {/* Straw Packing */}
          <rect x="5" y="15" width="22" height="3" fill="#FDE047" />
          <rect x="7" y="14" width="2" height="2" fill="#FEF08A" />
          <rect x="19" y="14" width="3" height="2" fill="#FEF08A" />
          {/* Potion Vials Peeking Out */}
          {/* Red Vial (Love) */}
          <rect x="6" y="8" width="4" height="6" fill="#F43F5E" />
          <rect x="7" y="6" width="2" height="2" fill="#D97706" />
          <rect x="7" y="9" width="1" height="2" fill="#FFF" />
          {/* Blue Vial (Flying) */}
          <rect x="12" y="7" width="4" height="7" fill="#0284C7" />
          <rect x="13" y="5" width="2" height="2" fill="#D97706" />
          <rect x="13" y="8" width="1" height="2" fill="#FFF" />
          {/* Green Vial (Healing) */}
          <rect x="18" y="9" width="4" height="5" fill="#10B981" />
          <rect x="19" y="7" width="2" height="2" fill="#D97706" />
          <rect x="19" y="10" width="1" height="2" fill="#FFF" />
          {/* Gold Vial (Stardust) */}
          <rect x="23" y="8" width="4" height="6" fill="#F5BA42" />
          <rect x="24" y="6" width="2" height="2" fill="#D97706" />
          <rect x="24" y="9" width="1" height="2" fill="#FFF" />
        </svg>
      );

    case 'MadamHexWithOwl':
    case 'Madam Hex With Owl':
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" shapeRendering="crispEdges" className={`pixelated ${className}`}>
          {/* Cute 16-bit Madam Hex with her Loyal Snowy Barn Owl */}
          
          {/* ════ OWL (Right Side) ════ */}
          {/* Wooden Perch */}
          <rect x="26" y="27" width="12" height="2" fill="#78350F" />
          <rect x="31" y="29" width="2" height="8" fill="#451A03" />
          {/* Owl Body (Snowy White & Cream) */}
          <rect x="27" y="17" width="10" height="10" fill="#F8FAFC" />
          <rect x="28" y="18" width="8" height="8" fill="#FFFFFF" />
          {/* Owl Wings & Feathers */}
          <rect x="26" y="19" width="2" height="7" fill="#CBD5E1" />
          <rect x="36" y="19" width="2" height="7" fill="#CBD5E1" />
          <rect x="29" y="22" width="2" height="2" fill="#E2E8F0" />
          <rect x="33" y="22" width="2" height="2" fill="#E2E8F0" />
          {/* Owl Face & Golden Eyes */}
          <rect x="28" y="16" width="8" height="5" fill="#FFFFFF" />
          <rect x="29" y="17" width="2" height="2" fill="#F59E0B" />
          <rect x="33" y="17" width="2" height="2" fill="#F59E0B" />
          <rect x="30" y="18" width="1" height="1" fill="#000000" />
          <rect x="34" y="18" width="1" height="1" fill="#000000" />
          {/* Little Beak */}
          <rect x="31" y="19" width="2" height="2" fill="#D97706" />
          {/* Talons on Perch */}
          <rect x="29" y="26" width="2" height="2" fill="#D97706" />
          <rect x="33" y="26" width="2" height="2" fill="#D97706" />
          {/* Feather tufts / ears */}
          <rect x="27" y="14" width="2" height="2" fill="#94A3B8" />
          <rect x="35" y="14" width="2" height="2" fill="#94A3B8" />

          {/* ════ MADAM HEX (Left / Center) ════ */}
          {/* Witch Hat Cone */}
          <polygon points="12,2 18,14 6,14" fill="#2E1065" />
          {/* Hat Tip with bend */}
          <rect x="12" y="1" width="2" height="2" fill="#3B0764" />
          <rect x="14" y="2" width="2" height="2" fill="#3B0764" />
          {/* Hat Ribbon (Glowing Orange) */}
          <rect x="6" y="13" width="12" height="2" fill="#F97316" />
          <rect x="11" y="13" width="2" height="2" fill="#FBBF24" /> {/* Buckle */}
          {/* Hat Brim */}
          <rect x="2" y="15" width="20" height="2" fill="#1E1B4B" />

          {/* Face & Hair */}
          {/* Purple Hair Locks */}
          <rect x="4" y="16" width="3" height="9" fill="#581C87" />
          <rect x="17" y="16" width="3" height="9" fill="#581C87" />
          {/* Pale Skin */}
          <rect x="7" y="17" width="10" height="8" fill="#FEF08A" />
          {/* Friendly Anime / Pixel Eyes */}
          <rect x="8" y="19" width="2" height="2" fill="#3B0764" />
          <rect x="14" y="19" width="2" height="2" fill="#3B0764" />
          <rect x="8" y="19" width="1" height="1" fill="#C084FC" />
          <rect x="14" y="19" width="1" height="1" fill="#C084FC" />
          {/* Rose Blush */}
          <rect x="7" y="21" width="2" height="1" fill="#FB7185" />
          <rect x="15" y="21" width="2" height="1" fill="#FB7185" />
          {/* Smile */}
          <rect x="11" y="23" width="2" height="1" fill="#991B1B" />

          {/* Magical Robes */}
          <rect x="5" y="25" width="14" height="12" fill="#4C1D95" />
          <rect x="7" y="25" width="10" height="12" fill="#6B21A8" />
          {/* Golden Robe Trimmings */}
          <rect x="11" y="25" width="2" height="12" fill="#F59E0B" />
          <rect x="7" y="25" width="10" height="1" fill="#F59E0B" />
          {/* Sleeves */}
          <rect x="2" y="26" width="4" height="6" fill="#3B0764" />
          <rect x="18" y="26" width="4" height="6" fill="#3B0764" />

          {/* Holding Glowing Magic Wand */}
          <rect x="20" y="23" width="2" height="8" fill="#78350F" transform="rotate(25 20 23)" />
          {/* Wand Star Sparkle */}
          <rect x="22" y="17" width="2" height="2" fill="#38BDF8" className="animate-ping" />
          <rect x="21" y="18" width="4" height="1" fill="#FFFFFF" />
        </svg>
      );
  }
}

/**
 * Large Original 8-Bit Pixel-Art Magical Potion Shop Scene
 * Displayed proudly in the Hero Section of the Landing Page.
 */
export function PixelPotionShopScene({ className = '' }) {
  return (
    <div className={`relative flex items-center justify-center p-4 ${className}`}>
      <svg 
        viewBox="0 0 160 120" 
        className="w-full max-w-[500px] h-auto pixelated drop-shadow-2xl" 
        shapeRendering="crispEdges"
      >
        {/* Background Wall of Apothecary */}
        <rect x="10" y="10" width="140" height="90" fill="#1A0D2E" />
        
        {/* Arched Stone Windows showing crescent moon & twinkling stars */}
        <rect x="20" y="18" width="24" height="32" fill="#0B0416" />
        <rect x="22" y="16" width="20" height="2" fill="#4B2070" />
        {/* Moon in window */}
        <rect x="28" y="22" width="6" height="8" fill="#F5BA42" />
        <rect x="26" y="24" width="4" height="4" fill="#0B0416" />
        {/* Star in window */}
        <rect x="36" y="28" width="2" height="2" fill="#FFFFFF" className="animate-star" />
        
        {/* Wooden Potion Shelves */}
        <rect x="60" y="22" width="80" height="4" fill="#8B4513" />
        <rect x="60" y="45" width="80" height="4" fill="#8B4513" />
        
        {/* Shelf 1 Potions */}
        {/* Love Potion */}
        <rect x="65" y="14" width="6" height="8" fill="#F43F5E" />
        <rect x="67" y="12" width="2" height="2" fill="#D97706" />
        {/* Flying Potion */}
        <rect x="75" y="13" width="6" height="9" fill="#0284C7" />
        <rect x="77" y="11" width="2" height="2" fill="#D97706" />
        {/* Stardust Jar */}
        <rect x="85" y="15" width="8" height="7" fill="#F5BA42" />
        <rect x="87" y="13" width="4" height="2" fill="#B45309" />
        {/* Fairy Wings Bottle */}
        <rect x="98" y="14" width="7" height="8" fill="#00F5D4" />
        <rect x="100" y="12" width="3" height="2" fill="#FFFFFF" />
        {/* Healing Potion */}
        <rect x="110" y="13" width="6" height="9" fill="#10B981" />
        <rect x="112" y="11" width="2" height="2" fill="#D97706" />
        {/* Vampire Blood Phial */}
        <rect x="122" y="12" width="5" height="10" fill="#991B1B" />
        <rect x="123" y="10" width="3" height="2" fill="#1E293B" />

        {/* Shelf 2 Potions & Spellbooks */}
        <rect x="64" y="36" width="8" height="9" fill="#4A154B" /> {/* Grimoire */}
        <rect x="66" y="34" width="2" height="2" fill="#F5BA42" />
        <rect x="78" y="37" width="6" height="8" fill="#A855F7" />
        <rect x="90" y="35" width="7" height="10" fill="#EAB308" />
        <rect x="103" y="38" width="8" height="7" fill="#EC4899" />
        <rect x="116" y="36" width="6" height="9" fill="#6366F1" />
        <rect x="126" y="35" width="7" height="10" fill="#14B8A6" />

        {/* Apothecary Counter */}
        <rect x="15" y="65" width="130" height="30" fill="#5C2C16" />
        <rect x="10" y="62" width="140" height="5" fill="#8B4513" />
        <rect x="25" y="70" width="110" height="2" fill="#3E1A0A" />

        {/* Big Bubbling Pixel Cauldron on counter */}
        <rect x="25" y="48" width="22" height="15" fill="#0B0416" />
        <rect x="23" y="47" width="26" height="3" fill="#D97706" />
        <rect x="27" y="46" width="18" height="3" fill="#00F5D4" /> {/* Potion liquid */}
        
        {/* Animated Steam Bubbles */}
        <rect x="29" y="40" width="3" height="3" fill="#00F5D4" className="animate-pixel-float" />
        <rect x="37" y="36" width="4" height="4" fill="#FFD700" className="animate-pixel-float" style={{ animationDelay: '0.6s' }} />
        <rect x="33" y="32" width="3" height="3" fill="#FF6B2B" className="animate-pixel-float" style={{ animationDelay: '1.2s' }} />

        {/* Madam Hex at Counter (8-bit Witch Silhouette) */}
        {/* Witch Hat */}
        <polygon points="95,22 105,40 85,40" fill="#2E1065" />
        <rect x="80" y="40" width="30" height="3" fill="#FF6B2B" /> {/* Hat brim & orange band */}
        {/* Face */}
        <rect x="90" y="43" width="10" height="8" fill="#FDE047" />
        <rect x="92" y="46" width="2" height="2" fill="#1E1B4B" /> {/* Eye */}
        {/* Robes */}
        <rect x="85" y="51" width="20" height="16" fill="#3B0764" />
        {/* Hands holding glowing potion */}
        <rect x="92" y="56" width="6" height="6" fill="#F43F5E" />

        {/* Scales & Open Grimoire on Counter */}
        <rect x="115" y="54" width="14" height="8" fill="#F4EBD9" />
        <rect x="121" y="54" width="2" height="8" fill="#B45309" />
        
        {/* Floor Tiles */}
        <rect x="10" y="95" width="140" height="15" fill="#0F081D" />
        <line x1="10" y1="102" x2="150" y2="102" stroke="#25123E" strokeWidth="1" />
        <line x1="45" y1="95" x2="45" y2="110" stroke="#25123E" strokeWidth="1" />
        <line x1="80" y1="95" x2="80" y2="110" stroke="#25123E" strokeWidth="1" />
        <line x1="115" y1="95" x2="115" y2="110" stroke="#25123E" strokeWidth="1" />
      </svg>
    </div>
  );
}
