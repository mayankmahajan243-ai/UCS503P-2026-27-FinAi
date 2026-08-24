import { useEffect, useMemo, useState } from "react";
import {
    BrainCircuit,
    Sparkles,
    TrendingUp,
    ShieldCheck,
    Activity,
    RefreshCw,
    ArrowUpRight,
    BarChart3,
    Target,
    Zap,
} from "lucide-react";

import { getAIInsights } from "../api";
import SectionHeader from "../components/SectionHeader";

export default function AIInsights() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadInsights = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getAIInsights();
            setData(result);
        } catch (err) {
            console.error("AI Insights error:", err);
            setError("Unable to load AI insights.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, []);

    const stocks = data?.allStocks || data?.topStocks || [];

    const averageScore = useMemo(() => {
        if (!stocks.length) return 0;

        const total = stocks.reduce(
            (sum, stock) => sum + Number(stock.aiScore || 0),
            0
        );

        return Math.round(total / stocks.length);
    }, [stocks]);

    const strongestStock = useMemo(() => {
        if (!stocks.length) return null;

        return [...stocks].sort(
            (a, b) => Number(b.aiScore || 0) - Number(a.aiScore || 0)
        )[0];
    }, [stocks]);

    const getRecommendationClass = (recommendation) => {
        const value = String(recommendation || "").toUpperCase();

        if (value.includes("BUY")) return "ai-buy";
        if (value.includes("ACCUMULATE")) return "ai-accumulate";
        if (value.includes("HOLD")) return "ai-hold";
        if (value.includes("AVOID")) return "ai-avoid";

        return "ai-neutral";
    };

    const getScoreClass = (score) => {
        const value = Number(score || 0);

        if (value >= 75) return "score-excellent";
        if (value >= 60) return "score-good";
        if (value >= 45) return "score-medium";

        return "score-low";
    };

    if (loading) {
        return (
            <div className="page">
                <SectionHeader
                    title="AI Investment Lab"
                    subtitle="Explainable intelligence instead of a black-box buy/sell signal"
                />

                <div className="ai-loading">
                    <div className="ai-loading-icon">
                        <BrainCircuit size={38} />
                    </div>

                    <h2>Analyzing the market...</h2>

                    <p>
                        FinSight AI is evaluating fundamentals, valuation, momentum and
                        risk.
                    </p>

                    <div className="loading-bar">
                        <div />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <SectionHeader
                    title="AI Investment Lab"
                    subtitle="Explainable intelligence instead of a black-box buy/sell signal"
                />

                <div className="panel ai-error">
                    <CircleAlertIcon />
                    <h2>AI analysis unavailable</h2>
                    <p>{error}</p>

                    <button className="primary-button" onClick={loadInsights}>
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page ai-page">

            {/* HEADER */}
            <SectionHeader
                title="AI Investment Lab"
                subtitle="Explainable intelligence instead of a black-box buy/sell signal"
            />

            {/* TOP AI OVERVIEW */}
            <div className="ai-overview-grid">

                {/* SENTIMENT */}
                <section className="panel ai-hero-card">
                    <div className="ai-hero-top">
                        <div>
              <span className="eyebrow">
                <BrainCircuit size={15} />
                FIN SIGHT AI
              </span>

                            <h2>
                                Market intelligence
                                <br />
                                <span>at a glance.</span>
                            </h2>
                        </div>

                        <div className="ai-brain">
                            <BrainCircuit size={42} />
                        </div>
                    </div>

                    <div className="sentiment-box">
                        <div className="sentiment-icon">
                            <TrendingUp size={22} />
                        </div>

                        <div>
                            <span>MARKET SENTIMENT</span>
                            <strong>
                                {data?.marketSentiment || "NEUTRAL"}
                            </strong>
                        </div>
                    </div>

                    <p className="ai-description">
                        FinSight AI analyzes available market data using fundamental,
                        valuation, momentum and risk factors to identify stocks worth
                        researching further.
                    </p>
                </section>

                {/* AI SCORE */}
                <section className="panel ai-score-card">
                    <div className="card-heading">
                        <div>
                            <span className="eyebrow">AI MARKET SCORE</span>
                            <h3>Overall signal</h3>
                        </div>

                        <Sparkles size={22} />
                    </div>

                    <div className="big-score">
                        <div className="score-circle">
                            <strong>{averageScore}</strong>
                            <span>/100</span>
                        </div>
                    </div>

                    <div className="score-description">
                        <Activity size={17} />

                        <span>
              Based on {data?.totalStocksAnalysed || stocks.length} stocks
              analyzed by the current AI engine.
            </span>
                    </div>
                </section>

                {/* TOP PICK */}
                <section className="panel ai-top-pick">
                    <div className="card-heading">
                        <div>
                            <span className="eyebrow">TOP AI PICK</span>
                            <h3>Strongest candidate</h3>
                        </div>

                        <Target size={22} />
                    </div>

                    {strongestStock && (
                        <>
                            <div className="top-pick-symbol">
                                <div className="stock-avatar">
                                    {strongestStock.symbol?.substring(0, 2)}
                                </div>

                                <div>
                                    <h2>{strongestStock.symbol}</h2>
                                    <p>{strongestStock.companyName}</p>
                                </div>

                                <div
                                    className={`ai-score-mini ${getScoreClass(
                                        strongestStock.aiScore
                                    )}`}
                                >
                                    {strongestStock.aiScore}
                                </div>
                            </div>

                            <div className="top-pick-price">
                                <span>Current price</span>
                                <strong>
                                    ₹
                                    {Number(strongestStock.price || 0).toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </strong>
                            </div>

                            <div
                                className={`recommendation-badge ${getRecommendationClass(
                                    strongestStock.recommendation
                                )}`}
                            >
                                <Zap size={15} />
                                {strongestStock.recommendation}
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* AI EXPLANATION */}
            {strongestStock && (
                <section className="panel ai-explanation">
                    <div className="panel-title">
                        <h3>
                            <Sparkles size={19} />
                            Why the AI likes {strongestStock.symbol}
                        </h3>

                        <span className="ai-confidence">
              AI Score {strongestStock.aiScore}/100
            </span>
                    </div>

                    <p>
                        {strongestStock.summary ||
                            "The AI engine has identified this stock as one of the stronger candidates based on the available market factors."}
                    </p>

                    <div className="factor-grid">
                        <Factor
                            label="Fundamentals"
                            value={strongestStock.fundamentalScore}
                        />

                        <Factor
                            label="Valuation"
                            value={strongestStock.valuationScore}
                        />

                        <Factor
                            label="Momentum"
                            value={strongestStock.momentumScore}
                        />

                        <Factor
                            label="Risk"
                            value={strongestStock.riskScore}
                        />
                    </div>
                </section>
            )}

            {/* STOCK RANKINGS */}
            <section className="panel ai-ranking-panel">
                <div className="panel-title">
                    <div>
                        <span className="eyebrow">AI RANKINGS</span>
                        <h3>
                            <BarChart3 size={19} />
                            Stocks analyzed by FinSight
                        </h3>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={loadInsights}
                        title="Refresh AI analysis"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                <div className="ai-table">

                    <div className="ai-table-header">
                        <span>STOCK</span>
                        <span>PRICE</span>
                        <span>CHANGE</span>
                        <span>AI SCORE</span>
                        <span>FUND.</span>
                        <span>MOMENTUM</span>
                        <span>RISK</span>
                        <span>VERDICT</span>
                    </div>

                    {stocks
                        .slice()
                        .sort(
                            (a, b) =>
                                Number(b.aiScore || 0) -
                                Number(a.aiScore || 0)
                        )
                        .map((stock, index) => (
                            <div className="ai-table-row" key={stock.symbol}>

                                <div className="stock-name-cell">
                  <span className="rank">
                    #{index + 1}
                  </span>

                                    <div className="stock-avatar small">
                                        {stock.symbol?.substring(0, 2)}
                                    </div>

                                    <div>
                                        <strong>{stock.symbol}</strong>
                                        <small>{stock.companyName}</small>
                                    </div>
                                </div>

                                <div className="price-cell">
                                    ₹
                                    {Number(stock.price || 0).toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </div>

                                <div
                                    className={
                                        Number(stock.changePercent || 0) >= 0
                                            ? "positive"
                                            : "negative"
                                    }
                                >
                                    {Number(stock.changePercent || 0) >= 0
                                        ? "+"
                                        : ""}
                                    {stock.changePercent}%
                                </div>

                                <div>
                  <span
                      className={`table-score ${getScoreClass(
                          stock.aiScore
                      )}`}
                  >
                    {stock.aiScore}
                  </span>
                                </div>

                                <div className="factor-value">
                                    {stock.fundamentalScore ?? "--"}
                                </div>

                                <div className="factor-value">
                                    {stock.momentumScore ?? "--"}
                                </div>

                                <div className="factor-value">
                                    {stock.riskScore ?? "--"}
                                </div>

                                <div>
                  <span
                      className={`recommendation-badge small ${getRecommendationClass(
                          stock.recommendation
                      )}`}
                  >
                    {stock.recommendation}
                  </span>
                                </div>

                            </div>
                        ))}

                </div>
            </section>

            {/* AI DISCLAIMER */}
            <div className="ai-disclaimer">
                <ShieldCheck size={18} />

                <div>
                    <strong>Responsible AI investing</strong>

                    <p>
                        FinSight AI provides analytical insights based on available data.
                        It does not guarantee future returns and should not be treated as
                        personalized financial advice.
                    </p>
                </div>
            </div>
        </div>
    );
}


/* -----------------------------
   FACTOR COMPONENT
----------------------------- */

function Factor({ label, value }) {
    const score = Number(value || 0);

    return (
        <div className="factor-card">

            <div className="factor-top">
                <span>{label}</span>
                <strong>{score}</strong>
            </div>

            <div className="factor-bar">
                <div
                    style={{
                        width: `${Math.min(100, Math.max(0, score))}%`,
                    }}
                />
            </div>

        </div>
    );
}


/* -----------------------------
   ERROR ICON
----------------------------- */

function CircleAlertIcon() {
    return (
        <div className="error-icon">
            <Activity size={30} />
        </div>
    );
}