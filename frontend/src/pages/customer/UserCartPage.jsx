import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, MapPin, FileText } from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import ProductImage from '../../components/ProductImage';
import { api } from '../../services/api';
import { sound } from '../../utils/audioSynth';

export default function UserCartPage({ onNavigate, onOrderCompleted }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('Nocturnal Quarter, Hallowmere High Street #7');
  const [orderNotes, setOrderNotes] = useState('Deliver before midnight under the crescent moon');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to load satchel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (cartItemId, newQty) => {
    try {
      sound.playPotionBubble();
      const res = await api.updateCartItem(cartItemId, newQty);
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not update item quantity.');
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      sound.playWarningHex();
      const res = await api.removeFromCart(cartItemId);
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleClearCart = async () => {
    try {
      sound.playWarningHex();
      const res = await api.clearCart();
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cart || !cart.items || cart.items.length === 0) return;

    // Verify stock client-side as first line of defense
    for (const item of cart.items) {
      if (!item.in_stock) {
        setErrorMessage(`Cannot place order: "${item.name}" exceeds current shelf stock (${item.available_stock} available).`);
        return;
      }
    }

    try {
      setCheckingOut(true);
      setErrorMessage(null);
      sound.playCastSpell();

      const res = await api.checkout({
        shippingAddress,
        notes: orderNotes,
        paymentMethod: 'DEMO_SPELL_GOLD'
      });

      if (res.success) {
        sound.playCoinClink();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setConfirmedOrder(res.data);
        if (onOrderCompleted) onOrderCompleted(res.data);
        loadCart();
      }
    } catch (err) {
      sound.playWarningHex();
      setErrorMessage(err.message || 'Demo checkout could not be completed.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="font-serif text-xs text-purple-300">Summoning your satchel contents...</p>
      </div>
    );
  }

  // Order Confirmation View
  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in text-center space-y-6">
        <div className="pixel-card p-8 rounded-2xl bg-[var(--bg-card)] border border-emerald-500/50 shadow-2xl space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <div className="text-[10px] font-pixel tracking-widest text-emerald-400 uppercase">
              DEMO ORDER COMPLETE • PACT SEALED
            </div>
            <h1 className="text-2xl font-serif font-black text-[var(--text-primary)] mt-1">
              Order Confirmed!
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-serif mt-1">
              Order Number: <span className="font-mono font-bold text-amber-400">{confirmedOrder.order_number}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-left space-y-2 text-xs">
            <div className="flex justify-between font-serif font-bold text-purple-200 border-b border-purple-500/20 pb-2">
              <span>Itemized Reagents</span>
              <span>Amount</span>
            </div>
            {confirmedOrder.items?.map((item) => (
              <div key={item.id} className="flex justify-between font-sans text-[var(--text-muted)]">
                <span>{item.quantity}x {item.product_name}</span>
                <span className="font-mono text-amber-300">{item.total_price} Gold</span>
              </div>
            ))}
            <div className="pt-2 border-t border-purple-500/20 flex justify-between font-serif font-bold text-sm text-[var(--text-primary)]">
              <span>Total Debited:</span>
              <span className="text-amber-400 font-mono">{confirmedOrder.total_amount} Gold Coins</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('user_orders')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-xs shadow-md transition-all"
            >
              View Order in Grimoire
            </button>
            <button
              onClick={() => {
                setConfirmedOrder(null);
                onNavigate('user_shop');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-purple-500/40 text-purple-300 hover:text-white font-serif font-bold text-xs transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-serif font-black text-[var(--text-primary)]">
            Your Magical Satchel
          </h1>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            ({cart?.total_items || 0} items)
          </span>
        </div>

        {!isEmpty && (
          <button
            onClick={handleClearCart}
            className="text-xs font-serif text-red-400 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Satchel</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-red-500/50 bg-red-950/30 text-xs text-red-200 flex items-center gap-2 font-serif">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isEmpty ? (
        <div className="pixel-card p-12 text-center rounded-2xl border border-dashed border-purple-500/30 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShoppingBag className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h3 className="font-serif font-black text-lg text-[var(--text-primary)]">
              Your satchel is currently vacant
            </h3>
            <p className="font-serif text-xs text-[var(--text-muted)] mt-1">
              Explore Madam Hex's emporium to gather potions, charms, and mystical reagents.
            </p>
          </div>
          <button
            onClick={() => onNavigate('user_shop')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Browse Magical Shop</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="pixel-card p-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] flex items-center gap-4 hover:border-purple-400/50 transition-all"
              >
                {/* Product Image */}
                <div className="w-16 h-16 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <ProductImage
                    name={item.name}
                    imageUrl={item.image_url}
                    category={item.category_name}
                    size={48}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono text-[var(--text-muted)]">
                    {item.sku}
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[var(--text-primary)] truncate">
                    {item.name}
                  </h4>
                  <div className="text-xs font-serif text-amber-400 font-bold">
                    {item.selling_price} Gold
                  </div>
                  {!item.in_stock && (
                    <div className="text-[10px] text-red-400 font-mono mt-0.5">
                      ⚠ Only {item.available_stock} in stock! Please reduce quantity.
                    </div>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center rounded-lg border border-purple-500/30 bg-purple-950/30 text-xs font-mono shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-purple-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-2 py-1 font-bold text-[var(--text-primary)]">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.available_stock}
                    className="px-2.5 py-1 text-purple-300 hover:text-white disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right min-w-[70px] shrink-0">
                  <div className="font-mono font-bold text-sm text-amber-400">
                    {item.item_total} Gold
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-[11px] text-red-400 hover:underline mt-1"
                  >
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Checkout & Summary Panel (1 col) */}
          <div className="space-y-4">
            
            <form onSubmit={handleCheckout} className="pixel-card p-6 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] space-y-5">
              <h3 className="font-serif font-black text-base text-[var(--text-primary)] border-b border-[var(--border-card)] pb-3">
                Order Summary & Checkout
              </h3>

              {/* Server-Calculated Price Breakdown */}
              <div className="space-y-2 text-xs font-serif">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Reagent Subtotal</span>
                  <span className="font-mono text-[var(--text-primary)]">{cart?.subtotal || 0} Gold</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Magical Tax (5%)</span>
                  <span className="font-mono text-[var(--text-primary)]">{cart?.tax || 0} Gold</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Nocturnal Owl Delivery</span>
                  <span className="font-mono text-emerald-400">FREE</span>
                </div>
                <div className="pt-3 border-t border-[var(--border-card)] flex justify-between font-bold text-sm text-[var(--text-primary)]">
                  <span>Total Amount</span>
                  <span className="font-mono text-amber-400 font-black text-base">{cart?.total || 0} Gold</span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-serif font-bold text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>Delivery Realm / Address</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-serif font-bold text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    <span>Incantation Instructions / Notes</span>
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/20 border border-purple-500/30 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="submit"
                disabled={checkingOut || isEmpty}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-purple-950 font-serif font-black text-xs shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-purple-950" />
                <span>{checkingOut ? 'Sealing the Pact...' : `Seal Demo Order (${cart?.total || 0} Gold)`}</span>
              </button>

              <p className="text-[10px] text-[var(--text-muted)] text-center font-sans">
                Demo ordering workflow. Stock is deducted atomically from Madam Hex's authoritative inventory ledger.
              </p>
            </form>

          </div>

        </div>
      )}

    </div>
  );
}

