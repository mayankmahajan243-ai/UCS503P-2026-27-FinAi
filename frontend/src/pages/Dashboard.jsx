import React, { useEffect, useMemo, useState } from "react";
import { BrainCircuit, ShieldCheck, TrendingUp, AlertTriangle, RefreshCw, Wallet, Zap, BarChart3 } from "lucide-react";
import { getAIInsights, getPortfolio } from "../api";
import StatCard from "../components/StatCard";
import SectionHeader from "../components/SectionHeader";
import TradeModal from "../components/TradeModal";
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

const SECTOR_COLORS = {
  "Technology": "#6366f1", "Finance": "#0ea5e9", "Energy": "#f59e0b",
  "Consumer Goods": "#10b981", "Automotive": "#f43f5e", "Healthcare": "#a855f7",
  "Metals & Mining": "#64748b", "Infrastructure": "#0891b2", "Telecom": "#84cc16",
};
const getColor = (sector) => SECTOR_COLORS[sector] || "#6366f1";

const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Simulate 30-day portfolio history from current value
function buildHistory(netWorth) {
  const data = []; let val = netWorth * 0.88;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    val = val * (1 + (Math.random() * 0.018 - 0.006));
    data.push({ date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), value: Math.round(val) });
  }
  data.push({ date: "Today", value: Math.round(netWorth) });
  return data;
}

