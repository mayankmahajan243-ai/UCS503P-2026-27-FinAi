import React, { useState, useEffect, useRef } from "react";
import { executeBuy, executeSell } from "../api";
import { X, TrendingUp, TrendingDown, Zap, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export default function TradeModal({ stock, mode, livePrice, walletBalance, userId = "demo-user", onClose, onSuccess }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success, message }
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef(null);

  const isBuy  = mode === "BUY";
  const price  = livePrice ?? stock?.price ?? 0;
  const total  = (Number(price) * qty).toFixed(2);
  const canAfford = isBuy ? Number(total) <= (walletBalance ?? 0) : true;

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Escape key closes
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleTrade = async () => {
    if (qty < 1) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    try {
      const fn = isBuy ? executeBuy : executeSell;
      await fn(userId, stock.symbol, qty);
      setResult({ success: true, message: `Successfully ${isBuy ? "bought" : "sold"} ${qty} × ${stock.symbol}` });
      setTimeout(() => { onSuccess?.(); onClose(); }, 1800);
    } catch (err) {
      setResult({ success: false, message: err?.response?.data?.message || err.message || "Trade failed" });
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`trade-modal ${isBuy ? "modal-buy" : "modal-sell"}`}>

        {/* Header */}
        <div className="trade-modal-header">
          <div className="trade-modal-title">
            <div className="trade-modal-icon">{isBuy ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}</div>
            <div>
              <div className="trade-modal-action">{isBuy ? "BUY ORDER" : "SELL ORDER"}</div>
              <div className="trade-modal-stock">{stock?.symbol} · {stock?.companyName}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20}/></button>
        </div>

        {result ? (
          <div className={`trade-result ${result.success ? "result-success" : "result-error"}`}>
            {result.success ? <CheckCircle size={36}/> : <AlertTriangle size={36}/>}
            <p>{result.message}</p>
          </div>
        ) : (
          <>
            {/* Live price */}
            <div className="trade-price-row">
              <span className="trade-label">LIVE PRICE</span>
              <span className="trade-live-price">₹{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Quantity */}
            <div className="trade-qty-row">
              <span className="trade-label">QUANTITY</span>
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <input
                  ref={inputRef}
                  type="number"
                  min={1}
                  value={qty}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            </div>

            {/* Total */}
            <div className="trade-total-row">
              <span className="trade-label">{isBuy ? "TOTAL COST" : "TOTAL REVENUE"}</span>
              <span className="trade-total">₹{Number(total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Wallet hint */}
            {isBuy && (
              <div className={`trade-wallet-hint ${canAfford ? "" : "insufficient"}`}>
                <span>Available Cash: ₹{Number(walletBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                {!canAfford && <span className="insufficient-tag">⚠ Insufficient funds</span>}
              </div>
            )}

            {/* CTA */}
            {confirming && (
              <div className="trade-confirm-banner">
                <AlertTriangle size={16} />
                <span>You are about to {isBuy ? "buy" : "sell"} <b>{qty} × {stock.symbol}</b> for <b>₹{Number(total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b>. Click again to confirm.</span>
              </div>
            )}
            <button
              className={`trade-cta ${confirming ? "cta-confirm" : isBuy ? "cta-buy" : "cta-sell"}`}
              onClick={handleTrade}
              disabled={loading || (isBuy && !canAfford)}
            >
              {loading ? <span className="login-spinner"/> : confirming ? <><ShieldCheck size={17}/> Yes, Execute Trade</> : <><Zap size={17}/> {isBuy ? "Buy" : "Sell"} {stock.symbol}</>}
            </button>
            {confirming && (
              <button className="trade-cancel-btn" onClick={() => setConfirming(false)}>Cancel</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
