import React, { useState, useEffect, useRef } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

import {
  Bell,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LineChart,
  Search,
  Settings,
  Wallet,
  X,
  User,
  LogOut,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import AIInsights from "./pages/AIInsights";
import Alerts from "./pages/Alerts";
import { getStocks } from "./api";


const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portfolio", label: "Portfolio", icon: Wallet },
  { to: "/watchlist", label: "Watchlist", icon: LineChart },
  { to: "/ai", label: "AI Insights", icon: BrainCircuit },
  { to: "/alerts", label: "Price Alerts", icon: Bell },
];


export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allStocks, setAllStocks] = useState([]);

  const profileRef = useRef(null);

  // Fetch stocks for the search modal safely
  useEffect(() => {
    getStocks()
        .then((data) => {
          const list = Array.isArray(data) ? data : (data?.data || []);
          setAllStocks(list);
        })
        .catch((err) => console.error("Failed to load stocks for search", err));
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    alert("Logged out successfully. (Redirect to login can be wired next!)");
  };

  const filteredStocks = allStocks.filter((s) => {
    const symbol = (s.symbol || "").toLowerCase();
    const name = (s.companyName || "").toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    return symbol.includes(q) || name.includes(q);
  });

  return (
      <div
          className={`app-shell ${
              sidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
      >

        {/* =====================================
          SIDEBAR
      ====================================== */}
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
                <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
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

            <button className="nav-item ghost">
              <Settings size={20} strokeWidth={1.8} />
              <span className="nav-label">Settings</span>
            </button>
          </div>
        </aside>

        {/* =====================================
          SIDEBAR TOGGLE
      ====================================== */}
        <button
            type="button"
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <ChevronLeft size={21} strokeWidth={2.5} /> : <ChevronRight size={21} strokeWidth={2.5} />}
        </button>

        {/* =====================================
          MAIN APPLICATION
      ====================================== */}
        <main className="main">

          {/* TOP BAR */}
          <header className="topbar">
            <div className="topbar-heading">
              <span className="eyebrow">INVESTMENT INTELLIGENCE</span>
              <h1>Good evening, investor.</h1>
            </div>

            <div className="top-actions" style={{ position: "relative" }} ref={profileRef}>

              {/* SEARCH BUTTON */}
              <button
                  type="button"
                  className="icon-btn"
                  aria-label="Search"
                  onClick={() => setSearchOpen(true)}
                  title="Search Stocks"
              >
                <Search size={20} strokeWidth={2} />
              </button>

              {/* PROFILE AVATAR (MM) */}
              <div
                  className="avatar"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  style={{ cursor: "pointer", userSelect: "none" }}
                  title="Profile & Virtual Wallet"
              >
                MM
              </div>

              {/* PROFILE DROPDOWN MENU */}
              {profileOpen && (
                  <div style={{
                    position: "absolute",
                    top: "55px",
                    right: "0",
                    width: "280px",
                    background: "#121622",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    zIndex: 1000,
                    color: "#fff"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                        MM
                      </div>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "15px" }}>Mayank Mahajan</div>
                        <div style={{ fontSize: "12px", opacity: 0.6 }}>demo-user</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: "15px", background: "rgba(99, 102, 241, 0.1)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                      <div style={{ fontSize: "11px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}>Virtual Wallet Balance</div>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#818cf8", marginTop: "2px" }}>₹10,00,000.00</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button style={{ display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", color: "#ccc", cursor: "pointer", padding: "8px", borderRadius: "8px", width: "100%", textAlign: "left" }} onClick={() => alert("Logged in as Mayank Mahajan (Thapar Institute)")}>
                        <User size={16} /> Student Profile
                      </button>
                      <button style={{ display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "8px", borderRadius: "8px", width: "100%", textAlign: "left" }} onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
              )}

            </div>
          </header>

          {/* =====================================
            SEARCH MODAL POPUP
        ====================================== */}
          {searchOpen && (
              <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(5px)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "10vh",
                zIndex: 2000
              }}>
                <div style={{
                  background: "#161b26",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "16px",
                  width: "90%",
                  maxWidth: "600px",
                  padding: "24px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                  color: "#fff"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", background: "#0d1117", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <Search size={18} opacity={0.6} />
                      <input
                          type="text"
                          placeholder="Search NIFTY 50 stocks (e.g. RELIANCE, TCS)..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          style={{ background: "none", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "15px" }}
                      />
                    </div>
                    <button onClick={() => setSearchOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginLeft: "12px", opacity: 0.7 }}>
                      <X size={22} />
                    </button>
                  </div>

                  <div style={{ maxHeight: "350px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filteredStocks.length > 0 ? (
                        filteredStocks.map((stock) => (
                            <div key={stock.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div>
                                <div style={{ fontWeight: "600" }}>{stock.symbol}</div>
                                <div style={{ fontSize: "12px", opacity: 0.6 }}>{stock.companyName} ({stock.sector})</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: "600" }}>₹{stock.price}</div>
                                <div style={{ fontSize: "12px", color: Number(stock.changePercent) >= 0 ? "#4ade80" : "#f87171" }}>
                                  {Number(stock.changePercent) >= 0 ? "+" : ""}{stock.changePercent}%
                                </div>
                              </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: "center", padding: "30px", opacity: 0.5 }}>
                          No matching stocks found in NIFTY 50 universe.
                        </div>
                    )}
                  </div>
                </div>
              </div>
          )}

          {/* =====================================
            ROUTES
        ====================================== */}
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/ai" element={<AIInsights />} />
              <Route path="/alerts" element={<Alerts />} />
            </Routes>
          </div>

        </main>
      </div>
  );
}