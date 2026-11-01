import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import ProductImage from './ProductImage';

/**
 * ProductCard
 * Premium magical product card for Mystic Matrix Customer Sanctuary & Magical Shop.
 * Designed to guarantee:
 * - Prominent pixel-art illustrations with no broken boxes or empty spaces
 * - Uniform heights and perfectly aligned bottom action bars across all responsive viewports
 * - Day/Night adaptive styling with rich contrast and fantasy aesthetics
 * - Customer-safe presentation (zero internal inventory leak)
 */
export default function ProductCard({
  product,
  onAddToCart,
  onClick,
  showCategory = true,
  className = ''
}) {
  if (!product) return null;

  const isOutOfStock = product.current_stock <= 0;
  const isLowStock = !isOutOfStock && product.current_stock <= 8;

  return (
    <div
      className={`pixel-card rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 flex flex-col justify-between h-full hover:border-purple-400/80 transition-all duration-300 hover:shadow-xl group relative select-none ${className}`}
    >
      <div className="space-y-3">
        {/* Product Illustration Container with Stock Badge */}
        <div
          onClick={onClick ? () => onClick(product) : undefined}
          className={`w-full h-36 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-center p-3 relative overflow-hidden group-hover:bg-purple-900/25 transition-all ${
            onClick ? 'cursor-pointer' : ''
          }`}
        >
          {/* Subtle Ambient Magical Glow behind product */}
          <div className="absolute inset-0 bg-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Guaranteed Pixel Art Illustration */}
          <ProductImage
            name={product.name}
            imageUrl={product.image_url}
            category={product.category_name}
            size={88}
            className="group-hover:scale-108 transition-transform duration-300 ease-out"
          />

          {/* Stock Availability Badge */}
          <div className="absolute top-2.5 right-2.5">
            {isOutOfStock ? (
              <span className="px-2 py-0.5 rounded text-[9px] font-pixel bg-red-950/80 text-red-300 border border-red-500/40 shadow-xs">
                DEPLETED
              </span>
            ) : isLowStock ? (
              <span className="px-2 py-0.5 rounded text-[9px] font-pixel bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-xs">
                ONLY {product.current_stock} LEFT
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-950/70 text-purple-200 border border-purple-500/30 shadow-xs">
                {product.current_stock} in stock
              </span>
            )}
          </div>

          {/* Subtle SKU watermark */}
          {product.sku && (
            <div className="absolute bottom-2 left-2 text-[9px] font-mono text-purple-300/70 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/20">
              {product.sku}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          {showCategory && product.category_name && (
            <div className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
              {product.category_name}
            </div>
          )}
          <h3
            onClick={onClick ? () => onClick(product) : undefined}
            className={`font-serif font-black text-sm text-[var(--text-primary)] group-hover:text-purple-400 transition-colors mt-0.5 line-clamp-1 ${
              onClick ? 'cursor-pointer' : ''
            }`}
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-[11px] font-serif text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed min-h-[2rem]">
            {product.description || 'Distilled with ancient incantations in Madam Hex\'s bubbling brass cauldron.'}
          </p>
        </div>
      </div>

      {/* Card Footer: Price & Add to Satchel Action */}
      <div className="pt-3 mt-3 border-t border-[var(--border-card)] flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono">Price</div>
          <div className="font-serif font-black text-sm sm:text-base text-amber-400 leading-tight">
            {product.selling_price} <span className="text-[11px] font-sans font-normal text-amber-300/80">Gold</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart && onAddToCart(product, 1)}
          disabled={isOutOfStock}
          className={`px-3 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            isOutOfStock
              ? 'bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed opacity-60'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
          }`}
          title={isOutOfStock ? 'Item currently out of stock' : 'Add 1 to Satchel'}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isOutOfStock ? 'Depleted' : 'Add to Satchel'}</span>
        </button>
      </div>
    </div>
  );
}
