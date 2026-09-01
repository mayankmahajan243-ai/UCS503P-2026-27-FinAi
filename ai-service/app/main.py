from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict
import time

app = FastAPI(title="FinSight AI Service", version="2.0.0")

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ────────────────────────────────────────────────────────
class StockFeatures(BaseModel):
    symbol: str
    pe_ratio: float = Field(default=25)
    roe: float = Field(default=15)
    debt_to_equity: float = Field(default=0.5)
    momentum: float = Field(default=0)
    sentiment: float = Field(default=0)


class PortfolioInput(BaseModel):
    holdings: List[Dict]
    risk_profile: str = "moderate"


class SentimentRequest(BaseModel):
    headline: str


# ── Expanded Sentiment Dictionaries ───────────────────────────────
POSITIVE = {
    "growth", "profit", "beats", "upgrade", "strong", "surge", "record",
    "expansion", "bullish", "rally", "breakout", "outperform", "dividend",
    "milestone", "innovative", "acquisition", "revenue", "recovery",
    "optimistic", "boost", "gain", "soar", "exceed", "approval", "buy",
    "accumulate", "overweight", "upside", "beat", "positive", "success",
}
NEGATIVE = {
    "loss", "miss", "downgrade", "weak", "fall", "fraud", "debt",
    "bearish", "lawsuit", "crash", "decline", "underperform", "sell",
    "warning", "risk", "default", "recession", "volatile", "plunge",
    "negative", "penalty", "violation", "layoff", "restructuring",
    "slump", "cut", "underweight", "downside", "miss", "failure",
}


# ── Endpoints ─────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "finsight-ai",
        "version": "2.0.0",
        "timestamp": int(time.time()),
    }


@app.post("/score")
def score_stock(stock: StockFeatures):
    if not stock.symbol or not stock.symbol.strip():
        raise HTTPException(status_code=400, detail="Symbol is required")

    score = 50.0
    reasons = []

    # ROE analysis
    if stock.roe >= 25:
        score += 18
        reasons.append("excellent ROE")
    elif stock.roe >= 20:
        score += 15
        reasons.append("strong ROE")
    elif stock.roe >= 15:
        score += 8
        reasons.append("decent ROE")
    elif stock.roe < 8:
        score -= 10
        reasons.append("weak ROE")

    # Valuation
    if stock.pe_ratio <= 15:
        score += 15
        reasons.append("deep value")
    elif stock.pe_ratio <= 25:
        score += 10
        reasons.append("reasonable valuation")
    elif stock.pe_ratio >= 60:
        score -= 12
        reasons.append("extremely overvalued")
    elif stock.pe_ratio >= 40:
        score -= 8
        reasons.append("premium valuation")

    # Leverage
    if stock.debt_to_equity <= 0.3:
        score += 10
        reasons.append("very low leverage")
    elif stock.debt_to_equity <= 0.5:
        score += 8
        reasons.append("controlled leverage")
    elif stock.debt_to_equity > 1.5:
        score -= 12
        reasons.append("dangerous leverage")
    elif stock.debt_to_equity > 1.2:
        score -= 10
        reasons.append("high leverage")

    # Momentum & Sentiment
    score += max(-10, min(10, stock.momentum * 2))
    score += max(-8, min(8, stock.sentiment * 8))

    score = round(max(0, min(100, score)), 2)
    label = "research candidate" if score >= 75 else "watch" if score >= 60 else "neutral"

    return {"symbol": stock.symbol, "score": score, "label": label, "reasons": reasons}


@app.post("/sentiment")
def sentiment(req: SentimentRequest):
    if not req.headline or not req.headline.strip():
        raise HTTPException(status_code=400, detail="Headline is required")

    words = {w.strip(".,:;!?()[]\"\'\n\t").lower() for w in req.headline.split()}
    pos = len(words & POSITIVE)
    neg = len(words & NEGATIVE)
    raw = pos - neg

    if raw > 0:
        label = "bullish"
    elif raw < 0:
        label = "bearish"
    else:
        label = "neutral"

    return {
        "label": label,
        "score": round(max(-1.0, min(1.0, raw / 3)), 4),
        "positive_hits": pos,
        "negative_hits": neg,
    }


@app.post("/portfolio/diagnostics")
def diagnostics(data: PortfolioInput):
    if not data.holdings:
        return {"score": 0, "risk": "unknown", "flags": ["No holdings supplied"]}

    total = sum(float(h.get("marketValue", 0)) for h in data.holdings)
    largest = max((float(h.get("marketValue", 0)) for h in data.holdings), default=0)
    concentration = largest / total if total else 1

    score = 100
    flags = []

    if concentration > 0.45:
        score -= 30
        flags.append("Largest position exceeds 45% of portfolio.")
    elif concentration > 0.30:
        score -= 15
        flags.append("Largest position exceeds 30% — consider rebalancing.")

    if len(data.holdings) < 4:
        score -= 15
        flags.append("Portfolio has limited position diversification.")
    elif len(data.holdings) < 8:
        score -= 5
        flags.append("Portfolio would benefit from more positions.")

    risk_profiles = {"conservative": 10, "moderate": 0, "aggressive": -10}
    score += risk_profiles.get(data.risk_profile.lower(), 0)

    return {
        "score": max(0, min(100, score)),
        "risk": "high" if score < 55 else "moderate" if score < 80 else "low",
        "flags": flags or ["No major concentration issue detected."],
    }
