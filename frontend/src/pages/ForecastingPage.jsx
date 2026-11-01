import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Sparkles, 
  Info,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import MagicalItemIcon from '../components/MagicalItemIcon';
import { sound } from '../utils/audioSynth';

export default function ForecastingPage({ 
  forecasts, 
  loading, 
  halloweenMultiplier = 1.0, 
  onMultiplierChange,
  onRestockItem 
}) {
  const [selectedProductId, setSelectedProductId] = useState(forecasts?.[0]?.product_id || 4); // Default to Fairy Wings
  const [forecastHorizon, setForecastHorizon] = useState(30); // 7 or 30

  if (loading || !forecasts || forecasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--color-orange)] border-t-transparent animate-spin" />
        <p className="font-pixel text-[11px] text-[var(--color-gold)] animate-pulse">
          COMPUTING PREDICTIVE CURVES...
        </p>
      </div>
    );
  }

  const activeForecast = forecasts.find(f => f.product_id === selectedProductId) || forecasts[0];

  const historicalData = (activeForecast.historical_recent || []).slice(-14).map(h => ({
    date: h.date.slice(5),
    actual: h.quantity,
    forecast: null,
    lower: null,
    upper: null
  }));

  const futureData = (activeForecast.projections_timeline || []).slice(0, forecastHorizon).map(f => ({
    date: f.date.slice(5),
    actual: null,
    forecast: f.predicted,
    lower: f.confidence_lower,
    upper: f.confidence_upper
  }));

  const chartData = [...historicalData, ...futureData];
  const formatGold = (val) => `${Number(val || 0).toLocaleString()} ₲`;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 lg:px-8 pt-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-orange)] font-pixel text-[10px] tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>AI DEMAND FORECASTING</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)] mt-1">
            Predictive Apothecary Demand
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
            Holt-Winters exponential smoothing combined with Halloween seasonal event multipliers.
          </p>
        </div>

        {/* Horizon Toggle */}
        <div className="flex items-center gap-2 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-card)] text-xs font-serif font-bold self-start sm:self-auto">
          <button
            onClick={() => {
              sound.playPotionBubble();
              setForecastHorizon(7);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              forecastHorizon === 7 ? 'bg-[var(--color-orange)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            7-Day Horizon
          </button>
          <button
            onClick={() => {
              sound.playPotionBubble();
              setForecastHorizon(30);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              forecastHorizon === 30 ? 'bg-[var(--color-orange)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            30-Day Horizon
          </button>
        </div>
      </div>

      {/* Halloween Multiplier Simulation Control Panel */}
      <div className="pixel-card p-5 border-[var(--color-orange)] space-y-4 bg-gradient-to-r from-[var(--bg-card)] via-amber-950/10 to-[var(--bg-card)] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-950/40 border border-orange-500/40 text-[var(--color-orange)]">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <span>Halloween Seasonal Demand Multiplier</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-orange)] text-white shadow-sm">
                  {halloweenMultiplier}x Factor
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
                Simulate surge conditions across All Hallows' Eve to stress-test stockouts and reorder quantities.
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {[
              { label: '1.0x Baseline', val: 1.0 },
              { label: '1.5x Spooky', val: 1.5 },
              { label: '2.0x Sabbat', val: 2.0 },
              { label: '3.0x Peak Spike', val: 3.0 }
            ].map(preset => (
              <button
                key={preset.val}
                type="button"
                onClick={() => {
                  sound.playCastSpell();
                  if (onMultiplierChange) onMultiplierChange(preset.val);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all ${
                  halloweenMultiplier === preset.val
                    ? 'bg-[var(--color-orange)] text-white shadow-md'
                    : 'bg-[var(--bg-primary)] border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multiplier Slider */}
        <div className="flex items-center gap-4 pt-1">
          <span className="text-xs font-mono text-[var(--text-muted)]">1.0x</span>
          <input
            type="range"
            min="1.0"
            max="3.0"
            step="0.1"
            value={halloweenMultiplier}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (onMultiplierChange) onMultiplierChange(val);
            }}
            className="flex-1 h-2 rounded-lg bg-[var(--bg-input)] accent-[var(--color-orange)] cursor-pointer"
          />
          <span className="text-xs font-mono text-[var(--color-orange)] font-bold">3.0x Peak</span>
        </div>
      </div>

      {/* Product Deep-Dive Selector */}
      <div className="pixel-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-serif font-bold text-xs text-[var(--color-gold)] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[var(--color-orange)]" />
            <span>Select Product to Inspect Predictive Telemetry:</span>
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            Viewing: <strong className="text-[var(--text-primary)]">{activeForecast.product_name}</strong>
          </span>
        </div>

        {/* Scrollable Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {forecasts.map((f) => {
            const isSelected = f.product_id === selectedProductId;
            return (
              <button
                key={f.product_id}
                onClick={() => {
                  sound.playPotionBubble();
                  setSelectedProductId(f.product_id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-serif font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[var(--color-orange)] text-white border-[var(--color-gold)] shadow-sm'
                    : 'bg-[var(--bg-primary)] border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[var(--color-orange)]'
                }`}
              >
                <MagicalItemIcon name={f.product_name} size={18} />
                <span>{f.product_name}</span>
                {f.is_halloween_surge && (
                  <Flame className="w-3 h-3 text-[var(--color-gold)]" title="Halloween Surge Item" />
                )}
                {f.predictions.stock_status === 'CRITICAL' && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-crimson)] animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Product Visual Chart & Decision Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Historical vs Forecast Chart */}
        <div className="lg:col-span-8 pixel-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <MagicalItemIcon name={activeForecast.product_name} size={30} />
                <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                  {activeForecast.product_name} — Historical vs {forecastHorizon}-Day Forecast
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
                Purple curve: actual 14-day history. Orange curve: AI forecast with 95% confidence intervals.
              </p>
            </div>

            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[var(--color-orange-subtle)] border border-[var(--color-orange)] text-[var(--color-orange)] font-bold self-start sm:self-auto">
              Surge: {activeForecast.metrics.seasonal_factor}x
            </span>
          </div>

          <div className="h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="forecastGradArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-orange)" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="var(--color-orange)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)', 
                    borderColor: 'var(--chart-tooltip-border)', 
                    borderRadius: '8px', 
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  name="Historical Sales (Actual)" 
                  stroke="var(--color-purple)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'var(--color-purple)' }} 
                />

                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  name={`AI Forecast (${forecastHorizon}d)`} 
                  stroke="var(--color-orange)" 
                  strokeWidth={2.5} 
                  strokeDasharray="4 4"
                  fill="url(#forecastGradArea)" 
                />

                <Line 
                  type="monotone" 
                  dataKey="upper" 
                  name="Upper 95% Bound" 
                  stroke="var(--color-gold)" 
                  strokeWidth={1} 
                  strokeDasharray="2 2"
                  dot={false}
                />

                <Line 
                  type="monotone" 
                  dataKey="lower" 
                  name="Lower 95% Bound" 
                  stroke="var(--color-gold)" 
                  strokeWidth={1} 
                  strokeDasharray="2 2"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-[var(--color-gold)] font-serif font-bold">
              <Info className="w-4 h-4 text-[var(--color-orange)]" />
              <span>Algorithmic Telemetry & Decomposition</span>
            </div>
            <p className="text-[var(--text-secondary)] font-sans leading-relaxed">
              {activeForecast.explanation}
            </p>
          </div>

        </div>

        {/* Right: Key Decision Metrics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="pixel-card p-6 space-y-4 border-[var(--border-strong)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
              <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
                Procurement Decision
              </h3>
              <span className={`text-[8px] font-pixel px-2 py-0.5 rounded border ${
                activeForecast.predictions.stock_status === 'CRITICAL' ? 'pixel-badge-critical' :
                activeForecast.predictions.stock_status === 'LOW_STOCK' ? 'pixel-badge-low' :
                activeForecast.predictions.stock_status === 'OVERSTOCKED' ? 'pixel-badge-overstock' : 'pixel-badge-healthy'
              }`}>
                {activeForecast.predictions.stock_status}
              </span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex justify-between items-center py-1 border-b border-[var(--border-card)]">
                <span className="text-[var(--text-secondary)]">Current Stock:</span>
                <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                  {activeForecast.current_stock} units
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[var(--border-card)]">
                <span className="text-[var(--text-secondary)]">Depletion Countdown:</span>
                <span className={`font-mono font-bold text-sm ${activeForecast.predictions.days_until_stockout <= 3 ? 'text-[var(--color-crimson)] animate-pulse' : 'text-[var(--text-primary)]'}`}>
                  {activeForecast.predictions.days_until_stockout <= 0 ? '0 (STOCKOUT)' : `${activeForecast.predictions.days_until_stockout} days`}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[var(--border-card)]">
                <span className="text-[var(--text-secondary)]">Reorder Point (ROP):</span>
                <span className="font-mono font-bold text-[var(--color-gold)]">
                  {activeForecast.predictions.reorder_point} units
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[var(--border-card)]">
                <span className="text-[var(--text-secondary)]">Safety Buffer (SS):</span>
                <span className="font-mono text-[var(--color-purple)]">
                  {activeForecast.predictions.safety_stock} units ({activeForecast.lead_time_days}d lead)
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[var(--border-card)]">
                <span className="text-[var(--text-secondary)]">Projected 30d Demand:</span>
                <span className="font-mono font-bold text-[var(--color-orange)]">
                  {activeForecast.predictions.predicted_30d_demand} units
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[var(--border-card)]">
                <span className="text-[var(--text-secondary)]">Suggested Order:</span>
                <span className="font-mono font-bold text-[var(--color-emerald)] text-sm">
                  +{activeForecast.predictions.suggested_reorder_qty} units
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--text-secondary)]">Est. Reorder Outlay:</span>
                <span className="font-mono font-bold text-[var(--color-gold)]">
                  {formatGold(activeForecast.predictions.estimated_reorder_cost)}
                </span>
              </div>
            </div>

            {activeForecast.predictions.suggested_reorder_qty > 0 ? (
              <button
                onClick={() => {
                  sound.playSparkle();
                  onRestockItem(activeForecast.product_id, activeForecast.predictions.suggested_reorder_qty);
                }}
                className="pixel-btn-primary w-full text-xs py-3"
              >
                <span>Order Suggested +{activeForecast.predictions.suggested_reorder_qty} Units</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[var(--color-emerald-subtle)] border border-[var(--color-emerald)] text-[var(--color-emerald)] text-center text-xs font-serif font-bold">
                Stock levels optimal. No reorder needed.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Complete Reorder Ledger (22 Items) */}
      <div className="pixel-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
              Complete Reorder & Demand Ledger (22 Canonical Items)
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-sans">
              Algorithmic calculations ensure zero stockouts during the Halloween rush.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--color-gold)] px-2.5 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-card)] self-start sm:self-auto">
            Method: Holt-Winters Smoothing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-card)] text-[var(--text-secondary)] font-serif font-bold">
              <tr>
                <th className="py-3 px-3">Item</th>
                <th className="py-3 px-3">Stock</th>
                <th className="py-3 px-3">7d Demand</th>
                <th className="py-3 px-3">30d Demand</th>
                <th className="py-3 px-3">Surge</th>
                <th className="py-3 px-3">ROP</th>
                <th className="py-3 px-3">Days Left</th>
                <th className="py-3 px-3">Suggested Order</th>
                <th className="py-3 px-3">Est. Cost</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-card)]">
              {forecasts.map((f) => {
                const isCritical = f.predictions.stock_status === 'CRITICAL' || f.predictions.stock_status === 'OUT_OF_STOCK';
                return (
                  <tr 
                    key={f.product_id}
                    className={`hover:bg-[var(--color-purple-subtle)] transition-colors ${isCritical ? 'bg-[var(--color-crimson-subtle)]' : ''}`}
                  >
                    <td className="py-3 px-3 flex items-center gap-2.5">
                      <MagicalItemIcon name={f.product_name} size={28} />
                      <div>
                        <div className="font-serif font-bold text-[var(--text-primary)] text-sm">{f.product_name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{f.category_name}</div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-[var(--text-primary)]">
                      {f.current_stock}
                    </td>

                    <td className="py-3 px-3 font-mono text-[var(--color-orange)]">
                      {f.predictions.predicted_7d_demand}
                    </td>

                    <td className="py-3 px-3 font-mono text-[var(--color-orange)] font-bold">
                      {f.predictions.predicted_30d_demand}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${f.is_halloween_surge ? 'bg-[var(--color-orange-subtle)] text-[var(--color-orange)] font-bold' : 'text-[var(--text-muted)]'}`}>
                        {f.metrics.seasonal_factor}x
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[var(--color-gold)] font-bold">
                      {f.predictions.reorder_point}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className={`font-bold ${f.predictions.days_until_stockout <= 3 ? 'text-[var(--color-crimson)]' : 'text-[var(--text-primary)]'}`}>
                        {f.predictions.days_until_stockout <= 0 ? '0d' : `${f.predictions.days_until_stockout}d`}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {f.predictions.suggested_reorder_qty > 0 ? (
                        <span className="text-[var(--color-emerald)] font-bold">
                          +{f.predictions.suggested_reorder_qty}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-[var(--color-gold)]">
                      {f.predictions.estimated_reorder_cost > 0 ? formatGold(f.predictions.estimated_reorder_cost) : '—'}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {f.predictions.suggested_reorder_qty > 0 ? (
                        <button
                          onClick={() => {
                            sound.playSparkle();
                            onRestockItem(f.product_id, f.predictions.suggested_reorder_qty);
                          }}
                          className="px-2.5 py-1 rounded bg-[var(--color-orange-subtle)] hover:bg-[var(--color-orange)] text-[var(--color-orange)] hover:text-white border border-[var(--color-orange)] text-[11px] font-serif font-bold transition-all"
                        >
                          Restock
                        </button>
                      ) : (
                        <span className="text-[11px] text-[var(--color-emerald)] font-serif font-bold">Optimal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
