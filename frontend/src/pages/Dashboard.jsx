import React, { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import {
  getAIInsights,
  getPortfolio,
  getStocks,
} from "../api";

import StatCard from "../components/StatCard";
import SectionHeader from "../components/SectionHeader";
import StockTable from "../components/StockTable";

import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";


export default function Dashboard() {

  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [ai, setAi] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // --------------------------------------------------
  // FETCH DASHBOARD DATA
  // --------------------------------------------------

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stocksData, portfolioData, aiData] =
          await Promise.all([
            getStocks(),
            getPortfolio("demo-user"),
            getAIInsights("demo-user"),
          ]);

      setStocks(Array.isArray(stocksData) ? stocksData : []);
      setPortfolio(portfolioData || null);
      setAi(aiData || null);

    } catch (err) {

      console.error("Dashboard API error:", err);

      setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard data."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  // --------------------------------------------------
  // FORMAT CURRENCY
  // --------------------------------------------------

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return `₹${number.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };


  // --------------------------------------------------
  // PORTFOLIO VALUES
  // --------------------------------------------------

  const invested = Number(portfolio?.invested || 0);

  const currentValue = Number(
      portfolio?.currentValue || 0
  );

  const profitLoss = Number(
      portfolio?.profitLoss || currentValue - invested
  );

  const profitPercent =
      invested === 0
          ? 0
          : Number(
              portfolio?.profitPercent ??
              ((profitLoss / invested) * 100)
          );


  // --------------------------------------------------
  // CHART DATA
  // --------------------------------------------------

  const chartData = useMemo(() => {

    if (
        !portfolio?.holdings ||
        portfolio.holdings.length === 0
    ) {
      return [];
    }

    return portfolio.holdings.map((holding) => ({
      symbol: holding.symbol,
      value: Number(holding.marketValue || 0),
    }));

  }, [portfolio]);


  // --------------------------------------------------
  // TOP AI STOCKS
  // --------------------------------------------------

  const topStocks = useMemo(() => {

    return [...stocks]
        .sort(
            (a, b) =>
                Number(b.aiScore || 0) -
                Number(a.aiScore || 0)
        )
        .slice(0, 6);

  }, [stocks]);


  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {

    return (
        <div className="page">

          <div
              style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "15px",
              }}
          >

            <RefreshCw
                size={32}
                className="animate-spin"
            />

            <h3>Loading your FinSight dashboard...</h3>

            <p style={{ opacity: 0.6 }}>
              Fetching portfolio, stocks and AI insights
            </p>

          </div>

        </div>
    );
  }


  // --------------------------------------------------
  // ERROR SCREEN
  // --------------------------------------------------

  if (error) {

    return (
        <div className="page">

          <div
              style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
          >

            <div
                className="panel"
                style={{
                  maxWidth: "600px",
                  width: "100%",
                  textAlign: "center",
                  padding: "40px",
                }}
            >

              <AlertTriangle
                  size={42}
                  style={{ marginBottom: "15px" }}
              />

              <h2>
                Unable to load dashboard
              </h2>

              <p
                  style={{
                    opacity: 0.7,
                    marginTop: "10px",
                    marginBottom: "25px",
                  }}
              >
                {error}
              </p>

              <button
                  onClick={loadDashboard}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                  }}
              >
                Try Again
              </button>

            </div>

          </div>

        </div>
    );
  }


  // --------------------------------------------------
  // MAIN DASHBOARD
  // --------------------------------------------------

  return (

      <div className="page">

        {/* ============================================
          HERO SECTION
      ============================================ */}

        <div className="hero-grid">

          {/* PORTFOLIO VALUE */}

          <div className="hero-card">

            <div className="hero-copy">

            <span className="eyebrow">
              PORTFOLIO VALUE
            </span>

              <h2>
                {formatCurrency(currentValue)}
              </h2>

              <span
                  className={
                    profitLoss >= 0
                        ? "positive"
                        : "negative"
                  }
              >

              {profitLoss >= 0 ? "+" : ""}
                {formatCurrency(profitLoss)}

                {" · "}

                {profitPercent >= 0 ? "+" : ""}
                {profitPercent.toFixed(2)}%

            </span>

            </div>


            {/* PORTFOLIO CHART */}

            <div
                className="chart"
                style={{
                  height: "220px",
                  marginTop: "20px",
                }}
            >

              {chartData.length > 0 ? (

                  <ResponsiveContainer
                      width="100%"
                      height="100%"
                  >

                    <AreaChart
                        data={chartData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: 0,
                          bottom: 0,
                        }}
                    >

                      <defs>

                        <linearGradient
                            id="portfolioFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >

                          <stop
                              offset="0%"
                              stopOpacity={0.35}
                          />

                          <stop
                              offset="100%"
                              stopOpacity={0}
                          />

                        </linearGradient>

                      </defs>


                      <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 3"
                          opacity={0.12}
                      />


                      <XAxis
                          dataKey="symbol"
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                      />


                      <YAxis
                          hide
                      />


                      <Tooltip
                          formatter={(value) =>
                              formatCurrency(value)
                          }
                      />


                      <Area
                          type="monotone"
                          dataKey="value"
                          strokeWidth={2.5}
                          fill="url(#portfolioFill)"
                      />

                    </AreaChart>

                  </ResponsiveContainer>

              ) : (

                  <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.5,
                      }}
                  >
                    No portfolio data available
                  </div>

              )}

            </div>

          </div>


          {/* ========================================
            AI MARKET COPILOT
        ======================================== */}

          <div className="ai-card">

            <div className="ai-card-top">

              <BrainCircuit size={22} />

              <span>
              AI MARKET COPILOT
            </span>

            </div>


            <h3>
              {ai?.summary ||
                  "Your portfolio is moderately positioned with healthy diversification."}
            </h3>


            <p>
              AI score considers fundamentals,
              momentum, sentiment and your selected
              risk profile.
            </p>


            <a href="/ai">
              Open AI Lab →
            </a>

          </div>

        </div>


        {/* ============================================
          STAT CARDS
      ============================================ */}

        <div className="stats-grid">

          <StatCard
              label="Invested"
              value={formatCurrency(invested)}
          />


          <StatCard
              label="Today's P&L"
              value="+₹1,840"
              change="+0.85%"
          />


          <StatCard
              label="Diversification"
              value={`${portfolio?.diversificationScore ?? 0}/100`}
              change={
                Number(
                    portfolio?.diversificationScore || 0
                ) >= 70
                    ? "Healthy"
                    : "Needs Attention"
              }
          />


          <StatCard
              label="Risk Score"
              value={`${ai?.riskScore ?? 46}/100`}
              change={
                Number(ai?.riskScore ?? 46) <= 60
                    ? "Moderate"
                    : "High"
              }
          />

        </div>


        {/* ============================================
          CONTENT GRID
      ============================================ */}

        <div className="content-grid">


          {/* ========================================
            AI OPPORTUNITIES
        ======================================== */}

          <section className="panel">

            <SectionHeader
                title="AI opportunities"
                subtitle="Highest-scoring stocks from your current universe"
            />


            {topStocks.length > 0 ? (

                <StockTable
                    stocks={topStocks}
                />

            ) : (

                <div
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      opacity: 0.6,
                    }}
                >
                  No stocks available.
                </div>

            )}

          </section>


          {/* ========================================
            PORTFOLIO HEALTH
        ======================================== */}

          <section className="panel insight-panel">

            <SectionHeader
                title="Portfolio health"
                subtitle="Automated diagnostics"
            />


            {/* RISK */}

            <div className="health-item">

              <ShieldCheck />

              <div>

                <b>
                  Risk within target
                </b>

                <span>
                Your portfolio is aligned with
                a moderate profile.
              </span>

              </div>

            </div>


            {/* MOMENTUM */}

            <div className="health-item">

              <TrendingUp />

              <div>

                <b>
                  Momentum positive
                </b>

                <span>

                {stocks.filter(
                    (stock) =>
                        Number(
                            stock.changePercent || 0
                        ) > 0
                ).length}

                  {" "}stocks currently have
                positive momentum.

              </span>

              </div>

            </div>


            {/* AI CONFIDENCE */}

            <div className="health-item">

              <BrainCircuit />

              <div>

                <b>
                  AI confidence
                </b>

                <span>
                Model confidence:{" "}
                  {ai?.confidence ?? 82}%.
              </span>

              </div>

            </div>


            {/* DIVERSIFICATION */}

            <div className="health-item">

              <ShieldCheck />

              <div>

                <b>
                  Diversification
                </b>

                <span>

                {portfolio?.holdings?.length || 0}
                  {" "}stocks in your portfolio.

              </span>

              </div>

            </div>

          </section>

        </div>

      </div>
  );
}