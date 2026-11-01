import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  X, 
  Bot, 
  User, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wrench, 
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  PackageCheck,
  Cpu,
  Activity,
  Check,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { sound } from '../utils/audioSynth';

export default function AskMysticAIChat({
  isOpen,
  onClose,
  initialPrompt = '',
  onActionExecuted
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session-hex-${Date.now()}`);
  const messagesEndRef = useRef(null);

  // Admin Diagnostics Panel State
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  const fetchDiagnostics = async () => {
    try {
      const res = await api.getAiDiagnostics();
      if (res.success) {
        setDiagnostics(res.diagnostics);
      }
    } catch (err) {
      console.error('Failed to fetch AI diagnostics:', err);
    }
  };

  const handlePing = async () => {
    try {
      setPingLoading(true);
      sound.playSparkle();
      const res = await api.pingAiProvider();
      setPingResult(res.ping);
      fetchDiagnostics();
    } catch (err) {
      setPingResult({ success: false, status: 'ERROR', message: err.message });
    } finally {
      setPingLoading(false);
    }
  };

  const starterPrompts = [
    { label: '🎃 Halloween Depletion', prompt: 'What is likely to run out before Halloween?' },
    { label: '🧪 Brewing Shortages', prompt: 'Which potions cannot be brewed due to missing ingredients?' },
    { label: '💰 Trapped Working Gold', prompt: 'Show me overstocked items tying up gold galleons.' },
    { label: '📦 Guild Suppliers', prompt: 'Compare suppliers for reliability and lead times.' },
    { label: '📈 30-Day Bestsellers', prompt: 'What are our top trending products and velocity rankings?' }
  ];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load chat history or handle initial prompt
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      } else if (messages.length === 0) {
        // Welcome message from the Oracle
        setMessages([
          {
            role: 'assistant',
            content: `### 🔮 Welcome, Madam Hex\n\nI am **Mystic AI — The Inventory Oracle**, your nocturnal operations copilot. The ledger of Hallowmere is open before me.\n\nAsk me anything about imminent stockouts, cauldron brewing capacity, overstock discounts, supplier comparisons, or Halloween surge preparations!`,
            tool_calls: null,
            suggested_actions: null,
            created_at: new Date().toLocaleTimeString()
          }
        ]);
      }

      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, initialPrompt]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || text.trim() === '' || loading) return;

    sound.playSparkle();
    setInputMessage('');

    // Append user message
    const userMsg = {
      role: 'user',
      content: text,
      created_at: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.sendAiChatMessage(text, sessionId);
      if (res.success) {
        const assistantMsg = {
          role: 'assistant',
          content: res.message,
          tool_calls: res.toolsUsed,
          tool_results: res.toolResults,
          suggested_actions: res.suggestedActions,
          provider: res.provider,
          model: res.model,
          fallbackReason: res.fallbackReason,
          created_at: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, assistantMsg]);
        sound.playPotionBubble();
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ The scrying orb encountered interference: ${err.message || 'Unable to consult the Oracle.'}`,
          created_at: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async (actionId) => {
    try {
      sound.playCoinClink();
      const res = await api.approveAiAction(actionId);
      if (res.success) {
        // Update local action status in messages
        setMessages(prev => prev.map(msg => {
          if (!msg.suggested_actions) return msg;
          return {
            ...msg,
            suggested_actions: msg.suggested_actions.map(act => 
              act.id === actionId ? { ...act, status: 'EXECUTED', executed_at: new Date().toISOString() } : act
            )
          };
        }));

        if (onActionExecuted) {
          onActionExecuted(res.action);
        }
      }
    } catch (err) {
      console.error('Failed to approve action:', err);
      alert(`Could not execute action: ${err.message}`);
    }
  };

  const handleRejectAction = async (actionId) => {
    try {
      sound.playPotionBubble();
      const res = await api.rejectAiAction(actionId, 'Rejected by Madam Hex');
      if (res.success) {
        setMessages(prev => prev.map(msg => {
          if (!msg.suggested_actions) return msg;
          return {
            ...msg,
            suggested_actions: msg.suggested_actions.map(act => 
              act.id === actionId ? { ...act, status: 'REJECTED' } : act
            )
          };
        }));
      }
    } catch (err) {
      console.error('Failed to reject action:', err);
    }
  };

  const handleClearHistory = async () => {
    try {
      sound.playPotionBubble();
      await api.clearAiChatHistory(sessionId);
      setMessages([
        {
          role: 'assistant',
          content: '🔮 Ethereal scroll cleared. How may the Oracle assist you, Madam Hex?',
          created_at: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  // Helper to render markdown-style content with simple HTML formatting
  const renderFormattedContent = (content) => {
    if (!content) return null;

    // Check if message contains markdown tables
    const lines = content.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-xl border border-[var(--border-card)]">
            <table className="w-full text-xs text-left border-collapse bg-[var(--bg-primary)]">
              <thead>
                <tr className="bg-[var(--bg-card)] border-b border-[var(--border-card)]">
                  {tableRows[0].map((cell, idx) => (
                    <th key={idx} className="p-2 font-serif font-bold text-[var(--color-purple)]">
                      {cell.replace(/\*\*/g, '').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(2).map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-[var(--border-card)]/50 hover:bg-[var(--bg-card)]/60">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 font-sans text-[var(--text-primary)]">
                        {cell.replace(/\*\*/g, '').trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const cells = trimmed.split('|').slice(1, -1);
        tableRows.push(cells);
        return;
      }

      if (inTable) {
        flushTable();
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-sm font-serif font-black text-purple-300 mt-3 mb-1">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('- ')) {
        elements.push(
          <li key={idx} className="text-xs text-[var(--text-secondary)] font-sans ml-4 list-disc leading-relaxed">
            {trimmed.replace('- ', '')}
          </li>
        );
      } else if (trimmed === '') {
        elements.push(<div key={idx} className="h-1.5" />);
      } else {
        elements.push(
          <p key={idx} className="text-xs text-[var(--text-primary)] font-sans leading-relaxed">
            {trimmed}
          </p>
        );
      }
    });

    if (inTable) {
      flushTable();
    }

    return elements;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[540px] md:w-[600px] h-full flex flex-col bg-[var(--bg-card-solid)] border-l-2 border-[var(--border-card)] shadow-2xl animate-slide-left"
      >
        {/* Oracle Header */}
        <div className="p-4 border-b border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 border border-purple-500/50 flex items-center justify-center p-2 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-serif font-black text-[var(--text-primary)] tracking-wide">
                  Mystic AI — The Inventory Oracle
                </h2>
                <span className="px-1.5 py-0.5 text-[9px] font-pixel rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  LEVEL 3 GUARDED
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-sans">
                Apothecary Copilot &bull; Madam Hex's Strategic Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setShowDiagnostics(prev => !prev);
                if (!showDiagnostics) fetchDiagnostics();
              }}
              id="oracle-diagnostics-btn"
              className={`p-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                showDiagnostics 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-[var(--text-muted)] hover:text-purple-300 hover:bg-purple-900/30'
              }`}
              title="Admin Diagnostics Panel: Groq Provider & Fallback Status"
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">Diagnostics</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-red-400 hover:bg-red-950/20 transition-colors"
              title="Clear Conversation History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-card)] transition-colors"
              title="Close Oracle Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin AI Provider Diagnostics Panel */}
        {showDiagnostics && (
          <div className="p-4 border-b border-[var(--border-card)] bg-purple-950/40 text-xs font-serif animate-fade-in space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-[var(--text-primary)] text-sm">
                  AI Provider Diagnostics (Admin Only)
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                diagnostics?.activeProvider === 'groq'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              }`}>
                {diagnostics?.activeProvider === 'groq' ? 'GROQ CLOUD ACTIVE' : 'HEURISTIC FALLBACK ACTIVE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-card)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Active Provider</span>
                <strong className={diagnostics?.activeProvider === 'groq' ? 'text-emerald-400' : 'text-purple-300'}>
                  {diagnostics?.activeProvider === 'groq' ? 'Groq AI Cloud' : 'Deterministic Heuristic Engine'}
                </strong>
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-card)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Active Model</span>
                <strong>{diagnostics?.model || 'llama-3.3-70b-versatile'}</strong>
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-card)]">
                <span className="text-[var(--text-muted)] block text-[10px]">GROQ_API_KEY</span>
                <strong className={diagnostics?.groqKeyConfigured ? 'text-emerald-400' : 'text-amber-400'}>
                  {diagnostics?.groqKeyConfigured ? `Configured (${diagnostics.groqMaskedKey})` : 'Not Set (Using Fallback)'}
                </strong>
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-card)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Authorized Tools</span>
                <strong className="text-purple-300">{diagnostics?.toolsCount || 9} / 9 Online</strong>
              </div>
            </div>

            {/* Live Connection Test Button */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <button
                onClick={handlePing}
                disabled={pingLoading}
                className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-900/40 hover:bg-purple-800/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Activity className={`w-3.5 h-3.5 ${pingLoading ? 'animate-spin' : 'text-purple-400'}`} />
                <span>{pingLoading ? 'Pinging Provider...' : 'Test Connection (Ping)'}</span>
              </button>
              {diagnostics?.lastQueryProvider && (
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  Last response via: <strong>{diagnostics.lastQueryProvider}</strong>
                </span>
              )}
            </div>

            {pingResult && (
              <div className={`p-2.5 rounded-lg border text-[11px] font-sans flex items-start gap-2 ${
                pingResult.success
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-purple-950/30 border-purple-500/40 text-purple-200'
              }`}>
                {pingResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{pingResult.status}: {pingResult.message}</div>
                  {pingResult.latencyMs && <div>Roundtrip Latency: {pingResult.latencyMs}ms</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Starter Prompts Horizontal Bar */}
        <div className="px-4 py-2 border-b border-[var(--border-card)] bg-[var(--bg-primary)]/40 overflow-x-auto flex items-center gap-2">
          {starterPrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sp.prompt)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-serif font-bold whitespace-nowrap border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/40 text-purple-300 hover:text-white transition-all shadow-xs"
            >
              {sp.label}
            </button>
          ))}
        </div>

        {/* Chat Message Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center p-1.5 text-purple-300 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                  isUser
                    ? 'bg-[var(--color-purple)] text-white rounded-tr-none'
                    : 'bg-[var(--bg-primary)] border border-[var(--border-card)] rounded-tl-none'
                }`}>
                  {/* Tool Call Badges */}
                  {!isUser && msg.tool_calls && msg.tool_calls.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-[var(--border-card)]/50">
                      {msg.tool_calls.map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-900/40 border border-purple-500/30 text-[10px] font-mono text-purple-300"
                        >
                          <Wrench className="w-3 h-3 text-purple-400" />
                          <span>{tool}()</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="space-y-1">
                    {isUser ? (
                      <p className="text-xs font-sans leading-relaxed">{msg.content}</p>
                    ) : (
                      renderFormattedContent(msg.content)
                    )}
                  </div>

                  {/* Level 3 Guarded Action Proposals */}
                  {!isUser && msg.suggested_actions && msg.suggested_actions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[var(--border-card)] space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-serif font-bold text-amber-300">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Action Proposals Awaiting Madam Hex's Approval:</span>
                      </div>

                      {msg.suggested_actions.map((act) => {
                        const isExecuted = act.status === 'EXECUTED';
                        const isRejected = act.status === 'REJECTED';
                        const isPending = act.status === 'PENDING';

                        return (
                          <div
                            key={act.id}
                            className={`p-3 rounded-xl border transition-all ${
                              isExecuted
                                ? 'bg-emerald-950/20 border-emerald-500/40'
                                : isRejected
                                ? 'bg-zinc-900/40 border-zinc-700 opacity-60'
                                : 'bg-purple-950/30 border-amber-500/40 shadow-md'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="font-serif font-bold text-xs text-[var(--text-primary)]">
                                {act.title}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                isExecuted
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : isRejected
                                  ? 'bg-zinc-700 text-zinc-300'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {act.status}
                              </span>
                            </div>

                            <p className="text-[11px] text-[var(--text-secondary)] font-sans mb-2 leading-relaxed">
                              {act.justification}
                            </p>

                            {act.proposed_payload && (
                              <div className="grid grid-cols-2 gap-1 mb-2.5 p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-card)] text-[10px] font-mono">
                                {act.proposed_payload.quantity && (
                                  <div>Order Qty: <strong>{act.proposed_payload.quantity} units</strong></div>
                                )}
                                {act.proposed_payload.totalCost && (
                                  <div>Est. Cost: <strong>{act.proposed_payload.totalCost}G</strong></div>
                                )}
                                {act.proposed_payload.supplierName && (
                                  <div>Supplier: <strong>{act.proposed_payload.supplierName}</strong></div>
                                )}
                                {act.proposed_payload.leadTimeDays && (
                                  <div>Lead Time: <strong>{act.proposed_payload.leadTimeDays} days</strong></div>
                                )}
                              </div>
                            )}

                            {isPending && (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleApproveAction(act.id)}
                                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-serif font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  <PackageCheck className="w-3.5 h-3.5" />
                                  <span>Approve & Execute</span>
                                </button>
                                <button
                                  onClick={() => handleRejectAction(act.id)}
                                  className="py-1.5 px-3 rounded-lg border border-red-500/30 hover:bg-red-950/30 text-red-300 text-xs font-serif font-bold transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {isExecuted && (
                              <div className="flex items-center gap-1.5 text-[11px] font-serif font-bold text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Executed and logged in apothecary records</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mt-2 pt-1.5 border-t border-[var(--border-card)]/40 font-mono">
                    {!isUser ? (
                      <span className="flex items-center gap-1 text-[var(--color-purple)]">
                        {msg.provider === 'groq' ? (
                          <>⚡ <strong>Groq Cloud</strong> ({msg.model || 'llama-3.3-70b'})</>
                        ) : (
                          <>🛡️ <strong>Deterministic Heuristic Engine</strong></>
                        )}
                      </span>
                    ) : <span />}
                    <span>{msg.created_at}</span>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 border border-purple-400 flex items-center justify-center p-1.5 text-white shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center p-1.5 text-purple-300 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-card)] text-xs font-serif text-purple-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                <span>The Oracle is consulting the stars and ledger algorithms...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[var(--border-card)] bg-[var(--bg-card)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask the Oracle about stockouts, potions, suppliers, forecasts..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-purple-400 transition-colors font-sans"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-purple)] hover:bg-purple-600 text-white font-serif font-bold text-xs transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              title="Send to Oracle"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Consult</span>
            </button>
          </form>
          <div className="text-[10px] text-[var(--text-muted)] font-serif text-center mt-2">
            Deterministic formulas compute all quantities &bull; Actions require explicit Admin confirmation
          </div>
        </div>
      </div>
    </div>
  );
}
