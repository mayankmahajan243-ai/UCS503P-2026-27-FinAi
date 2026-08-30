import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Shield, Wallet, ArrowUpRight, RotateCcw,
  LogOut, CheckCircle2, TrendingUp, DollarSign, Activity,
  Sparkles, Award, RefreshCw
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { getWallet, getPortfolio, getTransactions } from "../api";
import api from "../api";
import { toast } from "../components/Toast";

export default function Profile({ onWalletUpdated }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const userId = user?.username || "demo-user";

  const loadData = async () => {
    try {
      setLoading(true);
      const [w, p, t] = await Promise.all([
        getWallet(userId).catch(() => ({ balance: 1000000 })),
        getPortfolio(userId).catch(() => null),
        getTransactions(userId).catch(() => [])
      ]);
      setWallet(w);
      setPortfolio(p);
      setTransactions(Array.isArray(t) ? t : []);
    } catch (err) {
      console.error("Failed to load profile details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleDeposit = async (amount = 100000) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/wallet/${userId}/deposit`, { amount });
      if (res.data?.balance != null) {
        setWallet(prev => ({ ...prev, balance: res.data.balance }));
        toast(`Deposited ₹${amount.toLocaleString("en-IN")} virtual cash!`, "success");
        onWalletUpdated?.();
      }
    } catch (err) {
      toast("Failed to deposit virtual funds.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/wallet/${userId}/reset`);
      if (res.data?.balance != null) {
        setWallet(prev => ({ ...prev, balance: res.data.balance }));
        toast("Virtual wallet reset to ₹10,00,000.00!", "success");
        onWalletUpdated?.();
      }
    } catch (err) {
      toast("Failed to reset virtual funds.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast("Logged out successfully.", "success");
    navigate("/login");
  };

  const balance = Number(wallet?.balance ?? 1000000);
  const currentVal = Number(portfolio?.currentValue ?? 0);
  const netWorth = currentVal + balance;

  const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="page profile-page">
      <div className="page-header-row">
        <SectionHeader
          title="Account Profile & Wallet"
          subtitle="Manage your investor credentials, paper trading funds, and session"
        />
        <button className="refresh-button" onClick={loadData} title="Refresh Profile">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="profile-grid">
        {/* ── LEFT: USER IDENTITY CARD ─────────────────────── */}
        <section className="panel profile-card">
          <div className="profile-hero">
            <div className="profile-avatar-xl">
              {user?.displayName
                ? user.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                : "MM"}
            </div>
            <div>
              <h2>{user?.displayName || "Mayank Mahajan"}</h2>
              <p className="profile-user-handle">@{user?.username || "demo-user"}</p>
              <div className="profile-role-badge">
                <Award size={13} /> {user?.role || "INVESTOR"} (AI Paper Trader)
              </div>
            </div>
          </div>

          <div className="profile-details-list">
            <div className="profile-detail-item">
              <div className="detail-icon"><Mail size={16} /></div>
              <div>
                <span>Email Address</span>
                <strong>{user?.email || "mayankmahajan243@gmail.com"}</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <div className="detail-icon"><Shield size={16} /></div>
              <div>
                <span>Account Security</span>
                <strong className="positive">Active · Local Token Auth</strong>
              </div>
            </div>

            <div className="profile-detail-item">
              <div className="detail-icon"><Sparkles size={16} /></div>
              <div>
                <span>AI Wealth Engine</span>
                <strong>FinSight Nifty 50 Real-time v2.0</strong>
              </div>
            </div>
          </div>

          <div className="profile-logout-wrap">
            <button className="logout-btn-full" onClick={handleLogout}>
              <LogOut size={18} /> Sign Out & Return to Login
            </button>
          </div>
        </section>

        {/* ── RIGHT: VIRTUAL WALLET & PAPER TRADING TERMINAL ── */}
        <div className="profile-right-column">
          {/* Virtual Wallet Panel */}
          <section className="panel wallet-management-card">
            <div className="panel-title">
              <div>
                <span className="eyebrow">PAPER TRADING ENGINE</span>
                <h3><Wallet size={18} /> Virtual Wallet Balance</h3>
              </div>
              <div className="wallet-live-badge">
                <span className="live-dot" /> LIVE
              </div>
            </div>

            <div className="wallet-big-display">
              <span className="wallet-big-label">AVAILABLE TRADING CASH</span>
              <h1 className="wallet-big-value">{fmt(balance)}</h1>
              <p className="wallet-big-sub">
                Total Net Worth (Portfolio + Cash): <b>{fmt(netWorth)}</b>
              </p>
            </div>

            <div className="wallet-actions-row">
              <button
                className="wallet-action-btn deposit"
                onClick={() => handleDeposit(100000)}
                disabled={actionLoading}
              >
                <ArrowUpRight size={17} /> Deposit +₹1,00,000 Cash
              </button>

              <button
                className="wallet-action-btn reset"
                onClick={handleReset}
                disabled={actionLoading}
              >
                <RotateCcw size={16} /> Reset to ₹10,00,000
              </button>
            </div>
          </section>

          {/* Quick Statistics Panel */}
          <section className="panel profile-stats-card">
            <div className="panel-title">
              <h3><Activity size={18} /> Account Activity & Performance</h3>
            </div>

            <div className="profile-stats-grid">
              <div className="profile-stat-box">
                <span>TOTAL EXECUTED TRADES</span>
                <strong>{transactions.length}</strong>
                <small>Paper orders logged</small>
              </div>

              <div className="profile-stat-box">
                <span>HOLDINGS POSITIONS</span>
                <strong>{portfolio?.holdings?.length ?? 0}</strong>
                <small>Active Nifty 50 stocks</small>
              </div>

              <div className="profile-stat-box">
                <span>DIVERSIFICATION SCORE</span>
                <strong>{portfolio?.diversificationScore ?? 50}/100</strong>
                <small>Automated AI rating</small>
              </div>

              <div className="profile-stat-box">
                <span>PROFIT / LOSS (PORTFOLIO)</span>
                <strong className={Number(portfolio?.profitLoss ?? 0) >= 0 ? "positive" : "negative"}>
                  {Number(portfolio?.profitLoss ?? 0) >= 0 ? "+" : ""}{fmt(portfolio?.profitLoss ?? 0)}
                </strong>
                <small>{Number(portfolio?.profitPercent ?? 0) >= 0 ? "+" : ""}{(portfolio?.profitPercent ?? 0)}% return</small>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
