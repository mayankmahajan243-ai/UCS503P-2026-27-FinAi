# AI-Powered FinTech Investment Platform

A full-stack investment intelligence platform inspired by modern Indian investing apps. It is designed to be developed systematically with:

- **Frontend:** React + Vite (WebStorm)
- **Backend:** Java + Spring Boot + JPA (IntelliJ IDEA)
- **AI Service:** Python + FastAPI
- **Database:** PostgreSQL
- **DevOps:** Docker Compose + GitHub Actions
- **Charts:** Recharts
- **AI:** explainable scoring, risk profiling, sentiment analysis, portfolio diagnostics, and an extension point for an LLM

> **Important:** This repository is a software project/demo. AI scores are not financial advice and should not be used as the sole basis for real-money investment decisions.

## 1. Architecture

```text
React Web App
     |
     | REST/JSON
     v
Spring Boot API  --------------------> PostgreSQL
     |
     | REST/JSON
     v
Python AI Service
     |
     +--> Risk scoring
     +--> Stock scoring
     +--> News sentiment
     +--> Portfolio diagnostics
     +--> Optional future LLM integration
```

The frontend is intentionally independent from the backend so you can open:
- `frontend/` in **WebStorm**
- `backend/` in **IntelliJ IDEA**
- `ai-service/` in PyCharm/VS Code or a terminal

## 2. Features included

### Dashboard
- Portfolio value
- Invested amount
- Profit/loss
- Daily market snapshot
- Top AI opportunities
- Market sentiment
- Allocation chart

### AI Investment Intelligence
- Risk-profile-aware stock scoring
- Explainable recommendation reasons
- Bullish/bearish/neutral news sentiment
- Portfolio diversification analysis
- Risk flags
- Suggested watchlist candidates
- AI summary endpoint ready for richer LLM integration

### Portfolio
- Holdings table
- Quantity and average price
- Current price
- P&L
- Allocation
- Diversification score

### Watchlist
- Add/remove symbols
- Current price
- Daily movement
- AI score
- Recommendation label

### Alerts
- Price alert model and API
- Backend persistence
- Frontend page ready for alert management

## 3. Project structure

```text
AI-FinTech-Investment-Platform/
├── frontend/                  # React app - open in WebStorm
├── backend/                   # Spring Boot - open in IntelliJ
├── ai-service/                # FastAPI AI service
├── database/
│   └── init.sql
├── .github/
│   └── workflows/
│       ├── frontend.yml
│       └── backend.yml
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 4. Run locally

### Step A - Start PostgreSQL + AI service

Install Docker Desktop, then from the project root:

```bash
docker compose up -d postgres
```

For the AI service:

```bash
cd ai-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

AI health check:
`http://localhost:8000/health`

### Step B - Start backend in IntelliJ

Open the `backend` folder as a Maven project.

Use:
```bash
mvn spring-boot:run
```

or run `FintechApplication.java`.

Backend:
`http://localhost:8080`

Health:
`http://localhost:8080/api/health`

### Step C - Start frontend in WebStorm

Open `frontend` in WebStorm:

```bash
npm install
npm run dev
```

Frontend:
`http://localhost:5173`

## 5. Environment variables

Backend can use:

```text
DB_URL=jdbc:postgresql://localhost:5432/fintech
DB_USERNAME=fintech
DB_PASSWORD=fintech
AI_SERVICE_URL=http://localhost:8000
```

Frontend can use:

```text
VITE_API_URL=http://localhost:8080/api
```

Copy `.env.example` to `.env` where required.

## 6. GitHub workflow

Recommended branch structure:

```text
main
develop
feature/frontend-dashboard
feature/backend-api
feature/ai-engine
feature/database
feature/auth
```

First push:

```bash
git init
git add .
git commit -m "chore: initialize AI fintech platform"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

Then create feature branches rather than developing directly on `main`.

## 7. Suggested development roadmap

### Phase 1 - Foundation
- [x] React dashboard
- [x] Spring Boot API
- [x] PostgreSQL schema
- [x] Python AI service
- [x] Docker PostgreSQL
- [x] GitHub Actions skeleton

### Phase 2 - Core finance
- [ ] Real market-data provider
- [ ] Mutual fund NAV provider
- [ ] Authentication + JWT
- [ ] Broker integration
- [ ] Transaction ledger
- [ ] SIP scheduler
- [ ] Tax/P&L reports

### Phase 3 - Advanced AI
- [ ] Time-series forecasting model
- [ ] Financial-news ingestion
- [ ] FinBERT-style sentiment model
- [ ] Personalized risk engine
- [ ] Explainable AI feature attribution
- [ ] Portfolio rebalancing simulator
- [ ] AI chat assistant
- [ ] Backtesting engine

### Phase 4 - Production
- [ ] Redis caching
- [ ] WebSocket live prices
- [ ] Rate limiting
- [ ] Secrets manager
- [ ] Observability
- [ ] Automated database migrations
- [ ] Cloud deployment
- [ ] Security review

## 8. Important production note

The starter uses deterministic demo market data so the application works immediately without requiring a paid market-data API. Replace `MarketDataService` with a licensed market-data provider before using real-time financial data.

For a production investment product, also add authentication, authorization, audit logs, encryption, secure secret management, compliance controls, and appropriate financial/regulatory review.
