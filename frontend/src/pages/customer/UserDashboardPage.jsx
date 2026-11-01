import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, ArrowRight, ShieldCheck, Tag, Clock, CheckCircle2 } from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import { api } from '../../services/api';
import { sound } from '../../utils/audioSynth';

export default function UserDashboardPage({ user, onNavigate, onAddToCart }) {
  const [featuredData, setFeaturedData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [featRes, ordersRes] = await Promise.all([
          api.getShopFeatured(),
          api.getMyOrders({ limit: 3 })
        ]);

        if (featRes.success) setFeaturedData(featRes.data);
        if (ordersRes.success) setRecentOrders(ordersRes.data);
      } catch (err) {
        console.error('Failed to load customer sanctuary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleQuickAdd = (product) => {
    sound.playPotionBubble();
    if (onAddToCart) onAddToCart(product, 1);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Welcome Banner */}
      <div className="pixel-card p-6 sm:p-8 rounded-2xl relative overflow-hidden bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-purple-900/40 border border-purple-500/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-amber-400/20 text-amber-300 border border-amber-400/30">
                APPRENTICE SANCTUARY
              </span>
              <span className="text-xs font-serif text-purple-300">
                • Hallowmere Moonlit Realm
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[var(--text-primary)]">
              Greetings, {user?.name || 'Alchemist'}!
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-serif max-w-2xl leading-relaxed">
              Step forward into Madam Hex's private apothecary grimoire. Our cauldrons are simmering with freshly distilled love potions, supersonic brooms, and ethereal stardust.
            </p>
          </div>

          <button
            onClick={() => onNavigate('user_shop')}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-serif font-bold text-xs shadow-lg shadow-amber-400/20 flex items-center gap-2 shrink-0 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-purple-950" />
            <span>Enter Magical Shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Seasonal Arcane Offers */}
      {featuredData?.seasonalOffers && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredData.seasonalOffers.map((offer, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-serif font-bold text-amber-300">{offer.title}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    CODE: {offer.code}
                  </span>
                </div>
                <div className="text-xs font-serif font-black text-[var(--text-primary)]">
                  {offer.discount}
                </div>
                <p className="text-[11px] font-sans text-[var(--text-muted)]">
                  {offer.banner}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Featured Potions & Elixirs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PixelIcon name="Cauldron" size={20} />
            <h2 className="text-lg font-serif font-black text-[var(--text-primary)]">
              Featured Potions & Elixirs
            </h2>
          </div>
          <button
            onClick={() => onNavigate('user_shop')}
            className="text-xs font-serif font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View Complete Grimoire</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredData?.featured?.map((product) => (
            <div 
              key={product.id}
              className="pixel-card p-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] flex flex-col justify-between hover:border-purple-400 transition-all group"
            >
              <div className="space-y-3">
                <div className="w-full h-32 rounded-lg bg-purple-950/30 border border-purple-500/20 flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-102 transition-transform">
                  <img
                    src={product.image_url || '/images/default_potion.png'}
                    alt={product.name}
                    className="max-h-24 max-w-24 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-900/60 text-purple-200 border border-purple-500/30">
                    {product.current_stock} in stock
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                    {product.category_name}
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[11px] font-sans text-[var(--text-muted)] line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[var(--border-card)] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[var(--text-muted)] font-mono">Price: </span>
                  <span className="font-serif font-black text-sm text-amber-400">
                    {product.selling_price} Gold
                  </span>
                </div>

                <button
                  onClick={() => handleQuickAdd(product)}
                  disabled={product.current_stock <= 0}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white text-xs font-serif font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Potions & Recent Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Potions (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-serif font-black text-[var(--text-primary)]">
              Popular with Nocturnal Coven
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredData?.recommended?.map((product) => (
              <div 
                key={product.id}
                className="p-3.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] flex items-center gap-3 hover:border-purple-400 transition-all"
              >
                <div className="w-14 h-14 rounded-lg bg-purple-950/40 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <img
                    src={product.image_url || '/images/default_potion.png'}
                    alt={product.name}
                    className="w-10 h-10 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif font-bold text-xs text-[var(--text-primary)] truncate">
                    {product.name}
                  </div>
                  <div className="text-[11px] font-mono text-amber-400 font-bold">
                    {product.selling_price} Gold
                  </div>
                  <div className="text-[9px] font-sans text-[var(--text-muted)]">
                    Stock: {product.current_stock} units
                  </div>
                </div>
                <button
                  onClick={() => handleQuickAdd(product)}
                  className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 transition-all shrink-0"
                  title="Add to satchel"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Preview Widget (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-serif font-black text-[var(--text-primary)]">
                Recent Orders
              </h2>
            </div>
            <button
              onClick={() => onNavigate('user_orders')}
              className="text-[11px] font-serif text-purple-400 hover:underline"
            >
              All Orders
            </button>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--text-muted)] font-serif">
                No parchment orders recorded yet. Visit the magical shop to begin your alchemy journey!
              </div>
            ) : (
              recentOrders.map((order) => (
                <div 
                  key={order.id}
                  onClick={() => onNavigate('user_orders')}
                  className="p-2.5 rounded-lg border border-purple-500/20 bg-purple-950/20 hover:border-purple-400/40 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-purple-300">{order.order_number}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-serif bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    <span className="font-bold text-amber-400">{order.total_amount} Gold</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

