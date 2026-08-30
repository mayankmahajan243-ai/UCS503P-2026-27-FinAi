import React, { useEffect, useState, useCallback } from "react";
import { getAlerts, createAlert, deleteAlert } from "../api";
import SectionHeader from "../components/SectionHeader";
import { toast } from "../components/Toast";
import { Bell, BellOff, Plus, Trash2, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

const fmt = (v) => `₹${Number(v||0).toLocaleString("en-IN",{minimumFractionDigits:2})}`;

export default function Alerts({ prices = {}, allStocks = [] }) {
  const [alerts, setAlerts]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ symbol: "", direction: "ABOVE", targetPrice: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAlerts("demo-user");
      setAlerts(Array.isArray(data) ? data : []);
    } catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.symbol || !form.targetPrice) { toast("Fill all fields", "error"); return; }
    setSubmitting(true);
    try {
      await createAlert("demo-user", form.symbol.toUpperCase(), form.direction, Number(form.targetPrice));
      toast(`Alert created for ${form.symbol}`);
      setForm({ symbol: "", direction: "ABOVE", targetPrice: "" });
      setShowForm(false);
      load();
    } catch (e) { toast(e.message, "error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlert(id);
      toast("Alert deleted");
      load();
    } catch (e) { toast(e.message, "error"); }
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <SectionHeader title="Price Alerts" subtitle="Get notified when stocks cross your target" />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="refresh-button" onClick={() => setShowForm(s => !s)}>
            <Plus size={15}/> New Alert
          </button>
          <button className="refresh-button" onClick={load}><RefreshCw size={15}/> Refresh</button>
        </div>
      </div>

      {/* ── Create alert form ── */}
      {showForm && (
        <div className="panel">
          <SectionHeader title="Create new alert" subtitle="Define a price trigger" />
          <form onSubmit={handleCreate} className="alert-form">
            <div className="alert-form-row">
              <div className="login-field" style={{ flex: 2 }}>
                <label>Stock Symbol</label>
                <select value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} required>
                  <option value="">— Select Stock —</option>
                  {allStocks.map(s => (
                    <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.companyName}</option>
                  ))}
                </select>
              </div>
              <div className="login-field">
                <label>Direction</label>
                <select value={form.direction} onChange={e => setForm(f => ({ ...f, direction: e.target.value }))}>
                  <option value="ABOVE">ABOVE ↑</option>
                  <option value="BELOW">BELOW ↓</option>
                </select>
              </div>
              <div className="login-field" style={{ flex: 1.5 }}>
                <label>Target Price (₹)</label>
                <input
                  type="number" step="0.01" min="0.01"
                  placeholder="e.g. 1350.00"
                  value={form.targetPrice}
                  onChange={e => setForm(f => ({ ...f, targetPrice: e.target.value }))}
                  required
                />
              </div>
            </div>
            {form.symbol && prices[form.symbol] && (
              <div className="alert-current-price">
                Current live price of {form.symbol}: <b>{fmt(prices[form.symbol]?.price)}</b>
              </div>
            )}
            <button type="submit" className="login-btn" style={{ marginTop: 12, maxWidth: 260 }} disabled={submitting}>
              {submitting ? <span className="login-spinner"/> : <><Bell size={16}/> Set Alert</>}
            </button>
          </form>
        </div>
      )}

      {/* ── Alerts list ── */}
      {loading ? (
        <div className="full-center" style={{ minHeight: 240 }}><RefreshCw size={28} className="spin"/></div>
      ) : alerts.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <BellOff size={44} opacity={0.3}/>
            <p>No alerts set. Click <b>New Alert</b> to create one.</p>
          </div>
        </div>
      ) : (
        <section className="panel" style={{ marginTop: 0 }}>
          <div className="alerts-list">
            {alerts.map(a => {
              const live    = prices[a.symbol];
              const current = live?.price ?? Number(a.currentPrice ?? 0);
              const isAbove = a.direction === "ABOVE";
              const triggered = a.triggered;
              return (
                <div key={a.id} className={`alert-row ${triggered ? "alert-triggered" : ""}`}>
                  <div className={`alert-icon ${triggered ? "triggered-icon" : ""}`}>
                    {triggered ? <CheckCircle size={22}/> : <Bell size={22}/>}
                  </div>
                  <div className="alert-info">
                    <div className="alert-title">
                      <b>{a.symbol}</b>
                      <span className={`alert-dir-badge ${isAbove ? "dir-above" : "dir-below"}`}>
                        {isAbove ? "ABOVE ↑" : "BELOW ↓"}
                      </span>
                      {triggered && <span className="triggered-badge"><AlertTriangle size={13}/> TRIGGERED</span>}
                    </div>
                    <div className="alert-prices">
                      <span>Target: <b>{fmt(a.targetPrice)}</b></span>
                      <span>·</span>
                      <span>Current: <b>{fmt(current)}</b></span>
                      <span>·</span>
                      <span className={isAbove
                        ? (Number(current) >= Number(a.targetPrice) ? "positive" : "muted")
                        : (Number(current) <= Number(a.targetPrice) ? "positive" : "muted")
                      }>
                        {isAbove
                          ? `${fmt(Math.abs(Number(a.targetPrice) - Number(current)))} ${Number(current) >= Number(a.targetPrice) ? "over target" : "to target"}`
                          : `${fmt(Math.abs(Number(current) - Number(a.targetPrice)))} ${Number(current) <= Number(a.targetPrice) ? "under target" : "above target"}`
                        }
                      </span>
                    </div>
                  </div>
                  <div className="alert-progress">
                    <div className="alert-progress-bar">
                      <div className="alert-progress-fill" style={{
                        width: `${Math.min(100, (Number(current) / Number(a.targetPrice)) * 100)}%`,
                        background: triggered ? "#10b981" : "#6366f1"
                      }}/>
                    </div>
                  </div>
                  <button className="btn-icon-danger" title="Delete alert" onClick={() => handleDelete(a.id)}>
                    <Trash2 size={16}/>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
