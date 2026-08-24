import { useEffect, useState } from "react";
import { getAlerts } from "../api";
import SectionHeader from "../components/SectionHeader";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => { getAlerts().then(setAlerts).catch(console.error); }, []);
  return (
    <div className="page">
      <SectionHeader title="Price Alerts" subtitle="Automate your market watch" />
      <section className="panel">
        <div className="table-wrap"><table><thead><tr><th>Symbol</th><th>Condition</th><th>Target</th><th>Status</th></tr></thead>
        <tbody>{alerts.map(a => <tr key={a.id}><td><b>{a.symbol}</b></td><td>{a.direction === "ABOVE" ? "Moves above" : "Falls below"}</td><td>₹{a.targetPrice}</td><td><span className="status-dot">● Active</span></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
