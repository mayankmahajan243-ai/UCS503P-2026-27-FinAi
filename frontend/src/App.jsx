import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, Route, Routes, Navigate, Link, useNavigate } from "react-router-dom";
import {
  Bell, BrainCircuit, ChevronLeft, ChevronRight,
  LayoutDashboard, LineChart, Search, Settings,
  Wallet, X, User, LogOut, TrendingUp, ArrowUpRight
} from "lucide-react";

import { useAuth } from "./context/AuthContext";
import { getStocks, getWallet } from "./api";
import { ToastContainer, toast } from "./components/Toast";
import MarketTicker from "./components/MarketTicker";
import TradeModal from "./components/TradeModal";
import useLivePrices from "./hooks/useLivePrices";

import Dashboard  from "./pages/Dashboard";
import Portfolio  from "./pages/Portfolio";
import Watchlist  from "./pages/Watchlist";
import AIInsights from "./pages/AIInsights";
import Alerts     from "./pages/Alerts";
import Profile    from "./pages/Profile";
import Login      from "./pages/Login";

const nav = [
  { to: "/",          label: "Dashboard",    icon: LayoutDashboard },
  { to: "/portfolio", label: "Portfolio",    icon: Wallet },
  { to: "/watchlist", label: "Watchlist",    icon: LineChart },
  { to: "/ai",        label: "AI Insights",  icon: BrainCircuit },
  { to: "/alerts",    label: "Price Alerts", icon: Bell },
  { to: "/profile",   label: "My Profile",   icon: User },
];

export default function App() {
  const { user, token, loading, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [allStocks,    setAllStocks]    = useState([]);
  const [walletBal,    setWalletBal]    = useState(1000000);
  const [searchTrade,  setSearchTrade]  = useState(null); // { stock, mode }
  const profileRef = useRef(null);

  const userId = user?.username || "demo-user";

  const refreshWallet = useCallback(() => {
    if (!isLoggedIn) return;
    getWallet(userId)
      .then(d => {
        if (d?.balance != null) setWalletBal(Number(d.balance));
      })
      .catch(() => {});
  }, [isLoggedIn, userId]);

  // Fetch stocks for search + live ticker
  useEffect(() => {
    if (!isLoggedIn) return;
    getStocks()
      .then(d => setAllStocks(Array.isArray(d) ? d : (d?.data || [])))
      .catch(console.error);
  }, [isLoggedIn]);

  // Poll wallet every 4s so it stays fresh after trades
  useEffect(() => {
    refreshWallet();
    const id = setInterval(refreshWallet, 4000);
    return () => clearInterval(id);
  }, [refreshWallet]);

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

  const formatMoney = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) return <div className="full-center"><span className="login-spinner lg" /></div>;
  if (!isLoggedIn) return <Login />;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    toast("Logged out successfully.", "success");
    navigate("/login");
  };

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
              <span>Online · v2.0 Live Ticks</span>
            </div>
          </div>
          <NavLink to="/profile" className="nav-item ghost">
            <Settings size={20} strokeWidth={1.8} />
            <span className="nav-label">Settings & Profile</span>
          </NavLink>
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
            <h1>{greeting}, {user?.displayName?.split(" ")[0] ?? "Investor"}.</h1>
          </div>

          <div className="top-actions" style={{ position: "relative" }} ref={profileRef}>
            {/* Search */}
            <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} title="Search Nifty Stocks">
              <Search size={19} strokeWidth={2} />
            </button>

            {/* Virtual Cash Pill in Topbar */}
            <Link to="/profile" className="topbar-wallet-pill" title="Virtual Wallet Cash — Click to Manage">
              <Wallet size={15} />
              <span className="wallet-pill-label">Cash:</span>
              <strong className="wallet-pill-val">{formatMoney(walletBal)}</strong>
            </Link>

            {/* NSE live dot */}
            <div className="nse-badge"><span className="live-dot" />NSE 800ms</div>

            {/* Profile avatar */}
            <div className="avatar" onClick={() => setProfileOpen(p => !p)} title="Profile & Wallet Menu">
              {user?.displayName
                ? user.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                : "MM"}
            </div>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar-lg">
                    {user?.displayName
                      ? user.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                      : "MM"}
                  </div>
                  <div>
                    <div className="profile-name">{user?.displayName || "Mayank Mahajan"}</div>
                    <div className="profile-username">@{user?.username || "demo-user"}</div>
                  </div>
                </div>
                <div className="profile-wallet">
                  <div className="profile-wallet-label"><Wallet size={13} /> VIRTUAL CASH BALANCE</div>
                  <div className="profile-wallet-value">{formatMoney(walletBal)}</div>
                </div>
                <div className="profile-actions">
                  <Link to="/profile" className="profile-action" onClick={() => setProfileOpen(false)}>
                    <User size={15}/> View Profile & Wallet
                  </Link>
                  <Link to="/portfolio" className="profile-action" onClick={() => setProfileOpen(false)}>
                    <Wallet size={15}/> My Portfolio
                  </Link>
                  <button className="profile-action danger" onClick={handleLogout}>
                    <LogOut size={15}/> Sign Out
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
                  placeholder="Search 50 Nifty stocks by ticker or name…"
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
                      <div className="search-result-price" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div>
                          <div className="search-result-val">₹{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div className={up ? "positive" : "negative"}>{up ? "+" : ""}{Number(chg).toFixed(2)}%</div>
                        </div>
                        <button
                          className="btn-buy-sm"
                          onClick={() => {
                            setSearchTrade({ stock: { ...s, price }, mode: "BUY" });
                            setSearchOpen(false);
                          }}
                        >
                          Trade
                        </button>
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

        {/* ── SEARCH TRADE MODAL ────────────────── */}
        {searchTrade && (
          <TradeModal
            stock={searchTrade.stock}
            mode={searchTrade.mode}
            livePrice={prices[searchTrade.stock.symbol]?.price ?? searchTrade.stock.price}
            walletBalance={walletBal}
            userId={userId}
            onClose={() => setSearchTrade(null)}
            onSuccess={() => {
              setSearchTrade(null);
              refreshWallet();
            }}
          />
        )}

        {/* ── ROUTES ──────────────────────────── */}
        <div className="page-content">
          <Routes>
            <Route path="/"          element={<Dashboard stocks={allStocks} prices={prices} walletBal={walletBal} onWalletUpdated={refreshWallet} />} />
            <Route path="/portfolio" element={<Portfolio prices={prices} walletBal={walletBal} onTradeSuccess={refreshWallet} />} />
            <Route path="/watchlist" element={<Watchlist prices={prices} allStocks={allStocks} walletBal={walletBal} userId={userId} onTradeSuccess={refreshWallet} />} />
            <Route path="/ai"        element={<AIInsights />} />
            <Route path="/alerts"    element={<Alerts prices={prices} allStocks={allStocks} />} />
            <Route path="/profile"   element={<Profile onWalletUpdated={refreshWallet} />} />
            <Route path="/login"     element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}