export default function Dashboard({ stocks = [], prices = {}, walletBal = 1000000 }) {
  const [portfolio, setPortfolio] = useState(null);
  const [ai, setAi]               = useState(null);
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState(null);
  const [trade, setTrade]          = useState(null); // { stock, mode }
  const [histRange, setHistRange]  = useState("1M");

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const [p, a] = await Promise.all([getPortfolio("demo-user"), getAIInsights("demo-user")]);
      setPortfolio(p); setAi(a);
    } catch (e) { setError(e?.response?.data?.message || e.message || "Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const invested     = Number(portfolio?.invested     || 0);
  const currentValue = Number(portfolio?.currentValue || 0);
  const cashBalance  = Number(walletBal);
  const netWorth     = currentValue + cashBalance;
  const profitLoss   = currentValue - invested;
  const profitPct    = invested === 0 ? 0 : (profitLoss / invested * 100);

  const history = useMemo(() => buildHistory(netWorth), [Math.round(netWorth / 1000)]);

  const topStocks = useMemo(() =>
    [...stocks].sort((a, b) => Number(b.aiScore || 0) - Number(a.aiScore || 0)).slice(0, 6),
    [stocks]);

  const heatStocks = useMemo(() =>
    [...stocks].sort((a, b) => Number(b.changePercent || 0) - Number(a.changePercent || 0)),
    [stocks]);

  // Allocation donut
  const holdings = portfolio?.holdings || [];
  const allocData = holdings.map(h => ({ name: h.symbol, value: Number(h.marketValue || 1), sector: h.sector }));

  if (loading) return (
    <div className="page full-center">
      <RefreshCw size={36} className="spin" />
      <p style={{ marginTop: 16, opacity: 0.6 }}>Loading your FinSight dashboard…</p>
    </div>
  );
  if (error) return (
    <div className="page full-center">
      <div className="panel" style={{ maxWidth: 500, textAlign: "center", padding: 40 }}>
        <AlertTriangle size={40} style={{ marginBottom: 12 }} />
        <h2>Failed to load</h2>
        <p style={{ opacity: 0.6, marginBottom: 20 }}>{error}</p>
        <button className="btn-primary" onClick={load}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="page">

      {/* ── HERO GRID ───────────────────────────────────── */}
      <div className="hero-grid">

        {/* Net Worth card */}
        <div className="hero-card">
          <div className="hero-card-top">
            <div>
              <span className="eyebrow">TOTAL NET WORTH · STOCKS + CASH</span>
              <h2 className="hero-value">{fmt(netWorth)}</h2>
              <div className="hero-pnl">
                <span className={profitLoss >= 0 ? "positive" : "negative"}>
                  {profitLoss >= 0 ? "▲" : "▼"} {fmt(Math.abs(profitLoss))} ({profitPct >= 0 ? "+" : ""}{profitPct.toFixed(2)}%)
                </span>
                <span className="hero-pnl-label">since invested</span>
              </div>
            </div>
            <div className="wallet-badge">
              <div className="wallet-badge-label"><Wallet size={13}/> VIRTUAL CASH</div>
              <div className="wallet-badge-val">{fmt(cashBalance)}</div>
            </div>
          </div>

          {/* Range toggle */}
          <div className="chart-range-row">
            {["1W","1M","3M","1Y"].map(r => (
              <button key={r} className={`range-btn ${histRange === r ? "active" : ""}`} onClick={() => setHistRange(r)}>{r}</button>
            ))}
          </div>

          {/* Portfolio chart */}
          <div className="chart" style={{ height: 210, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1}/>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7896b7" }} axisLine={false} tickLine={false} interval={6}/>
                <YAxis hide/>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "#0d1421", border: "1px solid #1e3a5f", borderRadius: 10 }}/>
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fill="url(#portfolioFill)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Copilot card */}
        <div className="ai-card">
          <div className="ai-card-top"><BrainCircuit size={22}/><span>AI MARKET COPILOT</span></div>
          <h3>{ai?.summary || "Your portfolio shows healthy diversification with strong tech exposure."}</h3>
          <p>AI score blends fundamentals, valuation, momentum, and risk for each stock in your universe.</p>
          <div className="ai-metrics">
            <div className="ai-metric"><span>Confidence</span><b>{ai?.confidence ?? 82}%</b></div>
            <div className="ai-metric"><span>Sentiment</span><b style={{ color: "#10b981" }}>{ai?.marketSentiment || "NEUTRAL"}</b></div>
            <div className="ai-metric"><span>Analyzed</span><b>{ai?.totalStocksAnalysed || stocks.length}</b></div>
          </div>
          <a href="/ai" className="ai-link"><Zap size={15}/> Open AI Lab</a>
        </div>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard label="Invested Equity" value={fmt(invested)} />
        <StatCard label="Available Cash"  value={fmt(cashBalance)} change="Virtual Wallet" />
        <StatCard label="Diversification" value={`${portfolio?.diversificationScore ?? 0}/100`}
          change={Number(portfolio?.diversificationScore || 0) >= 70 ? "Healthy ✓" : "Needs Work"} />
        <StatCard label="Portfolio Risk"  value={`${ai?.riskScore ?? 46}/100`}
          change={Number(ai?.riskScore ?? 46) <= 60 ? "Moderate" : "High"} />
      </div>

      {/* ── CONTENT GRID ────────────────────────────────── */}
      <div className="content-grid">

        {/* Top AI Opportunities */}
        <section className="panel">
          <div className="panel-title">
            <div><span className="eyebrow">AI OPPORTUNITIES</span><h3><BarChart3 size={18}/> Best-scored stocks</h3></div>
            <button className="refresh-button" onClick={load}><RefreshCw size={15}/> Refresh</button>
          </div>
          <div className="ai-table">
            <div className="ai-table-header">
              <span>STOCK</span><span>PRICE</span><span>CHANGE</span><span>AI SCORE</span><span>VERDICT</span><span>ACTION</span>
            </div>
            {topStocks.map(s => {
              const live = prices[s.symbol];
              const price = live?.price ?? s.price ?? 0;
              const chg   = live?.changePercent ?? s.changePercent ?? 0;
              const up    = Number(chg) >= 0;
              const score = s.aiScore ?? 0;
              return (
                <div className="ai-table-row" key={s.symbol}>
                  <div className="stock-name-cell">
                    <div className="stock-avatar small" style={{ background: getColor(s.sector) }}>
                      {s.symbol.slice(0, 2)}
                    </div>
                    <div><strong>{s.symbol}</strong><small>{s.companyName}</small></div>
                  </div>
                  <div>₹{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                  <div className={up ? "positive" : "negative"}>{up ? "+" : ""}{Number(chg).toFixed(2)}%</div>
                  <div><span className={`table-score ${score >= 75 ? "score-excellent" : score >= 60 ? "score-good" : score >= 45 ? "score-medium" : "score-low"}`}>{score}</span></div>
                  <div><span className={`recommendation-badge small ${s.recommendation?.toLowerCase().includes("buy") ? "ai-buy" : s.recommendation?.toLowerCase().includes("hold") ? "ai-hold" : "ai-neutral"}`}>{s.recommendation || "HOLD"}</span></div>
                  <div>
                    <button className="btn-buy-sm" onClick={() => setTrade({ stock: { ...s, price }, mode: "BUY" })}>Buy</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Portfolio Health + Heatmap */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Health */}
          <section className="panel insight-panel">
            <SectionHeader title="Portfolio health" subtitle="Automated diagnostics" />
            <div className="health-item"><ShieldCheck /><div><b>Risk within target</b><span>Aligned with a moderate risk profile.</span></div></div>
            <div className="health-item"><TrendingUp /><div><b>Momentum positive</b>
              <span>{stocks.filter(s => Number((prices[s.symbol]?.changePercent ?? s.changePercent) || 0) > 0).length} stocks trending up.</span>
            </div></div>
            <div className="health-item"><BrainCircuit /><div><b>AI confidence</b><span>Model confidence: {ai?.confidence ?? 82}%</span></div></div>
            <div className="health-item"><ShieldCheck /><div><b>Diversification</b><span>{holdings.length} positions in portfolio.</span></div></div>
          </section>

          {/* Allocation */}
          {allocData.length > 0 && (
            <section className="panel">
              <SectionHeader title="Allocation" subtitle="By market value" />
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>
                      {allocData.map((e, i) => <Cell key={i} fill={getColor(e.sector)} />)}
                    </Pie>
                    <Tooltip formatter={fmt} contentStyle={{ background: "#0d1421", border: "1px solid #1e3a5f", borderRadius: 10 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── MARKET HEATMAP ─────────────────────── */}
      <section className="panel" style={{ marginTop: 24 }}>
        <SectionHeader title="Market heatmap" subtitle="All Nifty 50 stocks · color = momentum" />
        <div className="heatmap-grid">
          {heatStocks.map(s => {
            const live = prices[s.symbol];
            const chg  = Number(live?.changePercent ?? s.changePercent ?? 0);
            const price = live?.price ?? s.price ?? 0;
            const intensity = Math.min(Math.abs(chg) / 2, 1);
            const bg = chg >= 0
              ? `rgba(16,185,129,${0.12 + intensity * 0.45})`
              : `rgba(244,63,94,${0.12 + intensity * 0.45})`;
            return (
              <div key={s.symbol} className="heatmap-cell" style={{ background: bg }}
                onClick={() => setTrade({ stock: { ...s, price }, mode: "BUY" })}>
                <div className="heatmap-sym">{s.symbol}</div>
                <div className={`heatmap-chg ${chg >= 0 ? "positive" : "negative"}`}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}%</div>
                <div className="heatmap-price">₹{Number(price).toLocaleString("en-IN")}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TRADE MODAL ────────────────────────── */}
      {trade && (
        <TradeModal
          stock={trade.stock}
          mode={trade.mode}
          livePrice={prices[trade.stock.symbol]?.price ?? trade.stock.price}
          walletBalance={cashBalance}
          onClose={() => setTrade(null)}
          onSuccess={() => { setTrade(null); load(); }}
        />
      )}
    </div>
  );
}