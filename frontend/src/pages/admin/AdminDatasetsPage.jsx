import React, { useState, useEffect } from 'react';
import { Database, Download, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, BarChart2, Layers, ShieldCheck, Tag } from 'lucide-react';
import { PixelIcon } from '../../components/PixelArt';
import { api } from '../../services/api';
import { sound } from '../../utils/audioSynth';

export default function AdminDatasetsPage() {
  const [sources, setSources] = useState([]);
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);

  // Tab View: 'transactions' | 'demand' | 'backtest'
  const [activeTab, setActiveTab] = useState('transactions');

  // Transactions pagination
  const [transactions, setTransactions] = useState([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txPage, setTxPage] = useState(0);
  const [txFilterCancel, setTxFilterCancel] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  // Daily Demand
  const [dailyDemand, setDailyDemand] = useState([]);
  const [demandTotals, setDemandTotals] = useState(null);
  const [topProducts, setTopProducts] = useState([]);

  // Backtest evaluations
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    loadDatasetOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    } else if (activeTab === 'demand') {
      loadDailyDemand();
    } else if (activeTab === 'backtest') {
      loadBacktestLeaderboard();
    }
  }, [activeTab, txPage, txFilterCancel]);

  const loadDatasetOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminDatasets();
      if (res.success) {
        setSources(res.data.sources || []);
        setImports(res.data.imports || []);
      }
    } catch (err) {
      console.error('Failed to load dataset metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setTxLoading(true);
      const params = {
        limit: 25,
        offset: txPage * 25
      };
      if (txFilterCancel !== '') params.isCancellation = txFilterCancel;

      const res = await api.getAdminRetailTransactions(params);
      if (res.success) {
        setTransactions(res.transactions || []);
        setTxTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load retail transactions:', err);
    } finally {
      setTxLoading(false);
    }
  };

  const loadDailyDemand = async () => {
    try {
      const res = await api.getAdminDailyDemand({ limit: 40 });
      if (res.success && res.data) {
        setDailyDemand(res.data.demand || []);
        setDemandTotals(res.data.totals || null);
        setTopProducts(res.data.topProducts || []);
      }
    } catch (err) {
      console.error('Failed to load daily demand:', err);
    }
  };

  const loadBacktestLeaderboard = async () => {
    try {
      const res = await api.getForecastEvaluations();
      if (res.success && res.data) {
        setEvaluations(res.data.realRetailBacktest || []);
      }
    } catch (err) {
      console.error('Failed to load backtest evaluations:', err);
    }
  };

  const handleTriggerImport = async (force = false) => {
    try {
      setImporting(true);
      setImportMessage(null);
      sound.playCastSpell();

      const res = await api.triggerDatasetImport({ force, sampleLimit: 25000 });
      if (res.success) {
        sound.playSparkle();
        setImportMessage({ type: 'success', text: res.message });
        loadDatasetOverview();
        loadTransactions();
      }
    } catch (err) {
      sound.playWarningHex();
      setImportMessage({ type: 'error', text: err.message || 'Import pipeline failed.' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-serif font-black text-[var(--text-primary)]">
              Dataset Sources & UCI Integration
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-indigo-950 text-indigo-300 border border-indigo-500/40">
              DUAL-DATASET PROVENANCE
            </span>
          </div>
          <p className="text-xs font-serif text-[var(--text-muted)] mt-1">
            Separate authoritative management for Real Retail Transactions and Fictional Potion Shop demo data.
          </p>
        </div>

        <button
          onClick={() => handleTriggerImport(false)}
          disabled={importing}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-serif font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{importing ? 'Processing Stream...' : 'Run UCI Import Pipeline'}</span>
        </button>
      </div>

      {importMessage && (
        <div className={`p-3.5 rounded-xl text-xs font-serif flex items-center gap-2 ${
          importMessage.type === 'success'
            ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-200'
            : 'bg-red-950/30 border border-red-500/40 text-red-200'
        }`}>
          {importMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{importMessage.text}</span>
        </div>
      )}

      {/* Dataset Provenance Cards: REAL DATA vs DEMO DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Real Retail Card */}
        <div className="pixel-card p-5 rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/30 via-[var(--bg-card)] to-purple-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-indigo-950 text-indigo-300 border border-indigo-500/50">
              REAL DATA
            </span>
            <a 
              href="https://archive.ics.uci.edu/dataset/502/online+retail+ii" 
              target="_blank" 
              rel="noreferrer"
              className="text-[11px] font-serif text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>UCI Archive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <h3 className="font-serif font-black text-base text-[var(--text-primary)]">
              UCI Online Retail II Dataset
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
              1,067,371 real retail transactions from a UK-based non-store online gift retailer between 01/12/2009 and 09/12/2011.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] font-serif text-purple-200 space-y-1">
            <div className="font-bold text-amber-400">Formal Attribution (DOI: 10.24432/C5CG6D):</div>
            <div className="italic text-[10px] text-[var(--text-muted)] font-sans">
              "Chen, D. (2012). Online Retail II [Dataset]. UCI Machine Learning Repository."
            </div>
          </div>
        </div>

        {/* Fictional Apothecary Card */}
        <div className="pixel-card p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-[var(--bg-card)] to-[var(--bg-card)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-amber-950 text-amber-300 border border-amber-500/50">
              DEMO DATA
            </span>
            <span className="text-[11px] font-serif text-purple-300">
              Internal Apothecary Lore
            </span>
          </div>

          <div>
            <h3 className="font-serif font-black text-base text-[var(--text-primary)]">
              Madam Hex's Potion Emporium (Demo)
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
              Synthetic magical potion recipes, arcane ingredients, and counter sales simulating seasonal Halloween surge in Hallowmere.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] font-serif text-purple-200 space-y-1">
            <div className="font-bold text-emerald-400">Provenance Rule:</div>
            <div className="text-[10px] text-[var(--text-muted)] font-sans">
              Separated in database from actual retail records. Never mixed in model training without explicit selection.
            </div>
          </div>
        </div>

      </div>

      {/* Tab Navigation for Real Dataset Inspection */}
      <div className="flex border-b border-[var(--border-card)] gap-2 text-xs font-serif font-bold">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`py-2.5 px-4 border-b-2 transition-all ${
            activeTab === 'transactions'
              ? 'border-purple-500 text-purple-300 font-black'
              : 'border-transparent text-[var(--text-muted)] hover:text-white'
          }`}
        >
          Real Retail Transactions ({txTotal.toLocaleString()})
        </button>
        <button
          onClick={() => setActiveTab('demand')}
          className={`py-2.5 px-4 border-b-2 transition-all ${
            activeTab === 'demand'
              ? 'border-purple-500 text-purple-300 font-black'
              : 'border-transparent text-[var(--text-muted)] hover:text-white'
          }`}
        >
          Daily Demand Aggregation
        </button>
        <button
          onClick={() => setActiveTab('backtest')}
          className={`py-2.5 px-4 border-b-2 transition-all ${
            activeTab === 'backtest'
              ? 'border-purple-500 text-purple-300 font-black'
              : 'border-transparent text-[var(--text-muted)] hover:text-white'
          }`}
        >
          Chronological Backtesting Leaderboard
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: PAGINATED REAL RETAIL TRANSACTIONS
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-serif">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)]">Type:</span>
              <button
                onClick={() => { setTxPage(0); setTxFilterCancel(''); }}
                className={`px-2.5 py-1 rounded-lg ${txFilterCancel === '' ? 'bg-purple-600 text-white' : 'bg-purple-950/30 text-purple-300'}`}
              >
                All
              </button>
              <button
                onClick={() => { setTxPage(0); setTxFilterCancel('false'); }}
                className={`px-2.5 py-1 rounded-lg ${txFilterCancel === 'false' ? 'bg-purple-600 text-white' : 'bg-purple-950/30 text-purple-300'}`}
              >
                Sales Only
              </button>
              <button
                onClick={() => { setTxPage(0); setTxFilterCancel('true'); }}
                className={`px-2.5 py-1 rounded-lg ${txFilterCancel === 'true' ? 'bg-purple-600 text-white' : 'bg-purple-950/30 text-purple-300'}`}
              >
                Cancellations
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setTxPage(Math.max(0, txPage - 1))}
                disabled={txPage === 0}
                className="px-2.5 py-1 rounded-lg border border-purple-500/30 disabled:opacity-40"
              >
                Prev
              </button>
              <span>Page {txPage + 1} of {Math.max(1, Math.ceil(txTotal / 25))}</span>
              <button
                onClick={() => setTxPage(txPage + 1)}
                disabled={(txPage + 1) * 25 >= txTotal}
                className="px-2.5 py-1 rounded-lg border border-purple-500/30 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <div className="pixel-card rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-serif">
                <thead className="bg-purple-950/40 border-b border-purple-500/20 text-purple-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Invoice #</th>
                    <th className="py-2.5 px-3 font-bold">Stock Code</th>
                    <th className="py-2.5 px-3 font-bold">Description</th>
                    <th className="py-2.5 px-3 font-bold">Qty</th>
                    <th className="py-2.5 px-3 font-bold">Unit Price</th>
                    <th className="py-2.5 px-3 font-bold">Masked Customer</th>
                    <th className="py-2.5 px-3 font-bold">Country</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10 font-mono text-[11px]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-purple-900/15">
                      <td className="py-2.5 px-3 font-bold text-purple-300">{tx.invoice_no}</td>
                      <td className="py-2.5 px-3 text-amber-300">{tx.stock_code}</td>
                      <td className="py-2.5 px-3 font-sans text-[var(--text-primary)] truncate max-w-xs">{tx.description}</td>
                      <td className={`py-2.5 px-3 font-bold ${tx.is_cancellation ? 'text-red-400' : 'text-emerald-400'}`}>
                        {tx.quantity}
                      </td>
                      <td className="py-2.5 px-3">£{tx.unit_price}</td>
                      <td className="py-2.5 px-3 text-[var(--text-muted)]">{tx.masked_customer_id}</td>
                      <td className="py-2.5 px-3 text-[var(--text-secondary)]">{tx.country}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-pixel ${
                          tx.is_cancellation 
                            ? 'bg-red-950 text-red-300 border border-red-500/30' 
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {tx.is_cancellation ? 'RETURN' : 'SALE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: DAILY DEMAND AGGREGATION
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'demand' && (
        <div className="space-y-4">
          {demandTotals && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-serif">
              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)]">
                <div className="text-[var(--text-muted)]">Distinct Products</div>
                <div className="font-bold text-base text-[var(--text-primary)] font-mono">{demandTotals.distinct_products?.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)]">
                <div className="text-[var(--text-muted)]">Total Units Sold</div>
                <div className="font-bold text-base text-emerald-400 font-mono">{demandTotals.total_units_sold?.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)]">
                <div className="text-[var(--text-muted)]">Units Cancelled</div>
                <div className="font-bold text-base text-red-400 font-mono">{demandTotals.total_units_cancelled?.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)]">
                <div className="text-[var(--text-muted)]">Total Revenue</div>
                <div className="font-bold text-base text-amber-400 font-mono">£{demandTotals.total_revenue?.toLocaleString()}</div>
              </div>
            </div>
          )}

          <div className="pixel-card rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-serif">
                <thead className="bg-purple-950/40 border-b border-purple-500/20 text-purple-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Date</th>
                    <th className="py-2.5 px-3 font-bold">Stock Code</th>
                    <th className="py-2.5 px-3 font-bold">Description</th>
                    <th className="py-2.5 px-3 font-bold">Sold</th>
                    <th className="py-2.5 px-3 font-bold">Cancelled</th>
                    <th className="py-2.5 px-3 font-bold">Net Demand</th>
                    <th className="py-2.5 px-3 font-bold">Revenue</th>
                    <th className="py-2.5 px-3 font-bold">Split</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10 font-mono text-[11px]">
                  {dailyDemand.map((d, idx) => (
                    <tr key={idx} className="hover:bg-purple-900/15">
                      <td className="py-2.5 px-3 text-[var(--text-muted)]">{d.demand_date}</td>
                      <td className="py-2.5 px-3 font-bold text-purple-300">{d.stock_code}</td>
                      <td className="py-2.5 px-3 font-sans text-[var(--text-primary)] truncate max-w-xs">{d.description}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">+{d.units_sold}</td>
                      <td className="py-2.5 px-3 text-red-400">-{d.units_cancelled}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-400">{d.net_units}</td>
                      <td className="py-2.5 px-3">£{d.revenue?.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-pixel ${
                          d.split_type === 'VALIDATION' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-purple-950 text-purple-300 border border-purple-500/40'
                        }`}>
                          {d.split_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: CHRONOLOGICAL BACKTESTING BENCHMARK
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'backtest' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs font-serif space-y-1">
            <div className="font-bold text-amber-400">Reproducible Chronological Backtesting Protocol:</div>
            <p className="text-[11px] text-[var(--text-muted)] font-sans">
              Models are trained exclusively on historical demand periods and evaluated out-of-time against holdout validation windows.
              Metrics calculate MAE (Mean Absolute Error), WAPE (Weighted Absolute Percentage Error), and Bias.
            </p>
          </div>

          <div className="pixel-card rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-serif">
                <thead className="bg-purple-950/40 border-b border-purple-500/20 text-purple-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Retail Model & Product Target</th>
                    <th className="py-3 px-4 font-bold">MAE</th>
                    <th className="py-3 px-4 font-bold">WAPE (%)</th>
                    <th className="py-3 px-4 font-bold">Forecast Bias</th>
                    <th className="py-3 px-4 font-bold">Accuracy</th>
                    <th className="py-3 px-4 font-bold">Evaluation Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10 font-mono text-xs">
                  {evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-purple-900/15">
                      <td className="py-3 px-4 font-bold text-purple-300 font-serif">
                        {ev.model_name}
                      </td>
                      <td className="py-3 px-4 text-amber-400 font-bold">{ev.mae}</td>
                      <td className="py-3 px-4 text-emerald-400">{ev.wape}%</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{ev.bias}</td>
                      <td className="py-3 px-4 font-bold text-purple-200">{ev.relative_accuracy}%</td>
                      <td className="py-3 px-4 text-[10px] text-[var(--text-muted)] font-sans">{ev.backtest_period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

