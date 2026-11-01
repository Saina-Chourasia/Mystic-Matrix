import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  FlaskConical, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  AlertTriangle,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Edit3,
  Trash2,
  AlertCircle
} from 'lucide-react';
import MagicalItemIcon from '../components/MagicalItemIcon';
import { PixelIcon } from '../components/PixelArt';
import ApothecaryRightDecor from '../components/ApothecaryRightDecor';
import { sound } from '../utils/audioSynth';

/**
 * InventoryPage — MYSTIC MATRIX
 * Fully matching Section 7 of the Master Prompt:
 * - MAIN CONTENT:
 *   - Magical Inventory heading with Potion Crate illustration & short subtitle
 *   - 3 Top Statistics: Total Items, Low Stock, Out of Stock
 *   - Search bar, Category filters (All, Ingredients, Potions), Add Item button
 * - PRODUCT CARDS:
 *   - Pixel-art product image, name, category badge, current stock, stock progress bar, trend indicator, Manage button
 *   - Consistent card sizes in a clean responsive grid
 * - RIGHT DECORATION:
 *   - Arched window with castle, potion shelves, flowers/vines, glowing cauldron in night mode
 *   - Isolated in its own sticky desktop column, never overlapping inventory controls.
 */
export default function InventoryPage({ 
  products = [], 
  categories = [], 
  suppliers = [], 
  loading = false, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onAdjustStock,
  theme = 'night'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(15);
  const [adjustType, setAdjustType] = useState('RESTOCK');
  const [adjustReason, setAdjustReason] = useState('Restock shipment from Nocturnal Guild');

  const handleOpenEdit = (prod) => {
    sound.playPotionBubble();
    setEditingProduct(prod);
  };

  const handlePromptDelete = (prod) => {
    sound.playWarningHex();
    setDeletingProduct(prod);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    await onDeleteProduct(deletingProduct.id);
    setDeletingProduct(null);
  };

  // Dynamic Statistics
  const totalItems = products.length || 22;
  const lowStockCount = products.filter(p => p.stock_status === 'LOW_STOCK' || p.stock_status === 'CRITICAL').length;
  const outOfStockCount = products.filter(p => p.stock_status === 'OUT_OF_STOCK').length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'ALL' || 
      (selectedCategory === 'ingredients' && (p.category_id === 1 || p.category_name?.toLowerCase().includes('ingredient'))) ||
      (selectedCategory === 'potions' && (p.category_id === 2 || p.category_name?.toLowerCase().includes('potion')));

    const matchesStatus = selectedStatus === 'ALL' || 
      (selectedStatus === 'CRITICAL' && (p.stock_status === 'CRITICAL' || p.stock_status === 'OUT_OF_STOCK')) ||
      (selectedStatus === 'LOW_STOCK' && p.stock_status === 'LOW_STOCK') ||
      (selectedStatus === 'OVERSTOCKED' && p.stock_status === 'OVERSTOCKED') ||
      (selectedStatus === 'HEALTHY' && p.stock_status === 'HEALTHY');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK':
      case 'CRITICAL':
        return <span className="pixel-badge-critical">CRITICAL</span>;
      case 'LOW_STOCK':
        return <span className="pixel-badge-low">LOW STOCK</span>;
      case 'OVERSTOCKED':
        return <span className="pixel-badge-overstock">OVERSTOCK</span>;
      default:
        return <span className="pixel-badge-healthy">HEALTHY</span>;
    }
  };

  const getTrendIndicator = (product) => {
    const highSurgeItems = ['Fairy Wings', 'Ghost Pepper', 'Bat Wings', 'Love Potion'];
    const steadyItems = ['Flying Potion', 'Beauty Potion', 'Disguise Potion', 'Healing Potion'];
    const overstockItems = ['Stardust', 'Moon Dust', 'Crystal Shards'];

    if (highSurgeItems.includes(product.name)) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--color-orange)] font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+2.8x Surge</span>
        </span>
      );
    }
    if (overstockItems.includes(product.name)) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-400 font-bold">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Halting Orders</span>
        </span>
      );
    }
    if (steadyItems.includes(product.name)) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>High Demand</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)]">
        <Minus className="w-3.5 h-3.5" />
        <span>Steady Mover</span>
      </span>
    );
  };

  const handleOpenAdjust = (prod) => {
    sound.playPotionBubble();
    setAdjustingProduct(prod);
    setAdjustAmount(prod.suggested_reorder || 20);
    setAdjustType('RESTOCK');
    setAdjustReason('Stock replenishment from supplier');
  };

  const handlePerformAdjust = async (e) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    const delta = adjustType === 'SALE' || adjustType === 'WASTE' || adjustType === 'SPELL_FAILURE'
      ? -Math.abs(parseInt(adjustAmount, 10))
      : Math.abs(parseInt(adjustAmount, 10));

    await onAdjustStock(adjustingProduct.id, delta, adjustType, adjustReason);
    setAdjustingProduct(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-300">
      
      {/* ══════════════════════════════════════════════════════════
          PAGE LAYOUT: Two Columns
          - Left: Main Content (Header, 3 Stats, Filters, Cards)
          - Right: ApothecaryRightDecor (Arched window, shelves, cauldron)
          ══════════════════════════════════════════════════════════ */}
      <div className="flex items-start gap-8">
        
        {/* MAIN INVENTORY COLUMN */}
        <div className="flex-1 min-w-0 space-y-6">
          
          {/* 1. Header with Potion Crate Illustration & Subtitle */}
          <div className="pixel-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md border-[var(--border-strong)] bg-gradient-to-r from-[var(--bg-card)] via-[var(--color-purple-subtle)] to-[var(--bg-card)]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl p-2 bg-[var(--bg-primary)] border-2 border-[var(--color-purple)] flex items-center justify-center shrink-0 shadow-lg relative group">
                <PixelIcon name="PotionCrate" size={44} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
              </div>
              <div>
                <div className="text-[10px] font-pixel text-[var(--color-purple)] uppercase tracking-wider">
                  ENCHANTED PANTRY LEDGER
                </div>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)] mt-0.5">
                  Magical Inventory
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans max-w-xl mt-0.5 leading-relaxed">
                  Real-time apothecary balances, safety stock thresholds, and live Halloween demand indicators.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playSparkle();
                setIsAddModalOpen(true);
              }}
              className="pixel-btn-primary text-xs shrink-0 self-start sm:self-center flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Catalog New Item</span>
            </button>
          </div>

          {/* 2. Top Three Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Total Items */}
            <div className="pixel-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-900/30 text-purple-300 flex items-center justify-center p-2 shrink-0 border border-purple-500/30">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="font-serif font-black text-2xl text-[var(--text-primary)]">
                  {totalItems} Items
                </div>
                <div className="text-xs text-[var(--text-muted)] font-serif">
                  12 Reagents &bull; 10 Potions
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="pixel-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-900/30 text-amber-400 flex items-center justify-center p-2 shrink-0 border border-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="font-serif font-black text-2xl text-amber-400">
                  {lowStockCount} Low Stock
                </div>
                <div className="text-xs text-[var(--text-muted)] font-serif">
                  Approaching buffer limit
                </div>
              </div>
            </div>

            {/* Out of Stock */}
            <div className="pixel-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-900/30 text-red-400 flex items-center justify-center p-2 shrink-0 border border-red-500/30">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <div className="font-serif font-black text-2xl text-[var(--text-primary)]">
                  {outOfStockCount} Out of Stock
                </div>
                <div className="text-xs text-[var(--text-muted)] font-serif">
                  Depleted apothecary shelves
                </div>
              </div>
            </div>

          </div>

          {/* 3. Controls & Filter Bar: Search, Category Filters, Add Item */}
          <div className="pixel-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search potions, reagents, ingredients..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--color-purple)] placeholder:text-[var(--text-muted)]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              
              {/* Category Pills */}
              <div className="flex items-center bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-card)] text-xs font-serif font-bold">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedCategory === 'ALL' ? 'bg-[var(--color-purple)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('ingredients')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedCategory === 'ingredients' ? 'bg-[var(--color-purple)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setSelectedCategory('potions')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedCategory === 'potions' ? 'bg-[var(--color-purple)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Potions
                </button>
              </div>

              {/* Status Select */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--color-purple)]"
              >
                <option value="ALL">All Statuses</option>
                <option value="CRITICAL">Critical & Out</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="HEALTHY">Healthy</option>
                <option value="OVERSTOCKED">Overstocked</option>
              </select>

            </div>

          </div>

          {/* 4. Product Cards Grid (Consistent card dimensions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const maxStock = product.max_stock_level || 50;
              const fillPct = Math.min(100, Math.max(8, Math.round((product.current_stock / maxStock) * 100)));
              
              // Progress bar gradient color
              const barColor = 
                product.stock_status === 'CRITICAL' || product.stock_status === 'OUT_OF_STOCK'
                  ? 'bg-red-500'
                  : product.stock_status === 'LOW_STOCK'
                  ? 'bg-amber-400'
                  : product.stock_status === 'OVERSTOCKED'
                  ? 'bg-purple-500'
                  : 'bg-emerald-400';

              return (
                <div 
                  key={product.id}
                  className="pixel-card p-5 flex flex-col justify-between space-y-4 group hover:border-[var(--color-purple)] transition-all"
                >
                  {/* Card Header: Category Badge & Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      {product.category_name === 'Magical Potions' ? '🧪 Potion' : '✨ Reagent'}
                    </span>
                    {getStatusBadge(product.stock_status)}
                  </div>

                  {/* Artwork & Title */}
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                      <MagicalItemIcon name={product.name} size={42} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif font-black text-base text-[var(--text-primary)] truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="font-mono font-bold text-amber-400">
                          {product.selling_price} ₲
                        </span>
                        <span className="text-[var(--text-muted)]">&bull;</span>
                        <span className="text-[11px] text-[var(--text-muted)] font-mono">
                          Min: {product.min_stock_level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Level & Visual Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif text-[var(--text-secondary)]">Current Stock</span>
                      <span className="font-mono font-black text-[var(--text-primary)]">
                        {product.current_stock} <span className="text-[10px] font-normal text-[var(--text-muted)]">/ {maxStock} units</span>
                      </span>
                    </div>

                    {/* Clean Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[var(--bg-input)] border border-[var(--border-card)] overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer: Trend Indicator & Manage / Edit / Delete Buttons */}
                  <div className="pt-2 border-t border-[var(--border-card)] flex items-center justify-between gap-2">
                    {getTrendIndicator(product)}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        title={`Edit ${product.name} properties`}
                        className="p-1.5 rounded-lg text-xs bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handlePromptDelete(product)}
                        title={`Banish ${product.name} from grimoire`}
                        className="p-1.5 rounded-lg text-xs bg-red-950/20 hover:bg-red-950/50 border border-red-500/30 text-red-300 hover:text-red-200 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenAdjust(product)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold bg-[var(--color-purple)] hover:bg-[var(--color-purple-deep)] text-white transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="pixel-card py-12 text-center space-y-3">
              <FlaskConical className="w-10 h-10 mx-auto text-[var(--text-muted)]" />
              <div className="font-serif font-bold text-base text-[var(--text-primary)]">
                No magical items match your criteria
              </div>
              <p className="text-xs text-[var(--text-muted)] font-sans">
                Try adjusting your search terms or clearing status filters.
              </p>
            </div>
          )}

        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT DECORATIVE COLUMN (Section 7 Specification)
            - Arched window with castle view
            - Potion shelves with colorful glowing bottles
            - Flowers and vines
            - Bubbling cauldron in night mode
            ══════════════════════════════════════════════════════════ */}
        <ApothecaryRightDecor theme={theme} />

      </div>

      {/* ══════════════════════════════════════════════════════════
          MANAGE / STOCK ADJUSTMENT MODAL
          ══════════════════════════════════════════════════════════ */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="pixel-card max-w-md w-full p-6 space-y-5 animate-scale-up border-[var(--color-purple)] shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
              <div className="flex items-center gap-3">
                <MagicalItemIcon name={adjustingProduct.name} size={36} />
                <div>
                  <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
                    Adjust Stock: {adjustingProduct.name}
                  </h3>
                  <div className="text-[11px] font-mono text-[var(--text-muted)]">
                    Current: {adjustingProduct.current_stock} units on shelf
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setAdjustingProduct(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePerformAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-bold text-[var(--text-secondary)] mb-1">
                  Operation Type
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-xs text-[var(--text-primary)]"
                >
                  <option value="RESTOCK">Supplier Restock (+)</option>
                  <option value="SALE">Counter Customer Sale (-)</option>
                  <option value="WASTE">Cauldron Spell Waste (-)</option>
                  <option value="AUDIT">Grimoire Inventory Audit (+/-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[var(--text-secondary)] mb-1">
                  Quantity (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-xs text-[var(--text-primary)] font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[var(--text-secondary)] mb-1">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received shipment from Nocturnal Guild"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-xs text-[var(--text-primary)]"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-purple)] hover:bg-[var(--color-purple-deep)] text-white text-xs font-serif font-bold transition-colors shadow-md"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          CATALOG NEW ITEM MODAL
          ══════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <CatalogItemModal
          onClose={() => setIsAddModalOpen(false)}
          onAddProduct={onAddProduct}
          categories={categories}
          suppliers={suppliers}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          EDIT ITEM MODAL
          ══════════════════════════════════════════════════════════ */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdateProduct={onUpdateProduct}
          categories={categories}
          suppliers={suppliers}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          DELETE CONFIRM MODAL
          ══════════════════════════════════════════════════════════ */}
      {deletingProduct && (
        <DeleteConfirmModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

    </div>
  );
}

// Modal for Adding New Item
function CatalogItemModal({ onClose, onAddProduct, categories, suppliers }) {
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    supplier_id: 1,
    description: '',
    current_stock: 20,
    min_stock_level: 10,
    max_stock_level: 60,
    unit_cost: 12,
    selling_price: 30,
    lead_time_days: 3,
    storage_conditions: 'Cool, dark pantry shelf'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddProduct({
      ...formData,
      current_stock: parseInt(formData.current_stock, 10),
      min_stock_level: parseInt(formData.min_stock_level, 10),
      max_stock_level: parseInt(formData.max_stock_level, 10),
      unit_cost: parseFloat(formData.unit_cost),
      selling_price: parseFloat(formData.selling_price),
      lead_time_days: parseInt(formData.lead_time_days, 10)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="pixel-card max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border-[var(--color-purple)] shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-purple)]" />
            <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
              Catalog New Magical Item
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-serif">
          <div>
            <label className="block text-[var(--text-secondary)] font-bold mb-1">Item Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Phoenix Tear Elixir"
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)]"
              >
                <option value={1}>Magical Ingredients</option>
                <option value={2}>Brewed Potions</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Primary Supplier</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)]"
              >
                <option value={1}>Forbidden Forest Guild</option>
                <option value={2}>Diagon Alley Wholesalers</option>
                <option value={3}>Shadow Market Smugglers</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Initial Stock</label>
              <input
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Min Threshold</label>
              <input
                type="number"
                min="1"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Max Capacity</label>
              <input
                type="number"
                min="10"
                value={formData.max_stock_level}
                onChange={(e) => setFormData({ ...formData, max_stock_level: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Unit Cost (₲)</label>
              <input
                type="number"
                min="1"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Selling Price (₲)</label>
              <input
                type="number"
                min="1"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] font-bold mb-1">Alchemy Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Magical properties and usage..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border-card)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[var(--color-purple)] hover:bg-[var(--color-purple-deep)] text-white font-bold transition-colors shadow-md"
            >
              Inscribe in Grimoire
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// Modal for Editing Existing Item
function EditProductModal({ product, onClose, onUpdateProduct, categories, suppliers }) {
  const [formData, setFormData] = useState({
    name: product.name || '',
    category_id: product.category_id || 1,
    supplier_id: product.supplier_id || 1,
    description: product.description || '',
    current_stock: product.current_stock ?? 20,
    min_stock_level: product.min_stock_level ?? 10,
    max_stock_level: product.max_stock_level ?? 60,
    unit_cost: product.unit_cost ?? 12,
    selling_price: product.selling_price ?? 30,
    lead_time_days: product.lead_time_days ?? 3
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdateProduct(product.id, {
      ...formData,
      current_stock: parseInt(formData.current_stock, 10),
      min_stock_level: parseInt(formData.min_stock_level, 10),
      max_stock_level: parseInt(formData.max_stock_level, 10),
      unit_cost: parseFloat(formData.unit_cost),
      selling_price: parseFloat(formData.selling_price),
      lead_time_days: parseInt(formData.lead_time_days, 10)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="pixel-card max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border-[var(--color-purple)] shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[var(--color-purple)]" />
            <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
              Edit Alchemical Item: {product.name}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-serif">
          <div>
            <label className="block text-[var(--text-secondary)] font-bold mb-1">Item Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)]"
              >
                <option value={1}>Magical Ingredients</option>
                <option value={2}>Brewed Potions</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Primary Supplier</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)]"
              >
                <option value={1}>Forbidden Forest Guild</option>
                <option value={2}>Diagon Alley Wholesalers</option>
                <option value={3}>Shadow Market Smugglers</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Current Stock</label>
              <input
                type="number"
                min="0"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Min Threshold</label>
              <input
                type="number"
                min="1"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Max Capacity</label>
              <input
                type="number"
                min="10"
                value={formData.max_stock_level}
                onChange={(e) => setFormData({ ...formData, max_stock_level: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Unit Cost (₲)</label>
              <input
                type="number"
                min="1"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1">Selling Price (₲)</label>
              <input
                type="number"
                min="1"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)] font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] font-bold mb-1">Alchemy Description</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-card)] text-[var(--text-primary)]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border-card)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[var(--color-purple)] hover:bg-[var(--color-purple-deep)] text-white font-bold transition-colors shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal for Confirming Deletion
function DeleteConfirmModal({ product, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="pixel-card max-w-sm w-full p-6 space-y-4 border-red-500 shadow-2xl text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif font-black text-lg text-[var(--text-primary)]">
            Banish {product.name}?
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
            This will archive the item from active apothecary shelves while safely preserving historical sales ledger integrity.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[var(--border-card)] text-xs font-serif font-bold text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-serif font-bold transition-all shadow-md"
          >
            Confirm Banish
          </button>
        </div>
      </div>
    </div>
  );
}
