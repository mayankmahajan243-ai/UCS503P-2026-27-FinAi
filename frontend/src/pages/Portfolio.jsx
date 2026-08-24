import React, { useEffect, useState } from "react";
import { getPortfolio } from "../api";
import SectionHeader from "../components/SectionHeader";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  useEffect(() => { getPortfolio().then(setPortfolio).catch(console.error); }, []);

  const holdings = portfolio?.holdings || [];
  const allocation = holdings.map(h => ({ name: h.symbol, value: Number(h.marketValue || 1) }));

  return (
    <div className="page">
      <SectionHeader title="Portfolio" subtitle="Holdings, allocation and performance" />
      <div className="content-grid">
        <section className="panel">
          <div className="panel-title"><h3>Holdings</h3><span>{holdings.length} positions</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Symbol</th><th>Qty</th><th>Avg</th><th>Current</th><th>P&L</th><th>Allocation</th></tr></thead>
              <tbody>
                {holdings.map(h => (
                  <tr key={h.symbol}>
                    <td><b>{h.symbol}</b></td><td>{h.quantity}</td><td>₹{h.averagePrice}</td>
                    <td>₹{h.currentPrice}</td>
                    <td className={h.profitLoss >= 0 ? "positive" : "negative"}>{h.profitLoss >= 0 ? "+" : ""}₹{h.profitLoss}</td>
                    <td>{h.allocation}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel chart-panel">
          <div className="panel-title"><h3>Allocation</h3><span>By position</span></div>
          <div className="donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={allocation} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95}>{allocation.map((_, i) => <Cell key={i} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
