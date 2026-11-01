import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import MagicalItemIcon from './MagicalItemIcon';
import { sound } from '../utils/audioSynth';

export default function CounterSaleModal({ 
  isOpen, 
  onClose, 
  products = [], 
  onRecordSale 
}) {
  const [selectedProductId, setSelectedProductId] = useState(products?.[0]?.id || 1);
  const [quantity, setQuantity] = useState(1);
  const [customerType, setCustomerType] = useState('Witch');
  const [notes, setNotes] = useState('Counter apothecary order');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (products && products.length > 0) {
        setSelectedProductId(products[0].id);
      }
      setQuantity(1);
      setErrorMsg('');
      setCustomerType('Witch');
      setNotes('Counter apothecary order');
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeProduct = products.find(p => p.id === parseInt(selectedProductId, 10)) || products[0];
  const totalPrice = activeProduct ? Math.round(activeProduct.selling_price * quantity * 100) / 100 : 0;
  const isStockSufficient = activeProduct && activeProduct.current_stock >= quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeProduct) return;

    if (!isStockSufficient) {
      setErrorMsg(`Insufficient stock! Only ${activeProduct.current_stock} units left on shelves.`);
      sound.playWarningHex();
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      await onRecordSale({
        product_id: activeProduct.id,
        quantity: parseInt(quantity, 10),
        customer_type: customerType,
        notes: notes
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF6B2B', '#F5BA42', '#9D4EDD', '#00F5D4']
      });

      sound.playSparkle();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Spell transaction failed');
      sound.playWarningHex();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="pixel-card p-6 w-full max-w-md border-[var(--color-gold)] space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--color-gold-subtle)] border border-[var(--color-gold)]">
              <ShoppingBag className="w-5 h-5 text-[var(--color-gold)]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
                Record Counter Customer Sale
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans">
                Real-time stock deduction & revenue tracking
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[var(--color-crimson-subtle)] border border-[var(--color-crimson)] text-[var(--color-crimson)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-crimson)]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          {/* Select Product */}
          <div>
            <label className="block text-[var(--text-secondary)] mb-1 font-serif font-bold">Select Item</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                sound.playPotionBubble();
                setSelectedProductId(parseInt(e.target.value, 10));
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--color-gold)]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.current_stock} in stock) — {p.selling_price}₲
                </option>
              ))}
            </select>
          </div>

          {/* Active Product Preview */}
          {activeProduct && (
            <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MagicalItemIcon name={activeProduct.name} size={30} />
                <div>
                  <div className="font-serif font-bold text-[var(--text-primary)]">{activeProduct.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Stock: <strong className={activeProduct.current_stock <= 5 ? 'text-[var(--color-crimson)]' : 'text-[var(--color-emerald)]'}>{activeProduct.current_stock}</strong>
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[var(--color-gold)] font-bold text-sm">{activeProduct.selling_price}₲</span>
                <span className="text-[10px] text-[var(--text-muted)] block">per unit</span>
              </div>
            </div>
          )}

          {/* Quantity & Customer Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-serif font-bold">Quantity</label>
              <input
                type="number"
                min="1"
                max={activeProduct ? activeProduct.current_stock : 100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[var(--color-gold)]"
                required
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-serif font-bold">Customer Patron</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--color-gold)]"
              >
                <option value="Witch">Witch</option>
                <option value="Wizard">Wizard</option>
                <option value="Warlock">Warlock</option>
                <option value="Necromancer">Necromancer</option>
                <option value="Alchemist">Alchemist</option>
                <option value="Fairy">Fairy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] mb-1 font-serif font-bold">Order Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Midnight coven brewing"
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          {/* Price Calculation */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--color-gold)] flex items-center justify-between">
            <span className="font-serif font-bold text-[var(--text-primary)] text-sm">Total Galleons:</span>
            <span className="font-mono font-bold text-xl text-[var(--color-gold)]">
              {totalPrice} ₲
            </span>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="pixel-btn-secondary text-xs px-4 py-2"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isStockSufficient}
              className="pixel-btn-gold text-xs px-5 py-2.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? 'Dispensing...' : 'Collect Galleons'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
