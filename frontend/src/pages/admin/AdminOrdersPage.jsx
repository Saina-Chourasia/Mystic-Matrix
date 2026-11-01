import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  X, 
  MapPin, 
  Coins, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import { api } from '../../services/api';
import { sound } from '../../utils/audioSynth';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.getAdminOrders(params);
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load store orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleClearSearch = () => {
    setSearch('');
    loadOrders();
  };

  const handleOpenDetail = async (orderId) => {
    try {
      setModalLoading(true);
      sound.playPotionBubble();
      const res = await api.getAdminOrderDetails(orderId);
      if (res.success) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Compute live KPI metrics dynamically from real backend orders
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';

  const getStatusBadgeClass = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      case 'PROCESSING':
        return 'bg-blue-950/60 text-blue-300 border-blue-500/40';
      case 'PENDING':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'CANCELLED':
        return 'bg-red-950/60 text-red-300 border-red-500/40';
      default:
        return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Clean Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border-card)] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-900/30 border border-purple-500/40 text-purple-300">
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-black text-[var(--text-primary)]">
                  Customer Store Orders
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-pixel bg-purple-950 text-purple-300 border border-purple-500/30">
                  LEDGER
                </span>
              </div>
              <p className="text-xs font-serif text-[var(--text-muted)] mt-0.5">
                Authoritative record of orders submitted across the Customer Sanctuary with real-time stock deduction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Compact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI 1: Order Count */}
        <div className="pixel-card p-4 sm:p-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-serif font-bold text-[var(--text-muted)] block">
              Total Store Orders
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[var(--text-primary)]">
              {totalOrders}
            </div>
            <span className="text-[11px] font-sans text-purple-400 block">
              Logged in apothecary grimoire
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        {/* KPI 2: Gross Revenue */}
        <div className="pixel-card p-4 sm:p-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-serif font-bold text-[var(--text-muted)] block">
              Total Order Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">
              {totalRevenue.toFixed(2)} ₲
            </div>
            <span className="text-[11px] font-sans text-amber-300/80 block">
              Settled in gold galleons
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* KPI 3: Average Order Value */}
        <div className="pixel-card p-4 sm:p-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-serif font-bold text-[var(--text-muted)] block">
              Average Order Value (AOV)
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
              {averageOrderValue} ₲
            </div>
            <span className="text-[11px] font-sans text-emerald-300/80 block">
              Average debited per checkout
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

      </div>

      {/* 3. Search Field & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
        
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order # or Customer..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] focus:outline-none focus:border-purple-400"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Order Status Filter */}
        <div className="flex items-center gap-2 text-xs font-serif w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-[var(--text-muted)]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] text-xs font-serif text-[var(--text-primary)] focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            <option value="">All Statuses ({totalOrders})</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

      </div>

      {/* 4. Responsive Orders Table */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="font-serif text-xs text-purple-300">Summoning store orders from grimoire...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="pixel-card p-12 text-center rounded-2xl border border-dashed border-purple-500/30 space-y-2">
          <Package className="w-8 h-8 mx-auto text-purple-400 opacity-60" />
          <h3 className="font-serif font-black text-base text-[var(--text-primary)]">
            No customer orders matching query
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-serif">
            Try adjusting your search query or status filter to reveal transaction records.
          </p>
        </div>
      ) : (
        <div className="pixel-card rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-serif">
              <thead className="bg-purple-950/40 border-b border-purple-500/20 text-purple-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Order #</th>
                  <th className="py-3 px-4 font-bold">Customer Patron</th>
                  <th className="py-3 px-4 font-bold">Placed Date</th>
                  <th className="py-3 px-4 font-bold">Reagents</th>
                  <th className="py-3 px-4 font-bold">Total Debited</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-purple-900/15 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-300">
                      {o.order_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[var(--text-primary)]">{o.customer_name}</div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">{o.customer_email}</div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)] font-mono">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] font-mono">
                      {o.item_count || 1} items
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {parseFloat(o.total_amount).toFixed(2)} ₲
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-pixel border ${getStatusBadgeClass(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(o.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-[11px] font-serif transition-all inline-flex items-center gap-1.5 shadow-xs"
                        title={`Inspect Order #${o.order_number}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Order</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Detailed Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="pixel-card w-full max-w-lg rounded-2xl p-6 sm:p-8 bg-[var(--bg-card)] border border-purple-500/50 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-purple-500/30 text-purple-300 hover:text-white"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-pixel border ${getStatusBadgeClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <h2 className="text-xl font-serif font-black text-[var(--text-primary)] mt-1.5">
                Store Order #{selectedOrder.order_number}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-serif mt-0.5">
                Customer: <span className="font-bold text-[var(--text-primary)]">{selectedOrder.customer_name}</span> ({selectedOrder.customer_email})
              </p>
            </div>

            {/* Itemized Products */}
            <div className="border border-purple-500/30 rounded-xl overflow-hidden">
              <div className="bg-purple-950/40 px-3.5 py-2 text-[11px] font-serif font-bold text-purple-200 flex justify-between border-b border-purple-500/20">
                <span>Itemized Reagents</span>
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
                        SKU: {item.product_sku || 'HEX-POT'} • Unit: {item.unit_price} ₲
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-400">
                        {item.total_price} ₲
                      </div>
                      <div className="text-[10px] text-purple-300">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-1.5 text-xs font-serif">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span className="font-mono text-[var(--text-primary)]">{selectedOrder.subtotal} ₲</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Magical Tax (5%)</span>
                <span className="font-mono text-[var(--text-primary)]">{selectedOrder.tax_amount} ₲</span>
              </div>
              <div className="pt-2 border-t border-purple-500/20 flex justify-between font-bold text-sm text-[var(--text-primary)]">
                <span>Total Amount Debited</span>
                <span className="font-mono text-amber-400 font-bold">{selectedOrder.total_amount} Gold Coins</span>
              </div>
            </div>

            {/* Shipping Address & Incantation Notes */}
            <div className="space-y-2 text-xs font-serif">
              <div>
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Destination Realm
                </span>
                <p className="font-sans text-[var(--text-muted)] pl-5 mt-0.5">
                  {selectedOrder.shipping_address || 'Hallowmere Nocturnal Quarter'}
                </p>
              </div>
              {selectedOrder.notes && (
                <div>
                  <span className="font-bold text-purple-300">Customer Incantation Notes:</span>
                  <p className="font-sans text-[var(--text-muted)] pl-2 italic">
                    "{selectedOrder.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[var(--border-card)] flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-xs shadow-md transition-all"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
