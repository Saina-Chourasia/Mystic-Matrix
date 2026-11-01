import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Coins, 
  ShoppingBag, 
  Users, 
  PlusCircle, 
  Sparkles 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import MagicalItemIcon from '../components/MagicalItemIcon';
import { sound } from '../utils/audioSynth';

export default function SalesAnalyticsPage({ 
  salesData, 
  loading, 
  timeframe = 30,
  onTimeframeChange,
  onOpenSaleModal 
}) {
  if (loading || !salesData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--color-orange)] border-t-transparent animate-spin" />
        <p className="font-pixel text-[11px] text-[var(--color-gold)] animate-pulse">
          AUDITING SALES LEDGER...
        </p>
      </div>
    );
  }

  const { timeline, top_sellers, categories } = salesData;

  const totalRevenue = (timeline || []).reduce((acc, curr) => acc + (curr.total_revenue || 0), 0);
  const totalUnits = (timeline || []).reduce((acc, curr) => acc + (curr.total_quantity || 0), 0);
  const totalOrders = (timeline || []).reduce((acc, curr) => acc + (curr.transaction_count || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const formatGold = (val) => `${Number(val || 0).toLocaleString()} ₲`;

  const customerTypesData = [
    { name: 'Witches', count: 320, color: '#FF6B2B' },
    { name: 'Wizards', count: 285, color: '#9D4EDD' },
    { name: 'Warlocks', count: 180, color: '#F5BA42' },
    { name: 'Necromancers', count: 145, color: '#EF4444' },
    { name: 'Alchemists', count: 125, color: '#00F5D4' },
    { name: 'Fairies', count: 62, color: '#F472B6' }
  ];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 lg:px-8 pt-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-orange)] font-pixel text-[10px] tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>FINANCIAL INTELLIGENCE</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)] mt-1">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
            Audit of daily customer transactions, buyer demographics, and item profitability.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playSparkle();
            onOpenSaleModal();
          }}
          className="pixel-btn-primary text-xs self-start sm:self-auto flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Counter Sale</span>
        </button>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="pixel-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-serif font-bold">
            <span>Gross Revenue (30d)</span>
            <Coins className="w-4 h-4 text-[var(--color-gold)]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[var(--color-gold)]">
            {formatGold(totalRevenue)}
          </div>
          <div className="text-[11px] text-[var(--color-emerald)] font-sans">
            +48% Halloween spike vs August
          </div>
        </div>

        <div className="pixel-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-serif font-bold">
            <span>Units Dispensed</span>
            <ShoppingBag className="w-4 h-4 text-[var(--color-orange)]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[var(--color-orange)]">
            {totalUnits.toLocaleString()} units
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-sans">
            Across 22 reagents & brews
          </div>
        </div>

        <div className="pixel-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-serif font-bold">
            <span>Customer Orders</span>
            <Users className="w-4 h-4 text-[var(--color-purple)]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[var(--color-purple)]">
            {totalOrders.toLocaleString()} orders
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-sans">
            Avg. {Math.round(totalUnits / (totalOrders || 1))} items per order
          </div>
        </div>

        <div className="pixel-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-serif font-bold">
            <span>Average Basket Size</span>
            <TrendingUp className="w-4 h-4 text-[var(--color-emerald)]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[var(--color-emerald)]">
            {formatGold(avgOrderValue)}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-sans">
            High potion contribution
          </div>
        </div>

      </div>

      {/* Main Revenue Timeline Chart */}
      <div className="pixel-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
              Daily Apothecary Revenue (Gold Galleons)
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-sans">
              Timeline illustrating accelerating seasonal customer volume.
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] text-xs font-serif font-bold">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  sound.playPotionBubble();
                  if (onTimeframeChange) onTimeframeChange(d);
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeframe === d
                    ? 'bg-[var(--color-gold)] text-purple-950 font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="salesGradArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--color-orange)" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="sale_date" 
                stroke="var(--text-muted)" 
                fontSize={10} 
                tickFormatter={(val) => val.slice(5)} 
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={10} 
                tickFormatter={(val) => `${val}₲`} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--chart-tooltip-bg)', 
                  borderColor: 'var(--chart-tooltip-border)', 
                  borderRadius: '8px', 
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
                formatter={(val) => [`${val} Gold Galleons`, 'Daily Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="total_revenue" 
                stroke="var(--color-gold)" 
                strokeWidth={2.5} 
                fill="url(#salesGradArea)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column: Top Bestsellers with Profit & Customer Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Top Bestsellers */}
        <div className="lg:col-span-7 pixel-card p-6 space-y-4">
          <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
            Product Profitability Breakdown
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            Net profit calculated as $(Price - Unit Cost) \times Quantity Sold$.
          </p>

          <div className="space-y-3 pt-2">
            {top_sellers?.map((prod) => (
              <div 
                key={prod.id}
                className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] flex items-center justify-between gap-4 hover:border-[var(--color-gold)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MagicalItemIcon name={prod.name} size={30} />
                  <div>
                    <div className="font-serif font-bold text-sm text-[var(--text-primary)]">{prod.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">{prod.category_name} • {prod.total_units_sold} units</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-[var(--color-gold)]">
                    {formatGold(prod.total_revenue)}
                  </div>
                  <div className="text-[11px] text-[var(--color-emerald)] font-mono font-bold">
                    Net: {formatGold(prod.estimated_profit)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Demographics */}
        <div className="lg:col-span-5 pixel-card p-6 space-y-4">
          <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
            Customer Demographics Cohort
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            Distribution of patrons purchasing at Madam Hex's counter.
          </p>

          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {customerTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)', 
                    borderColor: 'var(--chart-tooltip-border)', 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-sans pt-2 border-t border-[var(--border-card)]">
            {customerTypesData.map((cust) => (
              <div key={cust.name} className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-primary)] border border-[var(--border-card)]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cust.color }} />
                  <span className="text-[var(--text-secondary)] font-serif">{cust.name}</span>
                </div>
                <span className="font-mono font-bold text-[var(--text-primary)]">{cust.count}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
