import React from "react";
export default function StockTable({ stocks = [] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Stock</th><th>Price</th><th>Day</th><th>AI Score</th><th>View</th></tr>
        </thead>
        <tbody>
          {stocks.map(stock => (
            <tr key={stock.symbol}>
              <td><div className="stock-name"><b>{stock.symbol}</b><span>{stock.companyName}</span></div></td>
              <td>₹{Number(stock.price).toLocaleString("en-IN", {minimumFractionDigits: 2})}</td>
              <td className={stock.changePercent >= 0 ? "positive" : "negative"}>{stock.changePercent >= 0 ? "+" : ""}{stock.changePercent}%</td>
              <td><span className="score-pill">{stock.aiScore ?? "--"}</span></td>
              <td><button className="small-btn">Analyze</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
