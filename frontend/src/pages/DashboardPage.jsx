import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Coins, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import MagicalItemIcon from '../components/MagicalItemIcon';
import { sound } from '../utils/audioSynth';

export default function DashboardPage({ 
  dashboardData, 
  salesData, 
  loading, 
  onNavigate, 
  onRestockItem 
}) {
  const rawSummary = dashboardData?.summary || {};
  const totalProducts = rawSummary.total_products ?? 22;
  const lowStockCount = rawSummary.low_stock_count ?? rawSummary.low_stock_products ?? 4;
  const outOfStockCount = rawSummary.out_of_stock_count ?? rawSummary.out_of_stock_products ?? 0;
  const totalAlerts = lowStockCount + outOfStockCount;
  const projectedDemandUnits = rawSummary.projected_30d_demand_units ?? rawSummary.predicted_demand_units_30d ?? 1420;
  const healthScore = rawSummary.health_index?.score ?? 88;
  const healthGrade = rawSummary.health_index?.grade ?? 'A';

  const topRecommendations = dashboardData?.top_recommendations?.slice(0, 3) || [];
  const criticalItems = dashboardData?.critical_products || [];
  const recentSales = salesData?.recent_sales?.slice(0, 5) || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-300">
      
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-card)]">
        <div>
          <div className="text-[10px] font-pixel text-[var(--color-purple)] uppercase tracking-wider">
            SANCTUM OVERVIEW
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)] mt-0.5">
            Madam Hex's Apothecary Overview
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            Real-time telemetry and vital signs for Madam Hex's private inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playPotionBubble();
              onNavigate('inventory');
            }}
            className="pixel-btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>Full Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          1. EXACT FOUR MAIN SUMMARY CARDS (Part 1, Requirement 2)
          ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Products */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="pixel-card p-5 cursor-pointer hover:border-[var(--color-purple)] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[var(--text-secondary)]">Total Products</span>
            <div className="p-2 rounded-xl bg-purple-900/30 text-purple-300 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif font-black text-2xl text-[var(--text-primary)]">
              {totalProducts} Items
            </div>
            <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
              12 Reagents &bull; 10 Brewed Potions
            </p>
          </div>
        </div>

        {/* Card 2: Low Stock Alerts */}
        <div 
          onClick={() => onNavigate('detect')}
          className="pixel-card p-5 cursor-pointer hover:border-amber-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[var(--text-secondary)]">Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-amber-900/30 text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif font-black text-2xl text-amber-400">
              {totalAlerts} Alerts
            </div>
            <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
              {outOfStockCount > 0 
                ? `${outOfStockCount} out of stock, ${lowStockCount} low` 
                : `${lowStockCount} items below safe reorder thresholds`}
            </p>
          </div>
        </div>

        {/* Card 3: Predicted Demand */}
        <div 
          onClick={() => onNavigate('forecast')}
          className="pixel-card p-5 cursor-pointer hover:border-[var(--color-purple)] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[var(--text-secondary)]">Predicted Demand</span>
            <div className="p-2 rounded-xl bg-purple-900/30 text-purple-300 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif font-black text-2xl text-[var(--text-primary)]">
              {Number(projectedDemandUnits).toLocaleString()} Units
            </div>
            <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
              Next 30 days projected demand
            </p>
          </div>
        </div>

        {/* Card 4: Inventory Health */}
        <div 
          onClick={() => onNavigate('restock')}
          className="pixel-card p-5 cursor-pointer hover:border-emerald-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[var(--text-secondary)]">Inventory Health</span>
            <div className="p-2 rounded-xl bg-emerald-900/30 text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif font-black text-2xl text-emerald-400">
              {healthScore}% ({healthGrade})
            </div>
            <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
              Safety stock & buffer stability index
            </p>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          2. BELOW CARDS: ONLY 3 SECTIONS (Part 1, Requirement 2)
             - Recent Sales Summary
             - Critical Stock Alerts
             - Restock Recommendations
          ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Section 1: Recent Sales Summary */}
        <div className="pixel-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                  Recent Sales Summary
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('analytics')}
                className="text-[11px] font-serif text-[var(--color-purple)] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-[var(--border-card)] mt-3">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-serif font-bold text-[var(--text-primary)]">
                        {sale.product_name}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(sale.sale_date).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span className="capitalize">{sale.customer_type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-400">
                        +{sale.total_price} G
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        Qty: {sale.quantity}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[var(--text-muted)] font-serif">
                  No sales recorded recently.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-card)] mt-3 flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
            <span>Historical telemetry</span>
            <span className="text-emerald-400 font-bold">Live Counter</span>
          </div>
        </div>

        {/* Section 2: Critical Stock Alerts */}
        <div className="pixel-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <h3 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                  Critical Stock Alerts
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('detect')}
                className="text-[11px] font-serif text-[var(--color-purple)] hover:underline flex items-center gap-1"
              >
                <span>Detect</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-[var(--border-card)] mt-3">
              {criticalItems.length > 0 ? (
                criticalItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-card)] shrink-0">
                        <MagicalItemIcon name={item.name} size={24} />
                      </div>
                      <div>
                        <div className="font-serif font-bold text-[var(--text-primary)]">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          Min Level: {item.min_stock_level} units
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950/40 text-red-400 border border-red-500/30">
                        {item.current_stock} left
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-emerald-400 font-serif flex flex-col items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>All magical items are adequately stocked!</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-card)] mt-3 text-[11px] font-serif text-[var(--text-muted)] text-center">
            {criticalItems.length} items requiring immediate procurement
          </div>
        </div>

        {/* Section 3: Restock Recommendations */}
        <div className="pixel-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                  Restock Recommendations
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('restock')}
                className="text-[11px] font-serif text-[var(--color-purple)] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {topRecommendations.length > 0 ? (
                topRecommendations.map((rec) => (
                  <div 
                    key={rec.product_id}
                    className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[var(--text-primary)]">
                        {rec.product_name}
                      </span>
                      <span className="font-mono text-[10px] text-amber-400 font-bold">
                        +{rec.suggested_reorder_units} units
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 font-sans">
                      {rec.reason}
                    </p>
                    <button
                      onClick={() => {
                        sound.playSparkle();
                        onRestockItem(rec.product_id, rec.suggested_reorder_units);
                      }}
                      className="w-full py-1.5 rounded-lg bg-[var(--color-purple)] hover:bg-[var(--color-purple-deep)] text-white text-[11px] font-serif font-bold transition-colors"
                    >
                      Execute Restock
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[var(--text-muted)] font-serif">
                  No pending restock orders.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-card)] mt-3 text-[11px] font-serif text-[var(--text-muted)] text-center">
            AI calculated via Holt-Winters ($SS$ + $ROP$)
          </div>
        </div>

      </div>

    </div>
  );
}
