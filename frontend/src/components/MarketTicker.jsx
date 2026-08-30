import React from "react";

export default function MarketTicker({ stocks = [], prices = {} }) {
  if (stocks.length === 0) return null;
  // duplicate for seamless loop
  const items = [...stocks, ...stocks];

  return (
    <div className="ticker-strip">
      <div className="ticker-label">NSE LIVE</div>
      <div className="ticker-track">
        <div className="ticker-inner">
          {items.map((s, i) => {
            const liveData = prices[s.symbol];
            const price = liveData?.price ?? s.price ?? 0;
            const chg   = liveData?.changePercent ?? s.changePercent ?? 0;
            const up    = Number(chg) >= 0;
            return (
              <span key={`${s.symbol}-${i}`} className={`ticker-item ${up ? "ticker-up" : "ticker-down"}`}>
                <b>{s.symbol}</b>
                <span>₹{Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                <span className="ticker-chg">{up ? "▲" : "▼"} {Math.abs(Number(chg)).toFixed(2)}%</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
