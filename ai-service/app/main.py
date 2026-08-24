from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Dict

app = FastAPI(title="FinSight AI Service", version="1.0.0")


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


POSITIVE = {"growth", "profit", "beats", "upgrade", "strong", "surge", "record", "expansion", "bullish"}
NEGATIVE = {"loss", "miss", "downgrade", "weak", "fall", "fraud", "debt", "bearish", "lawsuit"}


@app.get("/health")
def health():
    return {"status": "UP", "service": "finsight-ai"}


@app.post("/score")
def score_stock(stock: StockFeatures):
    score = 50.0
    reasons = []

    if stock.roe >= 20:
        score += 15
        reasons.append("strong ROE")
    elif stock.roe < 8:
        score -= 10
        reasons.append("weak ROE")

    if stock.pe_ratio <= 25:
        score += 10
        reasons.append("reasonable valuation")
    elif stock.pe_ratio >= 40:
        score -= 8
        reasons.append("premium valuation")

    if stock.debt_to_equity <= 0.5:
        score += 8
        reasons.append("controlled leverage")
    elif stock.debt_to_equity > 1.2:
        score -= 10
        reasons.append("high leverage")

    score += max(-10, min(10, stock.momentum * 2))
    score += max(-8, min(8, stock.sentiment * 8))

    score = round(max(0, min(100, score)), 2)

    label = "research candidate" if score >= 75 else "watch" if score >= 60 else "neutral"
    return {"symbol": stock.symbol, "score": score, "label": label, "reasons": reasons}


@app.post("/sentiment")
def sentiment(req: SentimentRequest):
    words = {w.strip(".,:;!?()[]").lower() for w in req.headline.split()}
    pos = len(words & POSITIVE)
    neg = len(words & NEGATIVE)
    raw = pos - neg

    if raw > 0:
        label = "bullish"
    elif raw < 0:
        label = "bearish"
    else:
        label = "neutral"

    return {"label": label, "score": max(-1, min(1, raw / 3)), "positive_hits": pos, "negative_hits": neg}


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
    if len(data.holdings) < 4:
        score -= 15
        flags.append("Portfolio has limited position diversification.")

    return {
        "score": max(0, score),
        "risk": "high" if score < 55 else "moderate" if score < 80 else "low",
        "flags": flags or ["No major concentration issue detected."]
    }
