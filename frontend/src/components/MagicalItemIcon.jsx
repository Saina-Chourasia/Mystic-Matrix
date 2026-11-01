import React from 'react';
import { PixelIcon } from './PixelArt';

export default function MagicalItemIcon({ name, category, size = 40, className = '' }) {
  // If size is requested, pass down
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <PixelIcon name={name} size={size} />
    </div>
  );
}
