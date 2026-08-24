# AI Roadmap

## Current baseline

The project already has an explainable AI layer rather than a random buy/sell generator.

### Inputs
- P/E
- ROE
- Debt/equity
- Momentum
- News sentiment
- Portfolio concentration

### Outputs
- 0-100 score
- research candidate / watch / neutral
- factor explanations
- portfolio risk flags

## Upgrade path

1. Ingest licensed market data.
2. Store OHLCV history in PostgreSQL/TimescaleDB.
3. Generate technical indicators: RSI, MACD, ATR, moving averages, volatility.
4. Build a feature store.
5. Train time-series models with walk-forward validation.
6. Add a financial-news pipeline.
7. Use a domain-specific sentiment model.
8. Add explainability using SHAP.
9. Build a backtesting engine.
10. Add an AI chat assistant that cites the data used for every answer.
11. Add portfolio scenario analysis:
   - market shock
   - sector shock
   - volatility shock
   - interest-rate shock
12. Add recommendation guardrails:
   - never present a prediction as certainty
   - show confidence
   - show reasons
   - show risks
   - separate educational insights from execution

## Recommended AI screens

- AI Market Brief
- Stock Deep Dive
- Portfolio Doctor
- What-if Simulator
- Risk Lab
- News Intelligence
- AI Chat with source-backed explanations
