import React, { useState } from 'react';
import MagicalItemIcon from './MagicalItemIcon';
import { getImageUrl } from '../services/api';

/**
 * ProductImage
 * Reliable, enchanted pixel-art product illustration component.
 * Features:
 * - Direct resolution of public SVG assets from Vercel/local CDN
 * - Instant fallback to vector PixelArt component (<MagicalItemIcon>) on error or missing asset
 * - Crisp retro pixelated rendering (imageRendering: 'pixelated')
 * - Magical glow and themed styling for Day and Night modes
 */
export default function ProductImage({
  name,
  imageUrl,
  category,
  size = 64,
  className = '',
  imgClassName = '',
  badge = null
}) {
  const [hasError, setHasError] = useState(false);

  // Normalize image source
  let resolvedSrc = null;
  if (imageUrl && !hasError) {
    resolvedSrc = getImageUrl(imageUrl);
  } else if (!hasError && name) {
    // Attempt automatic SVG mapping from name if imageUrl was empty
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    resolvedSrc = `/images/${slug}.svg`;
  }

  return (
    <div className={`relative flex items-center justify-center select-none overflow-hidden ${className}`}>
      {resolvedSrc && !hasError ? (
        <img
          src={resolvedSrc}
          alt={name || 'Magical Product'}
          className={`object-contain transition-transform duration-300 ${imgClassName}`}
          style={{
            width: size,
            height: size,
            maxWidth: '100%',
            maxHeight: '100%',
            imageRendering: 'pixelated'
          }}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <MagicalItemIcon
          name={name}
          category={category}
          size={size}
          className={imgClassName}
        />
      )}

      {badge && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-900/80 text-purple-200 border border-purple-500/30 backdrop-blur-xs shadow-sm">
          {badge}
        </div>
      )}
    </div>
  );
}
