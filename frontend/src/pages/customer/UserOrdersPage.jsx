import React, { useState, useEffect } from 'react';
import { Package, Clock, ChevronRight, X, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import { api } from '../../services/api';
import { sound } from '../../utils/audioSynth';

export default function UserOrdersPage({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getMyOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrder = async (orderId) => {
    try {
      setModalLoading(true);
      sound.playPotionBubble();
      const res = await api.getOrderDetails(orderId);
      if (res.success) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch order detail:', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-serif font-black text-[var(--text-primary)]">
              Your Order Grimoire
            </h1>
          </div>
          <p className="text-xs font-serif text-[var(--text-muted)] mt-1">
            Historical record of all magical requisitions and potion pacts sealed under your moniker.
          </p>
        </div>

        <button
          onClick={() => onNavigate('user_shop')}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Order</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="font-serif text-xs text-purple-300">Retrieving order archives...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="pixel-card p-12 text-center rounded-2xl border border-dashed border-purple-500/30 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Package className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h3 className="font-serif font-black text-lg text-[var(--text-primary)]">
              No orders yet inscribed in your archive
            </h3>
            <p className="font-serif text-xs text-[var(--text-muted)] mt-1">
              Your satchel is clear and ready for your first magical requisition.
            </p>
          </div>
          <button
            onClick={() => onNavigate('user_shop')}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Browse Available Potions</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleOpenOrder(order.id)}
              className="pixel-card p-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:border-purple-400 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-purple-300 group-hover:text-purple-200">
                    {order.order_number}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                    {order.status}
                  </span>
                </div>
                <div className="text-xs font-serif text-[var(--text-muted)] flex items-center gap-3">
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  <span>&bull;</span>
                  <span>{order.items?.length || 0} unique reagents</span>
                  <span>&bull;</span>
                  <span>Method: {order.payment_method || 'SPELL_GOLD'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Total Amount</div>
                  <div className="font-mono font-bold text-base text-amber-400">
                    {order.total_amount} Gold
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-purple-900/30 text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Itemized Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="pixel-card w-full max-w-lg rounded-2xl p-6 sm:p-8 bg-[var(--bg-card)] border border-purple-500/50 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-purple-500/30 text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                  {selectedOrder.status}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <h2 className="text-xl font-serif font-black text-[var(--text-primary)] mt-1">
                Order #{selectedOrder.order_number}
              </h2>
            </div>

            {/* Itemized Table */}
            <div className="border border-purple-500/30 rounded-xl overflow-hidden">
              <div className="bg-purple-950/40 px-3.5 py-2 text-[11px] font-serif font-bold text-purple-200 flex justify-between border-b border-purple-500/20">
                <span>Item</span>
                <span>Qty & Total</span>
              </div>
              <div className="divide-y divide-purple-500/10 p-2 space-y-1">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 text-xs">
                    <div>
                      <div className="font-serif font-bold text-[var(--text-primary)]">
                        {item.product_name}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">
                        Unit Price: {item.unit_price} Gold
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-400">
                        {item.total_price} Gold
                      </div>
                      <div className="text-[10px] text-purple-300">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-1.5 text-xs font-serif">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span className="font-mono text-[var(--text-primary)]">{selectedOrder.subtotal} Gold</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Tax (5%)</span>
                <span className="font-mono text-[var(--text-primary)]">{selectedOrder.tax_amount} Gold</span>
              </div>
              <div className="pt-2 border-t border-purple-500/20 flex justify-between font-bold text-sm text-[var(--text-primary)]">
                <span>Total Amount Debited</span>
                <span className="font-mono text-amber-400 font-bold">{selectedOrder.total_amount} Gold</span>
              </div>
            </div>

            {/* Delivery Lore */}
            {selectedOrder.shipping_address && (
              <div className="text-xs space-y-1">
                <div className="font-serif font-bold text-purple-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Destination Realm</span>
                </div>
                <p className="font-sans text-[var(--text-muted)] pl-5">
                  {selectedOrder.shipping_address}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-[var(--border-card)] flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-xs"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

