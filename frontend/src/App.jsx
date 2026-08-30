import React, { useState, useEffect, useRef } from "react";
import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import {
  Bell, BrainCircuit, ChevronLeft, ChevronRight,
  LayoutDashboard, LineChart, Search, Settings,
  Wallet, X, User, LogOut, TrendingUp,
} from "lucide-react";

import { useAuth } from "./context/AuthContext";
import { getStocks, getWallet } from "./api";
import { ToastContainer } from "./components/Toast";
import MarketTicker from "./components/MarketTicker";
import useLivePrices from "./hooks/useLivePrices";

import Dashboard  from "./pages/Dashboard";
import Portfolio  from "./pages/Portfolio";
import Watchlist  from "./pages/Watchlist";
import AIInsights from "./pages/AIInsights";
import Alerts     from "./pages/Alerts";
import Login      from "./pages/Login";

const nav = [
  { to: "/",          label: "Dashboard",    icon: LayoutDashboard },
  { to: "/portfolio", label: "Portfolio",    icon: Wallet },
  { to: "/watchlist", label: "Watchlist",    icon: LineChart },
  { to: "/ai",        label: "AI Insights",  icon: BrainCircuit },
  { to: "/alerts",    label: "Price Alerts", icon: Bell },
];

export default function App() {
  const { user, token, loading, logout, isLoggedIn } = useAuth();
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [allStocks,    setAllStocks]    = useState([]);
  const [walletBal,    setWalletBal]    = useState(1000000);
  const profileRef = useRef(null);

  // Fetch stocks for search + live ticker
  useEffect(() => {
    if (!isLoggedIn) return;
    getStocks()
      .then(d => setAllStocks(Array.isArray(d) ? d : (d?.data || [])))
      .catch(console.error);
  }, [isLoggedIn]);

  // Poll wallet every 5s so it stays fresh after trades
  useEffect(() => {
    if (!isLoggedIn) return;
    const refresh = () => getWallet("demo-user").then(d => setWalletBal(d?.balance ?? 1000000)).catch(() => {});
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [isLoggedIn]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const { prices } = useLivePrices(allStocks);

  const filteredStocks = allStocks.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    return (s.symbol || "").toLowerCase().includes(q) || (s.companyName || "").toLowerCase().includes(q);
  });

  const formatMoney = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  if (loading) return <div className="full-center"><span className="login-spinner lg" /></div>;
  if (!isLoggedIn) return <Login />;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <ToastContainer />

      {/* ── SIDEBAR ─────────────────────────────── */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">F</div>
          <div className="brand-text">
            <strong>FinSight</strong>
            <span>AI Wealth Lab</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <Icon className="nav-icon" size={20} strokeWidth={1.8} />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="ai-status">
            <BrainCircuit size={20} strokeWidth={1.8} />
            <div className="nav-label">
              <b>AI Engine</b>
              <span>Online · v1 baseline</span>
            </div>
          </div>
          <button className="nav-item ghost"><Settings size={20} strokeWidth={1.8} /><span className="nav-label">Settings</span></button>
        </div>
      </aside>

      {/* ── SIDEBAR TOGGLE ───────────────────────── */}
      <button type="button" className="sidebar-toggle" onClick={() => setSidebarOpen(p => !p)}>
        {sidebarOpen ? <ChevronLeft size={21} strokeWidth={2.5}/> : <ChevronRight size={21} strokeWidth={2.5}/>}
      </button>

      {/* ── MAIN ────────────────────────────────── */}
      <main className="main">

        {/* ── Market ticker ── */}
        <MarketTicker stocks={allStocks} prices={prices} />

        {/* ── Topbar ── */}
        <header className="topbar">
          <div className="topbar-heading">
            <span className="eyebrow">INVESTMENT INTELLIGENCE PLATFORM</span>
            <h1>{greeting}, {user?.displayName?.split(" ")[0] ?? "investor"}.</h1>
          </div>

          <div className="top-actions" style={{ position: "relative" }} ref={profileRef}>
            {/* Search */}
            <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} title="Search Stocks">
              <Search size={20} strokeWidth={2} />
            </button>

            {/* NSE live dot */}
            <div className="nse-badge"><span className="live-dot" />NSE LIVE</div>

            {/* Profile avatar */}
            <div className="avatar" onClick={() => setProfileOpen(p => !p)} title="Profile & Wallet">
              {user?.displayName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "MM"}
            </div>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar-lg">{user?.displayName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="profile-name">{user?.displayName}</div>
                    <div className="profile-username">@{user?.username}</div>
                  </div>
                </div>
                <div className="profile-wallet">
                  <div className="profile-wallet-label"><Wallet size={13} /> VIRTUAL WALLET</div>
                  <div className="profile-wallet-value">{formatMoney(walletBal)}</div>
                </div>
                <div className="profile-actions">
                  <button className="profile-action" onClick={() => setProfileOpen(false)}>
                    <User size={15}/> My Portfolio
                  </button>
                  <button className="profile-action danger" onClick={() => { setProfileOpen(false); logout(); }}>
                    <LogOut size={15}/> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── SEARCH MODAL ─────────────────────── */}
        {searchOpen && (
          <div className="modal-overlay search-overlay" onClick={e => e.target === e.currentTarget && setSearchOpen(false)}>
            <div className="search-modal">
              <div className="search-input-wrap">
                <Search size={18} opacity={0.5} />
                <input
                  type="text"
                  placeholder="Search Nifty 50 stocks by ticker or name…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button className="modal-close" onClick={() => setSearchOpen(false)}><X size={20}/></button>
              </div>
              <div className="search-results">
                {filteredStocks.length > 0 ? filteredStocks.map(s => {
                  const live = prices[s.symbol];
                  const price = live?.price ?? s.price ?? 0;
                  const chg   = live?.changePercent ?? s.changePercent ?? 0;
                  const up    = Number(chg) >= 0;
                  return (
                    <div key={s.symbol} className="search-result-row">
                      <div className="search-result-info">
                        <div className="search-result-symbol">{s.symbol}</div>
                        <div className="search-result-name">{s.companyName} · {s.sector}</div>
                      </div>
                      <div className="search-result-price">
                        <div className="search-result-val">₹{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                        <div className={up ? "positive" : "negative"}>{up ? "+" : ""}{Number(chg).toFixed(2)}%</div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="search-empty">No stocks matched "{searchQuery}"</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ROUTES ──────────────────────────── */}
        <div className="page-content">
          <Routes>
            <Route path="/"          element={<Dashboard stocks={allStocks} prices={prices} walletBal={walletBal} />} />
            <Route path="/portfolio" element={<Portfolio prices={prices} walletBal={walletBal} onTradeSuccess={() => getWallet("demo-user").then(d => setWalletBal(d?.balance ?? walletBal)).catch(()=>{})} />} />
            <Route path="/watchlist" element={<Watchlist prices={prices} allStocks={allStocks} walletBal={walletBal} />} />
            <Route path="/ai"        element={<AIInsights />} />
            <Route path="/alerts"    element={<Alerts prices={prices} allStocks={allStocks} />} />
            <Route path="/login"     element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}