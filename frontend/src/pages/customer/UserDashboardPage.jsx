import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, ArrowRight, Tag, Clock, PackageCheck, AlertCircle } from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import ProductCard from '../../components/ProductCard';
import ProductImage from '../../components/ProductImage';
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
          api.getMyOrders({ limit: 4 })
        ]);

        if (featRes?.success) setFeaturedData(featRes.data);
        if (ordersRes?.success) setRecentOrders(ordersRes.data || []);
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

  const featuredPotions = featuredData?.featured || [];
  // Popular ingredients from backend, or fallback to filtering recommended items
  const popularIngredients = featuredData?.popularIngredients?.length > 0 
    ? featuredData.popularIngredients 
    : (featuredData?.recommended || []).filter(p => 
        p.item_type === 'INGREDIENT' || 
        (p.category_name && p.category_name.toLowerCase().includes('ingredient')) ||
        (p.sku && p.sku.startsWith('ING-'))
      );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-14 px-2 sm:px-4">
      
      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1: WELCOME BANNER
          ══════════════════════════════════════════════════════════════════ */}
      <section className="pixel-card p-6 sm:p-8 rounded-2xl relative overflow-hidden bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-purple-900/40 border border-purple-500/30 shadow-lg">
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
              Step forward into Madam Hex's private apothecary grimoire. Our cauldrons are simmering with freshly distilled draughts, potent elixirs, and celestial reagents.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                sound.playCastSpell();
                onNavigate('user_shop');
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-serif font-black text-xs shadow-lg shadow-amber-400/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-950" />
              <span>Enter Magical Shop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sound.playCastSpell();
                onNavigate('user_cart');
              }}
              className="px-4 py-3 rounded-xl border border-purple-500/40 hover:border-purple-400/70 bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 text-xs font-serif font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>View Satchel</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2: SEASONAL ARCANE OFFERS
          ══════════════════════════════════════════════════════════════════ */}
      {featuredData?.seasonalOffers && featuredData.seasonalOffers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-serif font-bold text-amber-300 tracking-wide uppercase">
              Seasonal Arcane Offers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredData.seasonalOffers.map((offer, idx) => (
              <div 
                key={idx}
                className="pixel-card p-4 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-purple-950/30 to-purple-900/10 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif font-bold text-amber-300">{offer.title}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 tracking-wider">
                      CODE: {offer.code}
                    </span>
                  </div>
                  <div className="text-sm font-serif font-black text-[var(--text-primary)]">
                    {offer.discount}
                  </div>
                  <p className="text-[11px] font-serif text-[var(--text-muted)]">
                    {offer.banner}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('user_shop')}
                  className="px-3 py-1.5 rounded-lg border border-amber-400/40 hover:border-amber-400 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-serif font-bold shrink-0 transition-all cursor-pointer"
                >
                  Redeem
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3: FEATURED POTIONS & ELIXIRS
          ══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PixelIcon name="Cauldron" size={20} />
            <h2 className="text-lg font-serif font-black text-[var(--text-primary)]">
              Featured Potions & Elixirs
            </h2>
          </div>
          <button
            onClick={() => onNavigate('user_shop')}
            className="text-xs font-serif font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Potions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-serif text-purple-300">
            Unsealing mystical brews...
          </div>
        ) : featuredPotions.length === 0 ? (
          <div className="pixel-card p-6 text-center text-xs font-serif text-[var(--text-muted)]">
            No potions currently brewing in the cauldron.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredPotions.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleQuickAdd}
                onClick={() => onNavigate('user_shop')}
              />
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4: POPULAR MAGICAL INGREDIENTS
          ══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-serif font-black text-[var(--text-primary)]">
              Popular Magical Ingredients
            </h2>
          </div>
          <button
            onClick={() => onNavigate('user_shop')}
            className="text-xs font-serif font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Reagents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-serif text-purple-300">
            Gathering enchanted botanical reagents...
          </div>
        ) : popularIngredients.length === 0 ? (
          <div className="pixel-card p-6 text-center text-xs font-serif text-[var(--text-muted)]">
            No botanical ingredients currently shelved.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularIngredients.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleQuickAdd}
                onClick={() => onNavigate('user_shop')}
              />
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 5: RECENT ORDERS
          ══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg font-serif font-black text-[var(--text-primary)]">
              Recent Parchment Orders
            </h2>
          </div>
          <button
            onClick={() => onNavigate('user_orders')}
            className="text-xs font-serif font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pixel-card p-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)]">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <PackageCheck className="w-8 h-8 mx-auto text-purple-400/40" />
              <div className="text-sm font-serif font-bold text-[var(--text-primary)]">
                No parchment orders recorded yet
              </div>
              <p className="text-xs text-[var(--text-muted)] font-serif max-w-sm mx-auto">
                Visit the magical shop, place enchanted draughts into your satchel, and cast checkout to record your first order.
              </p>
              <button
                onClick={() => onNavigate('user_shop')}
                className="mt-3 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-xs transition-all cursor-pointer"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  onClick={() => onNavigate('user_orders')}
                  className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-950/20 hover:border-purple-400/60 hover:bg-purple-950/40 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-purple-300 group-hover:text-purple-200">
                      {order.order_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-serif font-bold border ${
                      order.status === 'DELIVERED' 
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : order.status === 'SHIPPED'
                        ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                        : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-500/10">
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-serif font-black text-amber-400">
                      {order.total_amount} Gold
                    </span>
                  </div>

                  {order.item_count && (
                    <div className="text-[10px] text-[var(--text-muted)] font-serif">
                      {order.item_count} {order.item_count === 1 ? 'magical item' : 'magical items'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
