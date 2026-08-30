import React from "react";
export default function StatCard({ label, value, change, positive = true }) {
  return (
    <div className="stat-card">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
      {change && <span style={{ fontSize: 12, marginTop: 6, display: "block", color: "var(--text-dim)" }}>{change}</span>}
    </div>
  );
}
