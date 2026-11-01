import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle2, ShieldCheck, AlertCircle, PackageCheck, DollarSign } from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import { api } from '../../services/api';
import { sound } from '../../utils/audioSynth';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [supRes, poRes] = await Promise.all([
        api.getSuppliers(),
        api.getPurchaseOrders()
      ]);
      if (supRes.success) setSuppliers(supRes.data);
      if (poRes.success) setPurchaseOrders(poRes.data);
    } catch (err) {
      console.error('Failed to load supplier data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceivePO = async (poId) => {
    try {
      sound.playCastSpell();
      setActionMessage(null);
      const res = await api.receivePurchaseOrder(poId);
      if (res.success) {
        sound.playSparkle();
        setActionMessage({ type: 'success', text: res.message });
        loadData();
      }
    } catch (err) {
      sound.playWarningHex();
      setActionMessage({ type: 'error', text: err.message || 'Could not receive purchase order.' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-serif font-black text-[var(--text-primary)]">
              Suppliers & Guild Requisitions
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-purple-950 text-purple-300 border border-purple-500/30">
              SUPPLY CHAIN LEDGER
            </span>
          </div>
          <p className="text-xs font-serif text-[var(--text-muted)] mt-1">
            Manage arcane contracts, lead times, minimum orders, and inbound purchase orders from distant magical realms.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className={`p-3.5 rounded-xl text-xs font-serif flex items-center gap-2 ${
          actionMessage.type === 'success'
            ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-200'
            : 'bg-red-950/30 border border-red-500/40 text-red-200'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Suppliers Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-serif font-black text-[var(--text-primary)]">
          Contracted Supplier Guilds ({suppliers.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="pixel-card p-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] space-y-2 hover:border-purple-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[var(--text-primary)]">
                  {s.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/30">
                  {s.realm}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-[var(--text-muted)]">
                <div>
                  <span>Lead Time: </span>
                  <span className="font-bold text-[var(--text-primary)]">{s.lead_time_days} days</span>
                </div>
                <div>
                  <span>Reliability: </span>
                  <span className="font-bold text-emerald-400">{Math.round(s.reliability_score * 100)}%</span>
                </div>
              </div>

              <div className="text-[11px] font-sans text-[var(--text-secondary)] border-t border-[var(--border-card)] pt-2">
                Contact: <span className="font-mono text-purple-300">{s.contact || 'Owl Dispatch'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inbound Purchase Orders */}
      <div className="space-y-3 pt-4">
        <h2 className="text-base font-serif font-black text-[var(--text-primary)]">
          Inbound Purchase Orders ({purchaseOrders.length})
        </h2>

        <div className="pixel-card rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-serif">
              <thead className="bg-purple-950/40 border-b border-purple-500/20 text-purple-200">
                <tr>
                  <th className="py-3 px-4 font-bold">PO #</th>
                  <th className="py-3 px-4 font-bold">Supplier</th>
                  <th className="py-3 px-4 font-bold">Items Ordered</th>
                  <th className="py-3 px-4 font-bold">Total Amount</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 font-mono text-[11px]">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-purple-900/15">
                    <td className="py-3 px-4 font-bold text-purple-300">{po.po_number}</td>
                    <td className="py-3 px-4 font-serif font-bold text-[var(--text-primary)]">
                      {po.supplier_name} ({po.realm})
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)] font-sans">
                      {po.items?.map(i => `${i.quantity_ordered}x ${i.product_name}`).join(', ') || 'Reagents'}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      {po.total_amount} Gold
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-pixel ${
                        po.status === 'RECEIVED'
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                          : po.status === 'IN_TRANSIT'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                          : 'bg-purple-950/70 text-purple-300 border border-purple-500/30'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {po.status !== 'RECEIVED' ? (
                        <button
                          onClick={() => handleReceivePO(po.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-serif font-bold shadow-sm transition-all inline-flex items-center gap-1"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Receive & Restock</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-serif italic">Received & Shelved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

