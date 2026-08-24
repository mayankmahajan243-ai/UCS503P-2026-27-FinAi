import React from "react";
export default function StatCard({ label, value, change, positive = true }) {
  return (
    <div className="stat-card">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
      {change && <span className={positive ? "positive" : "negative"}>{change}</span>}
    </div>
  );
}
