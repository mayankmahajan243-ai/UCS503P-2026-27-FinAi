import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, ShieldCheck, TrendingUp, AlertTriangle, RefreshCw, Wallet, Zap, BarChart3, ArrowUpRight } from "lucide-react";
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

const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Range-specific realistic portfolio historical data simulation
function buildHistory(netWorth, range = "1M") {
  const data = [];
  let points = 30;
  let intervalDays = 1;
  let baseMultiplier = 0.93;

  if (range === "1W") {
    points = 7;
    intervalDays = 1;
    baseMultiplier = 0.985;
  } else if (range === "1M") {
    points = 30;
    intervalDays = 1;
    baseMultiplier = 0.93;
  } else if (range === "3M") {
    points = 45;
    intervalDays = 2;
    baseMultiplier = 0.86;
  } else if (range === "1Y") {
    points = 52;
    intervalDays = 7;
    baseMultiplier = 0.74;
  }

  let val = (netWorth > 0 ? netWorth : 1000000) * baseMultiplier;
  for (let i = points - 1; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - (i * intervalDays));
    val = val * (1 + (Math.sin(i * 0.45) * 0.015 + ((i % 3 === 0 ? 1 : -0.5) * 0.006)));
    const dateLabel = range === "1W"
      ? d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })
      : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    data.push({ date: dateLabel, value: Math.round(val) });
  }
  data.push({ date: "Live", value: Math.round(netWorth > 0 ? netWorth : 1000000) });
  return data;
}

