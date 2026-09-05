import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getWatchlistNames,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  createWatchlistGroup,
  deleteWatchlistGroup
} from "../api";
import SectionHeader from "../components/SectionHeader";
import TradeModal from "../components/TradeModal";
import { toast } from "../components/Toast";
import {
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  Layers,
  X,
  Check,
  Zap,
  BarChart2,
  FolderPlus
} from "lucide-react";

const SECTOR_COLORS = {
  "Technology": "#6366f1",
  "Finance": "#0ea5e9",
  "Energy": "#f59e0b",
  "Consumer Goods": "#10b981",
  "Automotive": "#f43f5e",
  "Healthcare": "#a855f7",
  "Metals & Mining": "#64748b",
  "Infrastructure": "#0891b2",
  "Telecom": "#84cc16",
};

const getSectorColor = (sector) => SECTOR_COLORS[sector] || "#6366f1";
const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Watchlist({
  prices = {},
  allStocks = [],
  walletBal = 1000000,
  userId = "demo-user",
  onTradeSuccess
}) {
  const [watchlistNames, setWatchlistNames] = useState(["Default"]);
  const [activeTab, setActiveTab]           = useState("Default");
  const [watchlist, setWatchlist]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [newListName, setNewListName]       = useState("");
  const [creatingList, setCreatingList]     = useState(false);
  const [trade, setTrade]                   = useState(null); // { stock, mode: 'BUY' | 'SELL' }

  // 1. Fetch available watchlist group names
  const loadNames = useCallback(async () => {
    try {
      const names = await getWatchlistNames(userId);
      if (Array.isArray(names) && names.length > 0) {
        setWatchlistNames(names);
        if (!names.includes(activeTab)) {
          setActiveTab(names[0]);
        }
      }
    } catch (err) {
      console.warn("Could not load watchlist names, using Default:", err);
    }
  }, [userId, activeTab]);

  // 2. Fetch stocks in currently active watchlist
  const loadItems = useCallback(async (listName = activeTab) => {
    setLoading(true);
    try {
      const data = await getWatchlist(userId, listName);
      setWatchlist(Array.isArray(data) ? data : []);
    } catch (e) {
      toast(e.message || "Failed to load watchlist", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab]);

  useEffect(() => {
    loadNames();
  }, [loadNames]);

  useEffect(() => {
    loadItems(activeTab);
  }, [activeTab, loadItems]);

  // Handle adding stock to active watchlist
  const handleAdd = async (symbol) => {
    try {
      await addToWatchlist(userId, symbol, activeTab);
      toast(`${symbol} added to "${activeTab}"`);
      await loadItems(activeTab);
    } catch (e) {
      toast(e?.response?.data?.message || e.message, "error");
    }
  };

  // Handle removing stock from active watchlist
  const handleRemove = async (symbol) => {
    try {
      await removeFromWatchlist(userId, symbol, activeTab);
      toast(`${symbol} removed from "${activeTab}"`);
      await loadItems(activeTab);
    } catch (e) {
      toast(e?.response?.data?.message || e.message, "error");
    }
  };

  // Handle creating a new named watchlist group
  const handleCreateGroup = async (e) => {
    e?.preventDefault();
    const name = newListName.trim();
    if (!name) {
      toast("Please enter a watchlist name", "warning");
      return;
    }
    try {
      await createWatchlistGroup(userId, name);
      toast(`Watchlist "${name}" created!`);
      setNewListName("");
      setCreatingList(false);
      await loadNames();
      setActiveTab(name);
    } catch (e) {
      toast(e?.response?.data?.message || e.message, "error");
    }
  };

  // Handle deleting a watchlist group
  const handleDeleteGroup = async (name) => {
    if (name === "Default") {
      if (!window.confirm("Are you sure you want to clear all stocks in the Default Watchlist?")) return;
    } else {
      if (!window.confirm(`Are you sure you want to delete the "${name}" watchlist?`)) return;
    }
    try {
      await deleteWatchlistGroup(userId, name);
      toast(`Watchlist "${name}" ${name === "Default" ? "cleared" : "deleted"}`);
      const updated = watchlistNames.filter(n => n !== name);
      setWatchlistNames(updated.length > 0 ? updated : ["Default"]);
      setActiveTab(updated.length > 0 ? updated[0] : "Default");
    } catch (e) {
      toast(e?.response?.data?.message || e.message, "error");
    }
  };

  // Filtered search stocks across universe
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allStocks.slice(0, 10);
    return allStocks.filter(s =>
      (s.symbol || "").toLowerCase().includes(q) ||
      (s.companyName || "").toLowerCase().includes(q) ||
      (s.sector || "").toLowerCase().includes(q)
    );
  }, [allStocks, searchQuery]);

  const activeSymbols = useMemo(() => new Set(watchlist.map(w => w.symbol)), [watchlist]);

  // Statistics for current watchlist
  const stats = useMemo(() => {
    if (watchlist.length === 0) return null;
    let topGainer = null;
    let topLoser = null;
    let totalScore = 0;
    let scoreCount = 0;

    watchlist.forEach(s => {
      const live = prices[s.symbol];
      const chg = Number(live?.changePercent ?? s.changePercent ?? 0);
      const score = s.aiScore != null ? Number(s.aiScore) : null;

      if (score != null) {
        totalScore += score;
        scoreCount++;
      }

      if (!topGainer || chg > topGainer.chg) {
        topGainer = { symbol: s.symbol, chg };
      }
      if (!topLoser || chg < topLoser.chg) {
        topLoser = { symbol: s.symbol, chg };
      }
    });

    return {
      count: watchlist.length,
      avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      topGainer,
      topLoser
    };
  }, [watchlist, prices]);

  return (
    <div className="page space-y-6">

      {/* ── Page Header & Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SectionHeader
            title="Watchlists"
            subtitle={`Organize and track multiple portfolios with real-time 800ms market sync`}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="btn-primary flex items-center gap-2 text-xs font-semibold py-2 px-4 shadow-lg shadow-indigo-600/20"
            onClick={() => setSearchModalOpen(true)}
          >
            <Search size={15} /> Search & Add Stock
          </button>
          <button
            className="refresh-button flex items-center gap-1.5"
            onClick={() => { loadNames(); loadItems(activeTab); }}
            title="Refresh active watchlist"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Infinite Watchlist Tabs Strip ── */}
      <div className="panel p-3">
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-2 min-w-max">
            {watchlistNames.map(name => {
              const isActive = name === activeTab;
              return (
                <div
                  key={name}
                  onClick={() => setActiveTab(name)}
                  className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2.5 select-none ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
                      : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800"
                  }`}
                >
                  <Layers size={13} className={isActive ? "text-white" : "text-indigo-400"} />
                  <span>{name}</span>
                  {isActive && watchlist.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
                      {watchlist.length}
                    </span>
                  )}
                  {name !== "Default" && isActive && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteGroup(name); }}
                      title={`Delete "${name}" watchlist`}
                      className="text-white/60 hover:text-rose-300 ml-1 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Create New Watchlist Button / Inline Input */}
            {creatingList ? (
              <form onSubmit={handleCreateGroup} className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-indigo-500/50">
                <input
                  type="text"
                  placeholder="List name (e.g. EV & Solar)"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  className="bg-transparent text-xs text-white px-2 py-1 outline-none w-40"
                  autoFocus
                />
                <button type="submit" className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => { setCreatingList(false); setNewListName(""); }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white text-xs"
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreatingList(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-400 bg-indigo-950/30 border border-dashed border-indigo-500/40 hover:bg-indigo-900/40 hover:border-indigo-400 transition flex items-center gap-1.5"
              >
                <FolderPlus size={14} /> + New Watchlist
              </button>
            )}
          </div>
        </div>

        {/* ── Quick Stats Bar (if active watchlist has stocks) ── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <BarChart2 size={15} className="text-indigo-400" />
              <span>Tracking: <b className="text-white">{stats.count} Stocks</b></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Zap size={15} className="text-purple-400" />
              <span>Avg AI Score: <b className="text-indigo-300">{stats.avgScore}/100</b></span>
            </div>
            {stats.topGainer && (
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp size={15} className="text-emerald-400" />
                <span>Top Gainer: <b className="text-white">{stats.topGainer.symbol}</b> <span className="text-emerald-400 font-mono font-bold">+{stats.topGainer.chg.toFixed(2)}%</span></span>
              </div>
            )}
            {stats.topLoser && (
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingDown size={15} className="text-rose-400" />
                <span>Top Lag: <b className="text-white">{stats.topLoser.symbol}</b> <span className="text-rose-400 font-mono font-bold">{stats.topLoser.chg.toFixed(2)}%</span></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Watchlist Content / Table ── */}
      {loading ? (
        <div className="panel p-12 flex flex-col items-center justify-center min-h-[300px]">
          <RefreshCw size={32} className="spin text-indigo-400" />
          <p className="text-slate-400 text-xs mt-3">Syncing "{activeTab}" live prices…</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="panel p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
            <Eye size={30} className="text-indigo-400 opacity-60" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">"{activeTab}" Watchlist is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            Add high-conviction Nifty 50 stocks to this watchlist to track price ticks and execute paper trades.
          </p>
          <button
            onClick={() => setSearchModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5"
          >
            <Plus size={15} /> Search & Add Stock
          </button>
        </div>
      ) : (
        <section className="panel p-0 overflow-hidden">
          <div className="table-wrap">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/40">
                  <th className="py-3 px-4 font-semibold">SYMBOL</th>
                  <th className="py-3 px-4 font-semibold">COMPANY & SECTOR</th>
                  <th className="py-3 px-4 font-semibold">LIVE PRICE</th>
                  <th className="py-3 px-4 font-semibold">DAY CHANGE</th>
                  <th className="py-3 px-4 font-semibold">AI SCORE</th>
                  <th className="py-3 px-4 font-semibold">AI VERDICT</th>
                  <th className="py-3 px-4 font-semibold text-right">PAPER TRADE ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {watchlist.map(s => {
                  if (!s.symbol || s.symbol === "_INIT_") return null;
                  const live = prices[s.symbol];
                  const price = live?.price ?? s.price ?? 0;
                  const chg   = live?.changePercent ?? s.changePercent ?? 0;
                  const up    = Number(chg) >= 0;
                  const score = s.aiScore ?? 0;
                  const sector = s.sector || "General";

                  return (
                    <tr key={s.symbol} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white"
                            style={{ background: getSectorColor(sector) }}
                          >
                            {s.symbol.slice(0, 2)}
                          </div>
                          <strong className="text-white text-sm tracking-tight">{s.symbol}</strong>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{s.companyName || s.symbol}</div>
                        <span className="text-[10px] text-slate-400">{sector}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                        {fmt(price)}
                      </td>
                      <td className={`py-3.5 px-4 font-mono font-bold ${up ? "text-emerald-400" : "text-rose-400"}`}>
                        <span className="inline-flex items-center gap-1">
                          {up ? "▲" : "▼"} {up ? "+" : ""}{Number(chg).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          score >= 75 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                          score >= 60 ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" :
                          score >= 45 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                          "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          {score}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (s.recommendation || "").toUpperCase().includes("BUY") ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                          (s.recommendation || "").toUpperCase().includes("HOLD") ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                          "bg-slate-800 text-slate-300"
                        }`}>
                          {s.recommendation || "BUY"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Direct Buy Button */}
                          <button
                            className="btn-buy-sm flex items-center gap-1 px-3 py-1.5"
                            onClick={() => setTrade({ stock: { ...s, price }, mode: "BUY" })}
                            title={`Buy ${s.symbol}`}
                          >
                            <TrendingUp size={12} /> Buy
                          </button>

                          {/* Direct Sell Button */}
                          <button
                            className="btn-sell-sm flex items-center gap-1 px-3 py-1.5"
                            onClick={() => setTrade({ stock: { ...s, price }, mode: "SELL" })}
                            title={`Sell ${s.symbol}`}
                          >
                            <TrendingDown size={12} /> Sell
                          </button>

                          {/* Remove from current list */}
                          <button
                            className="btn-icon-danger ml-1"
                            title={`Remove from ${activeTab}`}
                            onClick={() => handleRemove(s.symbol)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Search & Add Stocks Modal ── */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setSearchModalOpen(false)}
        >
          <div className="glass-panel w-full max-w-xl p-6 border-indigo-500/40 relative shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search size={16} className="text-indigo-400" />
                  Add Stocks to "{activeTab}"
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Search across 50 Nifty universe equities</p>
              </div>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search by symbol (e.g. INFY), company or sector..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-white placeholder:text-slate-500"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-slate-300">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Results List */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 max-h-96">
              {searchResults.length > 0 ? (
                searchResults.map(s => {
                  const already = activeSymbols.has(s.symbol);
                  const live = prices[s.symbol];
                  const price = live?.price ?? s.price ?? 0;
                  const chg   = live?.changePercent ?? s.changePercent ?? 0;
                  const up    = Number(chg) >= 0;
                  const score = s.aiScore ?? 0;

                  return (
                    <div
                      key={s.symbol}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/80 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                          style={{ background: getSectorColor(s.sector) }}
                        >
                          {s.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-2">
                            {s.symbol}
                            {score > 0 && (
                              <span className="text-[10px] font-semibold text-indigo-400 font-mono">
                                AI: {score}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {s.companyName} · {s.sector}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold font-mono text-white text-xs">{fmt(price)}</div>
                          <div className={`text-[10px] font-mono font-bold ${up ? "text-emerald-400" : "text-rose-400"}`}>
                            {up ? "+" : ""}{Number(chg).toFixed(2)}%
                          </div>
                        </div>

                        <button
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            already
                              ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                          }`}
                          disabled={already}
                          onClick={() => handleAdd(s.symbol)}
                        >
                          {already ? (
                            <>
                              <Check size={12} /> Added
                            </>
                          ) : (
                            <>
                              <Plus size={12} /> Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No stocks match "{searchQuery}". Try searching for another ticker.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Trade Modal (Buy/Sell execution) ── */}
      {trade && (
        <TradeModal
          stock={trade.stock}
          mode={trade.mode}
          livePrice={prices[trade.stock.symbol]?.price ?? trade.stock.price}
          walletBalance={walletBal}
          userId={userId}
          onClose={() => setTrade(null)}
          onSuccess={() => {
            toast(`Successfully executed ${trade.mode} order for ${trade.stock.symbol}!`);
            setTrade(null);
            onTradeSuccess?.();
          }}
        />
      )}

    </div>
  );
}
