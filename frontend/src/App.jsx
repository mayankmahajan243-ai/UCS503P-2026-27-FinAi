import React, { useState } from "react";
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
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Watchlist from "./pages/Watchlist";
import AIInsights from "./pages/AIInsights";
import Alerts from "./pages/Alerts";


const nav = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/portfolio",
    label: "Portfolio",
    icon: Wallet,
  },
  {
    to: "/watchlist",
    label: "Watchlist",
    icon: LineChart,
  },
  {
    to: "/ai",
    label: "AI Insights",
    icon: BrainCircuit,
  },
  {
    to: "/alerts",
    label: "Price Alerts",
    icon: Bell,
  },
];


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

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

          {/* BRAND */}
          <div className="brand">

            <div className="brand-mark">
              F
            </div>

            <div className="brand-text">
              <strong>FinSight</strong>
              <span>AI Wealth Lab</span>
            </div>

          </div>


          {/* NAVIGATION */}
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

                  <Icon
                      className="nav-icon"
                      size={20}
                      strokeWidth={1.8}
                  />

                  <span className="nav-label">
                {label}
              </span>

                </NavLink>
            ))}

          </nav>


          {/* SIDEBAR BOTTOM */}
          <div className="sidebar-bottom">

            {/* AI ENGINE */}
            <div className="ai-status">

              <BrainCircuit
                  size={20}
                  strokeWidth={1.8}
              />

              <div className="nav-label">
                <b>AI Engine</b>
                <span>Online · v1 baseline</span>
              </div>

            </div>


            {/* SETTINGS */}
            <button className="nav-item ghost">

              <Settings
                  size={20}
                  strokeWidth={1.8}
              />

              <span className="nav-label">
              Settings
            </span>

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
            aria-label={
              sidebarOpen
                  ? "Close sidebar"
                  : "Open sidebar"
            }
            title={
              sidebarOpen
                  ? "Close sidebar"
                  : "Open sidebar"
            }
        >

          {sidebarOpen ? (
              <ChevronLeft
                  size={21}
                  strokeWidth={2.5}
              />
          ) : (
              <ChevronRight
                  size={21}
                  strokeWidth={2.5}
              />
          )}

        </button>


        {/* =====================================
          MAIN APPLICATION
      ====================================== */}

        <main className="main">

          {/* TOP BAR */}
          <header className="topbar">

            <div className="topbar-heading">

            <span className="eyebrow">
              INVESTMENT INTELLIGENCE
            </span>

              <h1>
                Good evening, investor.
              </h1>

            </div>


            <div className="top-actions">

              <button
                  type="button"
                  className="icon-btn"
                  aria-label="Search"
              >
                <Search
                    size={20}
                    strokeWidth={2}
                />
              </button>


              <div className="avatar">
                MM
              </div>

            </div>

          </header>


          {/* =====================================
            ROUTES
        ====================================== */}

          <div className="page-content">

            <Routes>

              <Route
                  path="/"
                  element={<Dashboard />}
              />

              <Route
                  path="/portfolio"
                  element={<Portfolio />}
              />

              <Route
                  path="/watchlist"
                  element={<Watchlist />}
              />

              <Route
                  path="/ai"
                  element={<AIInsights />}
              />

              <Route
                  path="/alerts"
                  element={<Alerts />}
              />

            </Routes>

          </div>

        </main>

      </div>
  );
}


export default App;