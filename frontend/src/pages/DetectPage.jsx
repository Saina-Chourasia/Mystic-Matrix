import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, PackageX, Sparkles, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import MagicalItemIcon from '../components/MagicalItemIcon';
import { sound } from '../utils/audioSynth';

export default function DetectPage({ products = [], forecasts = [], onRestockItem }) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'STOCKOUT' | 'OVERSTOCK'

  // Items with low or zero stock (Stockout Risk)
  const stockoutItems = products.filter(p => 
    p.stock_status === 'CRITICAL' || p.stock_status === 'OUT_OF_STOCK' || p.stock_status === 'LOW_STOCK'
  );

  // Items with excessive inventory (Overstock Risk)
  const overstockItems = products.filter(p => 
    p.stock_status === 'OVERSTOCKED' || p.current_stock > p.max_stock_level * 0.85
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-card)]">
        <div>
          <div className="text-[10px] font-pixel text-red-400 uppercase tracking-wider">
            ANOMALY DETECTION SYSTEM
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)] mt-0.5">
            Stockout & Overstock Detection
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            Automated boundary detection identifying stockout vulnerabilities and trapped overstock capital.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] text-xs font-serif font-bold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterType === 'ALL' ? 'bg-[var(--color-purple)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Anomaly Types
          </button>
          <button
            onClick={() => setFilterType('STOCKOUT')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterType === 'STOCKOUT' ? 'bg-red-500 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Stockouts ({stockoutItems.length})
          </button>
          <button
            onClick={() => setFilterType('OVERSTOCK')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterType === 'OVERSTOCK' ? 'bg-amber-500 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Overstock ({overstockItems.length})
          </button>
        </div>
      </div>

      {/* Stockout Risk Section */}
      {(filterType === 'ALL' || filterType === 'STOCKOUT') && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                Imminent Stockout Vulnerabilities
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-sans">
                Items predicted to exhaust before the next supplier delivery cycle.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockoutItems.map((item) => (
              <div 
                key={item.id}
                className="pixel-card p-5 border-red-500/40 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-red-400 uppercase font-bold">
                      {item.stock_status}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      Min: {item.min_stock_level} units
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] shrink-0">
                      <MagicalItemIcon name={item.name} size={36} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
                        {item.name}
                      </h3>
                      <div className="text-xs font-mono font-bold text-red-400">
                        {item.current_stock} units remaining
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] font-sans mt-3 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between gap-2">
                  <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Lead time: 3-5 days</span>
                  </div>

                  <button
                    onClick={() => {
                      sound.playSparkle();
                      onRestockItem(item.id, item.suggested_reorder || 25);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-serif font-bold transition-all"
                  >
                    Reorder Stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Overstock Risk Section */}
      {(filterType === 'ALL' || filterType === 'OVERSTOCK') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-400">
              <PackageX className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[var(--text-primary)]">
                Capital Trapped in Overstock
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-sans">
                Items exceeding safe inventory limits, locking Gold Galleons on shelf storage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overstockItems.map((item) => {
              const tiedUpGold = (item.current_stock * item.selling_price).toLocaleString();
              return (
                <div 
                  key={item.id}
                  className="pixel-card p-5 border-amber-500/40 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                        OVERSTOCKED
                      </span>
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        Max Cap: {item.max_stock_level} units
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] shrink-0">
                        <MagicalItemIcon name={item.name} size={36} />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
                          {item.name}
                        </h3>
                        <div className="text-xs font-mono font-bold text-amber-400">
                          {item.current_stock} units on hand
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] font-sans mt-3 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between">
                    <span className="text-[11px] font-serif text-[var(--text-muted)]">
                      Capital tied up:
                    </span>
                    <span className="font-mono font-bold text-xs text-amber-300">
                      {tiedUpGold} Gold Galleons
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}

