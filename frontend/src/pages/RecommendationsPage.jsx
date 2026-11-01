import React, { useState } from 'react';
import { 
  Lightbulb, 
  ArrowRight, 
  ShieldAlert, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import MagicalItemIcon from '../components/MagicalItemIcon';
import { sound } from '../utils/audioSynth';

export default function RecommendationsPage({ 
  recommendations, 
  loading, 
  onApplyRestock 
}) {
  const [filterPriority, setFilterPriority] = useState('ALL');

  if (loading || !recommendations) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--color-orange)] border-t-transparent animate-spin" />
        <p className="font-pixel text-[11px] text-[var(--color-gold)] animate-pulse">
          DIVINING REORDER RECOMMENDATIONS...
        </p>
      </div>
    );
  }

  const filteredRecs = recommendations.filter(r => {
    if (filterPriority === 'ALL') return true;
    return r.priority === filterPriority;
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          border: 'border-[var(--color-crimson)]',
          badgeClass: 'pixel-badge-critical',
          badgeLabel: 'EMERGENCY RESTOCK',
          icon: ShieldAlert,
          iconColor: 'text-[var(--color-crimson)]'
        };
      case 'HIGH':
        return {
          border: 'border-[var(--color-orange)]',
          badgeClass: 'pixel-badge-low',
          badgeLabel: 'SEASONAL SPIKE',
          icon: Flame,
          iconColor: 'text-[var(--color-orange)]'
        };
      case 'MEDIUM':
        return {
          border: 'border-[var(--color-purple)]',
          badgeClass: 'pixel-badge-overstock',
          badgeLabel: 'HALT PURCHASES',
          icon: Layers,
          iconColor: 'text-[var(--color-purple)]'
        };
      default:
        return {
          border: 'border-[var(--color-emerald)]',
          badgeClass: 'pixel-badge-healthy',
          badgeLabel: 'OPTIMAL BALANCE',
          icon: CheckCircle2,
          iconColor: 'text-[var(--color-emerald)]'
        };
    }
  };

  const formatGold = (val) => `${Number(val || 0).toLocaleString()} ₲`;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 lg:px-8 pt-6 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-orange)] font-pixel text-[10px] tracking-wider">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>AI PROCUREMENT ADVICE</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[var(--text-primary)] mt-1">
            Smart Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
            Actionable intelligence prioritizing emergency stockouts, Halloween surges, and overstock reduction.
          </p>
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center flex-wrap gap-1 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-card)] text-xs font-serif font-bold self-start sm:self-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map((p) => (
            <button
              key={p}
              onClick={() => {
                sound.playPotionBubble();
                setFilterPriority(p);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPriority === p ? 'bg-[var(--color-orange)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p === 'ALL' ? `All (${recommendations.length})` : p}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecs.map((rec) => {
          const style = getPriorityStyle(rec.priority);
          const PriorityIcon = style.icon;

          return (
            <div 
              key={rec.id}
              className={`pixel-card p-6 flex flex-col justify-between space-y-4 ${style.border}`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PriorityIcon className={`w-4 h-4 ${style.iconColor}`} />
                    <span className={style.badgeClass}>
                      {style.badgeLabel}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      Conf: {Math.round((rec.confidence || 0.9) * 100)}%
                    </span>
                  </div>

                  <span className="text-[11px] font-serif text-[var(--text-muted)]">
                    {rec.category}
                  </span>
                </div>

                {/* Identity & Message */}
                <div className="flex items-start gap-3.5 pt-1">
                  <div className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] shrink-0">
                    <MagicalItemIcon name={rec.product_name} size={36} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[var(--text-primary)] leading-snug">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-sans mt-1.5 leading-relaxed">
                      {rec.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-card)] space-y-2 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-gold)] font-serif font-bold">Suggested Action:</span>
                  {rec.lead_time && (
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      Lead: {rec.lead_time}d ({rec.supplier})
                    </span>
                  )}
                </div>
                <p className="text-[var(--text-primary)] font-bold">
                  {rec.suggested_action}
                </p>

                {rec.suggested_quantity > 0 && (
                  <div className="pt-2 border-t border-[var(--border-card)] flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[var(--text-secondary)]">
                      Order: <strong className="text-[var(--color-emerald)]">+{rec.suggested_quantity} units</strong>
                    </span>
                    <span className="text-[var(--color-gold)] font-bold">
                      Est. Outlay: {formatGold(rec.estimated_cost)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Trigger Button */}
              {rec.suggested_quantity > 0 ? (
                <button
                  onClick={() => {
                    sound.playSparkle();
                    onApplyRestock(rec.product_id, rec.suggested_quantity, `Applied recommendation: ${rec.title}`);
                  }}
                  className="pixel-btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                  <span>Execute Restock (+{rec.suggested_quantity} {rec.product_name})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : rec.type === 'OVERSTOCK_WARNING' ? (
                <div className="p-2.5 rounded-xl bg-[var(--color-purple-subtle)] border border-[var(--color-purple)] text-center text-xs font-serif font-bold text-[var(--color-purple)]">
                  Procurement hold active. 2,175₲ capital safeguarded.
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[var(--color-emerald-subtle)] border border-[var(--color-emerald)] text-center text-xs font-serif font-bold text-[var(--color-emerald)]">
                  Inventory is in optimal equilibrium.
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
