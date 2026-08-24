import React, { useEffect, useState } from "react";
import { getWatchlist } from "../api";
import SectionHeader from "../components/SectionHeader";
import StockTable from "../components/StockTable";

export default function Watchlist() {
  const [stocks, setStocks] = useState([]);
  useEffect(() => { getWatchlist().then(setStocks).catch(console.error); }, []);
  return <div className="page"><SectionHeader title="Watchlist" subtitle="Track stocks you may want to analyze later" /><section className="panel"><StockTable stocks={stocks}/></section></div>;
}
