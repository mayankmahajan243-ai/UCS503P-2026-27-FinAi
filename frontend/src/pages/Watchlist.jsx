import React, { useEffect, useState, useCallback } from "react";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../api";
import SectionHeader from "../components/SectionHeader";
import TradeModal from "../components/TradeModal";
import { toast } from "../components/Toast";
import { Plus, Trash2, RefreshCw, Search, Eye } from "lucide-react";

const fmt = (v) => `₹${Number(v||0).toLocaleString("en-IN",{minimumFractionDigits:2})}`;

export default function Watchlist({ prices = {}, allStocks = [], walletBal = 1000000 }) {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [trade, setTrade]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWatchlist("demo-user");
      setWatchlist(Array.isArray(data) ? data : []);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (symbol) => {
    try {
      await addToWatchlist("demo-user", symbol);
      toast(`${symbol} added to watchlist`);
      load();
      setSearch(""); setShowSearch(false);
    } catch (e) { toast(e.message, "error"); }
  };

  const handleRemove = async (symbol) => {
    try {
      await removeFromWatchlist("demo-user", symbol);
      toast(`${symbol} removed from watchlist`);
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  const searchResults = allStocks.filter(s => {
    const q = search.trim().toLowerCase();
    return q && ((s.symbol||"").toLowerCase().includes(q) || (s.companyName||"").toLowerCase().includes(q));
  });

  const watchSymbols = new Set(watchlist.map(w => w.symbol));

  return (
    <div className="page">
      <div className="page-header-row">
        <SectionHeader title="Watchlist" subtitle="Track your favourite stocks live" />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="refresh-button" onClick={() => setShowSearch(s => !s)}>
            <Plus size={15}/> Add Stock
          </button>
          <button className="refresh-button" onClick={load}><RefreshCw size={15}/> Refresh</button>
        </div>
      </div>

      {/* ── Add stock search ── */}
      {showSearch && (
        <div className="panel search-add-panel">
          <div className="search-input-wrap">
            <Search size={16} opacity={0.5}/>
            <input type="text" placeholder="Search to add stock…" value={search} onChange={e => setSearch(e.target.value)} autoFocus/>
          </div>
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.slice(0, 8).map(s => {
                const already = watchSymbols.has(s.symbol);
                return (
                  <div key={s.symbol} className="search-result-row">
                    <div className="search-result-info">
                      <div className="search-result-symbol">{s.symbol}</div>
                      <div className="search-result-name">{s.companyName} · {s.sector}</div>
                    </div>
                    <button className={already ? "btn-sell-sm" : "btn-buy-sm"} disabled={already} onClick={() => !already && handleAdd(s.symbol)}>
                      {already ? "Added ✓" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Watchlist table ── */}
      {loading ? (
        <div className="full-center" style={{ minHeight: 260 }}><RefreshCw size={30} className="spin"/></div>
      ) : watchlist.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <Eye size={44} opacity={0.3}/>
            <p>Your watchlist is empty. Click <b>Add Stock</b> to start tracking.</p>
          </div>
        </div>
      ) : (
        <section className="panel" style={{ marginTop: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Symbol</th><th>Company</th><th>Sector</th><th>Price</th><th>Change</th><th>AI Score</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {watchlist.map(s => {
                  if (!s.symbol) return null;
                  const live = prices[s.symbol];
                  const price = live?.price ?? s.price ?? 0;
                  const chg   = live?.changePercent ?? s.changePercent ?? 0;
                  const up    = Number(chg) >= 0;
                  return (
                    <tr key={s.symbol}>
                      <td><strong>{s.symbol}</strong></td>
                      <td>{s.companyName || "—"}</td>
                      <td><span className="sector-tag">{s.sector || "—"}</span></td>
                      <td className="live-price-cell">{fmt(price)}</td>
                      <td className={up ? "positive" : "negative"}>{up ? "+" : ""}{Number(chg).toFixed(2)}%</td>
                      <td>
                        {s.aiScore != null && (
                          <span className={`table-score ${s.aiScore >= 75 ? "score-excellent" : s.aiScore >= 60 ? "score-good" : "score-medium"}`}>{s.aiScore}</span>
                        )}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-buy-sm" onClick={() => setTrade({ stock: { ...s, price }, mode: "BUY" })}>Buy</button>
                          <button className="btn-icon-danger" title="Remove" onClick={() => handleRemove(s.symbol)}><Trash2 size={15}/></button>
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

      {trade && (
        <TradeModal
          stock={trade.stock}
          mode={trade.mode}
          livePrice={prices[trade.stock.symbol]?.price ?? trade.stock.price}
          walletBalance={walletBal}
          onClose={() => setTrade(null)}
          onSuccess={() => { toast("Trade executed!"); setTrade(null); }}
        />
      )}
    </div>
  );
}