export default function Dashboard({ stocks = [], prices = {}, walletBal = 1000000, onWalletUpdated }) {
  const [portfolio, setPortfolio] = useState(null);
  const [ai, setAi]               = useState(null);
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState(null);
  const [trade, setTrade]          = useState(null); // { stock, mode }
  const [histRange, setHistRange]  = useState("1M");

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const [p, a] = await Promise.all([
        getPortfolio("demo-user").catch(() => null),
        getAIInsights("demo-user").catch(() => null)
      ]);
      setPortfolio(p);
      setAi(a);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Compute live holdings & values taking live WebSocket price into account
  const holdings = portfolio?.holdings || [];
  let liveHoldingsValue = 0;
  holdings.forEach(h => {
    const live = prices[h.symbol];
    const lp = live?.price ?? Number(h.currentPrice ?? h.averagePrice ?? 0);
    liveHoldingsValue += lp * Number(h.quantity ?? 0);
  });

  const invested     = Number(portfolio?.invested || 0);
  const currentValue = liveHoldingsValue > 0 ? liveHoldingsValue : Number(portfolio?.currentValue || 0);
  const cashBalance  = Number(walletBal ?? portfolio?.cashBalance ?? 1000000);
  const netWorth     = currentValue + cashBalance;
  const profitLoss   = currentValue - invested;
  const profitPct    = invested === 0 ? 0 : (profitLoss / invested * 100);

  const history = useMemo(() => buildHistory(netWorth, histRange), [Math.round(netWorth), histRange]);

  const topStocks = useMemo(() =>
    [...stocks].sort((a, b) => Number(b.aiScore || 0) - Number(a.aiScore || 0)).slice(0, 6),
    [stocks]);

  const heatStocks = useMemo(() =>
    [...stocks].sort((a, b) => Number(b.changePercent || 0) - Number(a.changePercent || 0)),
    [stocks]);

  // Allocation donut
  const allocData = holdings.map(h => ({ name: h.symbol, value: Number(h.marketValue || 1), sector: h.sector }));

  if (loading) return (
    <div className="page">
      <div className="hero-grid">
        <div className="hero-card skeleton-pulse" style={{ minHeight: 340 }}>
          <div style={{ padding: 32 }}>
            <div className="skeleton-line" style={{ width: '40%', height: 14, marginBottom: 16 }} />
            <div className="skeleton-line" style={{ width: '60%', height: 32, marginBottom: 12 }} />
            <div className="skeleton-line" style={{ width: '35%', height: 14 }} />
          </div>
          <div style={{ padding: '0 32px', paddingBottom: 32 }}>
            <div className="skeleton-line" style={{ width: '100%', height: 180, borderRadius: 12 }} />
          </div>
        </div>
        <div className="ai-card skeleton-pulse" style={{ minHeight: 340 }}>
          <div style={{ padding: 32 }}>
            <div className="skeleton-line" style={{ width: '50%', height: 14, marginBottom: 20 }} />
            <div className="skeleton-line" style={{ width: '90%', height: 18, marginBottom: 10 }} />
            <div className="skeleton-line" style={{ width: '75%', height: 18, marginBottom: 20 }} />
            <div className="skeleton-line" style={{ width: '80%', height: 14 }} />
          </div>
        </div>
      </div>
      <div className="stats-grid" style={{ marginTop: 20 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="stat-card skeleton-pulse" style={{ minHeight: 100 }}>
            <div style={{ padding: 20 }}>
              <div className="skeleton-line" style={{ width: '60%', height: 12, marginBottom: 12 }} />
              <div className="skeleton-line" style={{ width: '45%', height: 24 }} />
            </div>
          </div>
        ))}
      </div>
      <p style={{ textAlign: 'center', marginTop: 24, opacity: 0.5 }}>
        <RefreshCw size={16} className="spin" style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Connecting to FinSight Market Engine…
      </p>
    </div>
  );

  if (error) return (
    <div className="page full-center">
      <div className="panel" style={{ maxWidth: 500, textAlign: "center", padding: 40 }}>
        <AlertTriangle size={40} style={{ marginBottom: 12 }} />
        <h2>Connection issue</h2>
        <p style={{ opacity: 0.6, marginBottom: 20 }}>{error}</p>
        <button className="btn-primary" onClick={load}>Retry Connection</button>
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
                <span className="hero-pnl-label">equity return</span>
              </div>
            </div>
            <Link to="/profile" className="wallet-badge" title="Click to manage virtual funds in Profile">
              <div className="wallet-badge-label"><Wallet size={13}/> VIRTUAL CASH <ArrowUpRight size={12}/></div>
              <div className="wallet-badge-val">{fmt(cashBalance)}</div>
            </Link>
          </div>

          {/* Range toggle */}
          <div className="chart-range-row">
            {["1W","1M","3M","1Y"].map(r => (
              <button key={r} className={`range-btn ${histRange === r ? "active" : ""}`} onClick={() => setHistRange(r)}>
                {r}
              </button>
            ))}
          </div>

          {/* Portfolio chart */}
          <div className="chart" style={{ height: 210, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.38}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1}/>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7896b7" }} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                <YAxis hide domain={['auto', 'auto']}/>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "#080f1e", border: "1px solid #1e3a5f", borderRadius: 10, color: "#fff" }}/>
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fill="url(#portfolioFill)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Copilot card */}
        <div className="ai-card">
          <div className="ai-card-top"><BrainCircuit size={22}/><span>AI MARKET COPILOT</span></div>
          <h3>{ai?.summary || "Portfolio displays balanced institutional allocations across Indian large-caps."}</h3>
          <p>4-factor real-time intelligence scoring fundamentals, valuation, technical momentum, and volatility risk.</p>
          <div className="ai-metrics">
            <div className="ai-metric"><span>Confidence</span><b>{ai?.confidence ?? 84}%</b></div>
            <div className="ai-metric"><span>Sentiment</span><b style={{ color: "#10b981" }}>{ai?.marketSentiment || "BULLISH"}</b></div>
            <div className="ai-metric"><span>Universe</span><b>{stocks.length > 0 ? stocks.length : 50} Stocks</b></div>
          </div>
          <Link to="/ai" className="ai-link"><Zap size={15}/> Open Full AI Lab</Link>
        </div>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard label="Invested Equity" value={fmt(invested)} change={`${holdings.length} Active Positions`} />
        <StatCard label="Available Virtual Cash" value={fmt(cashBalance)} change="Paper Trading Fund" />
        <StatCard label="Diversification" value={`${portfolio?.diversificationScore ?? 65}/100`}
          change={Number(portfolio?.diversificationScore || 0) >= 60 ? "Strong Mix ✓" : "Needs Rebalancing"} />
        <StatCard label="Portfolio Risk" value={`${ai?.riskScore ?? 42}/100`}
          change={Number(ai?.riskScore ?? 42) <= 50 ? "Moderate-Low Risk" : "High Volatility"} />
      </div>

      {/* ── CONTENT GRID ────────────────────────────────── */}
      <div className="content-grid">

        {/* Top AI Opportunities */}
        <section className="panel">
          <div className="panel-title">
            <div><span className="eyebrow">TOP RANKED OPPORTUNITIES</span><h3><BarChart3 size={18}/> Highest-Scored Nifty Stocks</h3></div>
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
                  <div>₹{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className={up ? "positive" : "negative"}>{up ? "+" : ""}{Number(chg).toFixed(2)}%</div>
                  <div><span className={`table-score ${score >= 75 ? "score-excellent" : score >= 60 ? "score-good" : score >= 45 ? "score-medium" : "score-low"}`}>{score}</span></div>
                  <div><span className={`recommendation-badge small ${s.recommendation?.toLowerCase().includes("buy") ? "ai-buy" : s.recommendation?.toLowerCase().includes("hold") ? "ai-hold" : "ai-neutral"}`}>{s.recommendation || "BUY"}</span></div>
                  <div>
                    <button className="btn-buy-sm" onClick={() => setTrade({ stock: { ...s, price }, mode: "BUY" })}>Trade</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Portfolio Health & Allocation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Health */}
          <section className="panel insight-panel">
            <SectionHeader title="Portfolio diagnostics" subtitle="Real-time automated audit" />
            <div className="health-item"><ShieldCheck /><div><b>Capital Protection</b><span>Virtual wallet provides safe risk-free testing.</span></div></div>
            <div className="health-item"><TrendingUp /><div><b>Live Market Feed</b>
              <span>Real-time price ticks stream every 800ms.</span>
            </div></div>
            <div className="health-item"><BrainCircuit /><div><b>AI Model Accuracy</b><span>Multi-factor confidence: {ai?.confidence ?? 84}%</span></div></div>
            <div className="health-item"><ShieldCheck /><div><b>Diversification</b><span>{holdings.length} active positions in portfolio.</span></div></div>
          </section>

          {/* Allocation */}
          {allocData.length > 0 && (
            <section className="panel">
              <SectionHeader title="Sector Allocation" subtitle="By market value" />
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>
                      {allocData.map((e, i) => <Cell key={i} fill={getColor(e.sector)} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "#0d1421", border: "1px solid #1e3a5f", borderRadius: 10 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── MARKET HEATMAP ─────────────────────── */}
      <section className="panel" style={{ marginTop: 24 }}>
        <SectionHeader title="Nifty 50 Market Heatmap" subtitle="Click any stock to open instant paper trade terminal" />
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
                <div className="heatmap-price">₹{Number(price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
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
          userId="demo-user"
          onClose={() => setTrade(null)}
          onSuccess={() => {
            setTrade(null);
            load();
            onWalletUpdated?.();
          }}
        />
      )}
    </div>
  );
}