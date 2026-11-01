import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ShoppingBag, Sparkles, X, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import ProductImage from '../../components/ProductImage';
import { api } from '../../services/api';
import { sound } from '../../utils/audioSynth';

export default function UserShopPage({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'potions' | 'ingredients'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name_asc');
  const [selectedProduct, setSelectedProduct] = useState(null); // for Detail Modal
  const [modalLoading, setModalLoading] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, inStockOnly, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        sort: sortBy,
        limit: 100
      };
      if (selectedCategory === 'potions') params.item_type = 'potion';
      if (selectedCategory === 'ingredients') params.item_type = 'ingredient';
      if (inStockOnly) params.in_stock = 'true';
      if (search) params.search = search;

      const res = await api.getShopProducts(params);
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load shop items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleOpenDetail = async (productId) => {
    try {
      setModalLoading(true);
      sound.playPotionBubble();
      const res = await api.getShopProduct(productId);
      if (res.success) {
        setSelectedProduct(res.data);
      }
    } catch (err) {
      console.error('Failed to load product detail:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuantityChange = (productId, delta) => {
    setItemQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAdd = (product) => {
    const qty = itemQuantities[product.id] || 1;
    sound.playPotionBubble();
    if (onAddToCart) onAddToCart(product, qty);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <PixelIcon name="Cauldron" size={24} />
            <h1 className="text-2xl font-serif font-black text-[var(--text-primary)]">
              Magical Apothecary Grimoire
            </h1>
          </div>
          <p className="text-xs font-serif text-[var(--text-muted)] mt-1">
            Browse authentic alchemical draughts, bottled stars, and arcane reagents direct from Madam Hex's nocturnal shelves.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spells, draughts..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none focus:border-purple-400 transition-all"
          />
        </form>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)]">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-serif font-bold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-purple-900/20'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setSelectedCategory('potions')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedCategory === 'potions'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-purple-900/20'
            }`}
          >
            Potions & Elixirs
          </button>
          <button
            onClick={() => setSelectedCategory('ingredients')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedCategory === 'ingredients'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-purple-900/20'
            }`}
          >
            Reagents & Flora
          </button>
        </div>

        {/* In Stock & Sort Controls */}
        <div className="flex items-center gap-3 text-xs font-serif">
          <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded accent-purple-600"
            />
            <span>In Stock Only</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-purple-500/30 text-xs font-serif text-[var(--text-primary)] focus:outline-none"
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="stock_desc">Highest Stock</option>
          </select>
        </div>

      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="font-serif text-xs text-purple-300">Summoning grimoire items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center space-y-2 pixel-card p-8 rounded-xl border border-dashed border-purple-500/30">
          <Sparkles className="w-8 h-8 mx-auto text-purple-400 opacity-60" />
          <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
            No magical reagents found matching your incantation
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-serif">
            Try adjusting your search terms or filter selections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => {
            const qty = itemQuantities[product.id] || 1;
            const isOutOfStock = product.current_stock <= 0;

            return (
              <div
                key={product.id}
                className="pixel-card rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 flex flex-col justify-between hover:border-purple-400/80 transition-all hover:shadow-xl group"
              >
                <div className="space-y-3">
                  {/* Item Image & Stock Badge */}
                  <div 
                    onClick={() => handleOpenDetail(product.id)}
                    className="w-full h-36 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center p-3 relative cursor-pointer overflow-hidden group-hover:bg-purple-950/40 transition-all"
                  >
                    <ProductImage
                      name={product.name}
                      imageUrl={product.image_url}
                      category={product.category_name}
                      size={88}
                      className="group-hover:scale-108 transition-transform duration-300 ease-out"
                    />

                    {/* Stock Status Pill */}
                    <div className="absolute top-2.5 right-2.5">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-pixel bg-red-950/70 text-red-300 border border-red-500/40">
                          DEPLETED
                        </span>
                      ) : product.stock_status === 'LOW_STOCK' ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-pixel bg-amber-950/70 text-amber-300 border border-amber-500/40">
                          {product.current_stock} LEFT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-950/70 text-purple-200 border border-purple-500/30">
                          {product.current_stock} in stock
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 left-2 text-[9px] font-mono text-purple-300/80 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/20">
                      {product.sku}
                    </div>
                  </div>

                  {/* Product Title & Info */}
                  <div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                      {product.category_name}
                    </div>
                    <h3 
                      onClick={() => handleOpenDetail(product.id)}
                      className="font-serif font-black text-sm text-[var(--text-primary)] group-hover:text-purple-400 cursor-pointer transition-colors mt-0.5"
                    >
                      {product.name}
                    </h3>
                    <p className="text-[11px] font-sans text-[var(--text-muted)] line-clamp-2 mt-1 leading-snug">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Pricing & Add to Cart Controls */}
                <div className="pt-3 mt-3 border-t border-[var(--border-card)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)] font-mono">Price:</span>
                    <span className="font-serif font-black text-base text-amber-400">
                      {product.selling_price} Gold
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center rounded-lg border border-purple-500/30 bg-purple-950/30 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        disabled={isOutOfStock}
                        className="px-2 py-1 text-purple-300 hover:text-white disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="px-2 py-1 font-bold text-[var(--text-primary)]">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        disabled={isOutOfStock || qty >= product.current_stock}
                        className="px-2 py-1 text-purple-300 hover:text-white disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Satchel Button */}
                    <button
                      type="button"
                      onClick={() => handleAdd(product)}
                      disabled={isOutOfStock}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-serif font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Sold Out' : 'Add to Satchel'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="pixel-card w-full max-w-lg rounded-2xl p-6 sm:p-8 bg-[var(--bg-card)] border border-purple-500/40 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-purple-500/30 text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-28 h-28 rounded-2xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center p-3 shrink-0">
                <ProductImage
                  name={selectedProduct.name}
                  imageUrl={selectedProduct.image_url}
                  category={selectedProduct.category_name}
                  size={96}
                />
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[10px] font-mono text-purple-300 uppercase">
                  {selectedProduct.category_name} • SKU: {selectedProduct.sku}
                </div>
                <h2 className="text-xl font-serif font-black text-[var(--text-primary)]">
                  {selectedProduct.name}
                </h2>
                <div className="text-lg font-serif font-bold text-amber-400">
                  {selectedProduct.selling_price} Gold Coins
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)]">
                  Current Shelf Stock: {selectedProduct.current_stock} units
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-serif font-bold text-purple-300 uppercase tracking-wider">
                Arcane Properties & Lore
              </h4>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            {/* Potion Recipe Ingredients (if applicable) */}
            {selectedProduct.recipe && (
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-amber-400">
                    Alchemy Recipe: {selectedProduct.recipe.name}
                  </span>
                  <span className="text-[10px] font-mono text-purple-300">
                    Difficulty: {selectedProduct.recipe.difficulty}
                  </span>
                </div>
                <p className="text-[11px] font-serif text-[var(--text-muted)] italic">
                  "{selectedProduct.recipe.instructions}"
                </p>
                <div className="text-[11px] font-serif font-bold text-purple-200">
                  Required Botanical & Mineral Reagents:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedProduct.recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-purple-900/20 border border-purple-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[11px] text-[var(--text-primary)]">{ing.name} ({ing.quantity_required}x)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[var(--border-card)] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-serif font-bold text-[var(--text-secondary)] hover:text-white"
              >
                Close Scroll
              </button>
              <button
                onClick={() => {
                  handleAdd(selectedProduct);
                  setSelectedProduct(null);
                }}
                disabled={selectedProduct.current_stock <= 0}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 text-white font-serif font-bold text-xs shadow-lg flex items-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Satchel</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

