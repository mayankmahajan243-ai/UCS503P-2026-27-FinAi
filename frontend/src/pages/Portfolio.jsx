import React, { useEffect, useState, useCallback } from "react";
import { getPortfolio, getTransactions } from "../api";
import SectionHeader from "../components/SectionHeader";
import TradeModal from "../components/TradeModal";
import { toast } from "../components/Toast";
import { TrendingUp, TrendingDown, RefreshCw, Clock, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SECTOR_COLORS = {
  "Technology":"#6366f1","Finance":"#0ea5e9","Energy":"#f59e0b",
  "Consumer Goods":"#10b981","Automotive":"#f43f5e","Healthcare":"#a855f7",
  "Metals & Mining":"#64748b","Infrastructure":"#0891b2","Telecom":"#84cc16",
};
const getColor = (sector) => SECTOR_COLORS[sector] || "#6366f1";
const fmt = (v) => `₹${Number(v||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

export default function Portfolio({ prices = {}, walletBal = 1000000, onTradeSuccess }) {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trade, setTrade] = useState(null);
  const [activeTab, setActiveTab] = useState("holdings");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([getPortfolio("demo-user"), getTransactions("demo-user")]);
      setPortfolio(p);
      setTransactions(Array.isArray(t) ? t : []);
    } catch (e) { toast(e.message || "Failed to load portfolio", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const holdings = portfolio?.holdings || [];
  const invested  = Number(portfolio?.invested || 0);
  const current   = Number(portfolio?.currentValue || 0);
  const pnl       = current - invested;
  const pnlPct    = invested === 0 ? 0 : (pnl / invested * 100);
  const allocData = holdings.map(h => ({
    name: h.symbol,
    value: Number(h.marketValue || 1),
    sector: "",
  }));

  return (
    <div className="page">
      <div className="page-header-row">
        <SectionHeader title="Portfolio" subtitle="Live holdings, P&L, and trading terminal" />
        <button className="refresh-button" onClick={load}><RefreshCw size={15}/> Refresh</button>
      </div>

      {/* ── Summary bar ── */}
      <div className="portfolio-summary">
        <div className="port-stat">
          <span>INVESTED</span><b>{fmt(invested)}</b>
        </div>
        <div className="port-stat">
          <span>CURRENT VALUE</span><b>{fmt(current)}</b>
        </div>
        <div className="port-stat">
          <span>TOTAL P&L</span>
          <b className={pnl >= 0 ? "positive" : "negative"}>
            {pnl >= 0 ? "▲" : "▼"} {fmt(Math.abs(pnl))} ({pnl >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)
          </b>
        </div>
        <div className="port-stat">
          <span>VIRTUAL CASH</span><b style={{ color: "#6366f1" }}>{fmt(walletBal)}</b>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tab-row">
        <button className={`tab-btn ${activeTab === "holdings" ? "active" : ""}`} onClick={() => setActiveTab("holdings")}>Holdings ({holdings.length})</button>
        <button className={`tab-btn ${activeTab === "history"  ? "active" : ""}`} onClick={() => setActiveTab("history")}>Transaction History ({transactions.length})</button>
        <button className={`tab-btn ${activeTab === "alloc"    ? "active" : ""}`} onClick={() => setActiveTab("alloc")}>Allocation</button>
      </div>

      {loading ? (
        <div className="full-center" style={{ minHeight: 300 }}><RefreshCw size={30} className="spin"/></div>
      ) : activeTab === "holdings" ? (
        <section className="panel" style={{ marginTop: 0 }}>
          {holdings.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={42} opacity={0.3}/>
              <p>No holdings yet. Buy stocks from the Dashboard or Watchlist.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th><th>Qty</th><th>Avg Cost</th>
                    <th>Live Price</th><th>Mkt Value</th><th>P&L</th><th>P&L %</th><th>Alloc</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map(h => {
                    const live     = prices[h.symbol];
                    const lp       = live?.price ?? h.currentPrice ?? h.averagePrice;
                    const mv       = Number(lp) * Number(h.quantity);
                    const holdPnl  = mv - (Number(h.averagePrice) * Number(h.quantity));
                    const holdPct  = Number(h.averagePrice) === 0 ? 0 : (holdPnl / (Number(h.averagePrice) * Number(h.quantity))) * 100;
                    const up       = holdPnl >= 0;
                    return (
                      <tr key={h.symbol}>
                        <td>
                          <div className="stock-name-cell">
                            <div className="stock-avatar small" style={{ background: getColor(h.sector) }}>
                              {h.symbol.slice(0, 2)}
                            </div>
                            <div><strong>{h.symbol}</strong></div>
                          </div>
                        </td>
                        <td>{h.quantity}</td>
                        <td>{fmt(h.averagePrice)}</td>
                        <td className="live-price-cell">
                          {fmt(lp)}
                          <span className={up ? "positive" : "negative"}>{live ? (live.changePercent >= 0 ? "▲" : "▼") : ""}</span>
                        </td>
                        <td>{fmt(mv)}</td>
                        <td className={up ? "positive" : "negative"}>{up ? "+" : ""}{fmt(Math.abs(holdPnl))}</td>
                        <td className={up ? "positive" : "negative"}>{up ? "+" : ""}{holdPct.toFixed(2)}%</td>
                        <td>{h.allocation}%</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-buy-sm" onClick={() => setTrade({ stock: h, mode: "BUY" })}>Buy+</button>
                            <button className="btn-sell-sm" onClick={() => setTrade({ stock: h, mode: "SELL" })}>Sell</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : activeTab === "history" ? (
        <section className="panel" style={{ marginTop: 0 }}>
          {transactions.length === 0 ? (
            <div className="empty-state"><Clock size={42} opacity={0.3}/><p>No transactions yet.</p></div>
          ) : (
            <div className="tx-list">
              {transactions.map(tx => {
                const isBuy = tx.transactionType === "BUY";
                return (
                  <div key={tx.id} className="tx-row">
                    <div className={`tx-icon ${isBuy ? "tx-buy" : "tx-sell"}`}>
                      {isBuy ? <ArrowDownCircle size={22}/> : <ArrowUpCircle size={22}/>}
                    </div>
                    <div className="tx-info">
                      <b>{tx.symbol}</b>
                      <span>{isBuy ? "Bought" : "Sold"} {tx.quantity} shares @ {fmt(tx.executionPrice)}</span>
                    </div>
                    <div className="tx-right">
                      <b className={isBuy ? "negative" : "positive"}>
                        {isBuy ? "-" : "+"}{fmt(Number(tx.executionPrice) * Number(tx.quantity))}
                      </b>
                      <span className="tx-date">{new Date(tx.timestamp).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <div className="content-grid" style={{ marginTop: 0 }}>
          <section className="panel">
            <SectionHeader title="Allocation" subtitle="By market value"/>
            {allocData.length > 0 ? (
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={110} paddingAngle={3}>
                      {allocData.map((e, i) => <Cell key={i} fill={Object.values(SECTOR_COLORS)[i % 9]}/>)}
                    </Pie>
                    <Tooltip formatter={fmt} contentStyle={{ background: "#0d1421", border: "1px solid #1e3a5f", borderRadius: 10 }}/>
                    <Legend/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="empty-state"><p>No holdings to display.</p></div>}
          </section>
          <section className="panel">
            <SectionHeader title="Holdings summary"/>
            {holdings.map(h => {
              const live = prices[h.symbol];
              const lp   = live?.price ?? h.currentPrice ?? h.averagePrice;
              const mv   = Number(lp) * Number(h.quantity);
              const pnl  = mv - (Number(h.averagePrice) * Number(h.quantity));
              return (
                <div key={h.symbol} className="holding-summary-row">
                  <b>{h.symbol}</b>
                  <div className="holding-summary-bar-wrap">
                    <div className="holding-summary-bar" style={{ width: `${h.allocation}%` }}/>
                  </div>
                  <span className={pnl >= 0 ? "positive" : "negative"}>{h.allocation}%</span>
                </div>
              );
            })}
          </section>
        </div>
      )}

      {/* Trade Modal */}
      {trade && (
        <TradeModal
          stock={trade.stock}
          mode={trade.mode}
          livePrice={prices[trade.stock.symbol]?.price ?? trade.stock.price ?? trade.stock.currentPrice}
          walletBalance={walletBal}
          onClose={() => setTrade(null)}
          onSuccess={() => { toast(`Trade executed successfully!`); load(); onTradeSuccess?.(); }}
        />
      )}
    </div>
  );
}
