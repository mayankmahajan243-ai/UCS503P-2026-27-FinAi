# FinSight AI — Intelligent Investment & Wealth Platform

[![Backend CI](https://github.com/mayankmahajan243-ai/UCS503P-2026-27-FinAi/actions/workflows/backend.yml/badge.svg)](https://github.com/mayankmahajan243-ai/UCS503P-2026-27-FinAi/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/mayankmahajan243-ai/UCS503P-2026-27-FinAi/actions/workflows/frontend.yml/badge.svg)](https://github.com/mayankmahajan243-ai/UCS503P-2026-27-FinAi/actions/workflows/frontend.yml)

A high-performance full-stack investment intelligence platform inspired by modern Indian wealth platforms (Groww, Zerodha Kite). Built with institutional-grade risk analytics, explainable 4-factor AI scoring, real-time WebSocket market streams, and a virtual paper-trading engine.

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (Vite + Recharts + Lucide + STOMP / SockJS Client)   │
└───────────────────────┬────────────────────────────────┘
                        │
         REST (JWT)     │     WebSocket (/topic/prices)
                        ▼
┌────────────────────────────────────────────────────────┐
│               Spring Boot 3.5.4 Backend                │
│  - Spring Security + BCrypt + Stateless JWT Filter     │
│  - MarketSyncService: 800ms live price simulator      │
│  - TradeService: Paper trading & virtual cash ledger   │
│  - AIInsightsService: 4-factor hybrid scoring engine   │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
          JPA / SQL                  REST / JSON
               │                          │
               ▼                          ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│     PostgreSQL 16       │    │    Python AI Service    │
│ (Users, Wallets, Trades,│    │ (FastAPI + Pydantic +   │
│  Holdings, Nifty 50)    │    │  Scikit-learn + NumPy)  │
└─────────────────────────┘    └─────────────────────────┘
```

---

## Key Features

### 1. 🤖 Explainable AI Investment Lab
- **4-Factor Intelligence**: Multi-factor scoring model combining Fundamentals (ROE, D/E), Valuation (P/E), Momentum (daily %), and Volatility Risk.
- **Hybrid Scoring**: Microservice architecture connecting Java Spring Boot with Python FastAPI via resilient circuit-breaker fallback (`AiServiceClient`).
- **Natural Language Thesis**: Auto-generated executive summaries and recommendation verdicts (`BUY`, `ACCUMULATE`, `HOLD`, `WATCH`, `AVOID`).
- **Sentiment Engine**: Keyword-based sentiment classification across Indian financial news headlines.

### 2. ⚡ Real-Time Market Feed & Visualizations
- **800ms WebSocket Ticker**: Live price fluctuation stream broadcasted over STOMP/SockJS to both top marquee and interactive tables.
- **Nifty 50 Market Heatmap**: Visual intensity grid of top 50 Indian enterprises color-coded by real-time movement.
- **Interactive Charts**: Responsive Net Worth performance graphs with multi-timeframe toggles (`1W`, `1M`, `3M`, `1Y`) powered by Recharts.

### 3. 💼 Risk-Free Paper Trading & Virtual Wallet
- **₹10,00,000 Starting Capital**: Practice real market orders without financial risk.
- **Transactional Buy/Sell Engine**: Real-time balance debits/credits, dynamic weighted average price calculation, and execution audit logging.
- **Two-Step Order Confirmation**: Built-in modal safeguards preventing accidental market executions.

### 4. 🔒 Enterprise Security
- **Stateless JWT Authentication**: Secure Bearer tokens with configurable expiration (24h default) and automatic client-side logout.
- **BCrypt Password Hashing**: Industry-standard cryptographic hashing on user credentials.
- **Dynamic CORS & WebSockets**: Flexible cross-origin resource sharing allowing dynamic frontend deployment ports.

---

## Tech Stack

| Layer | Technologies |
|:------|:-------------|
| **Frontend** | React 19, Vite 7, React Router DOM 7, Recharts 3, Lucide React, Axios, StompJS, SockJS |
| **Backend** | Java 21, Spring Boot 3.5.4, Spring Security, Spring Data JPA, Hibernate, Lombok, JJWT 0.12.6, YahooFinanceAPI |
| **AI Microservice** | Python 3.11+, FastAPI 0.116, Uvicorn, Pydantic 2.11, NumPy 2.3, Scikit-learn 1.7 |
| **Database** | PostgreSQL 16 Alpine |
| **DevOps** | Docker Compose, GitHub Actions CI/CD |

---

## Getting Started

### Prerequisites
- **Docker Desktop** (for PostgreSQL and containerized services)
- **Java 21 JDK** & **Maven** (for Backend)
- **Node.js 20+** & **npm** (for Frontend)
- **Python 3.11+** (for AI Service local execution)

---

### Step 1: Clone Repository & Configure Environment

```bash
git clone https://github.com/mayankmahajan243-ai/UCS503P-2026-27-FinAi.git
cd UCS503P-2026-27-FinAi

# Copy environment file
cp .env.example .env
```

---

### Step 2: Start PostgreSQL Database & AI Service

Using Docker Compose:

```bash
# Start PostgreSQL (and optionally AI microservice)
docker compose up -d
```

To run the Python AI Service locally:

```bash
cd ai-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 9000 --reload
```
AI Health Check: `http://localhost:9000/health`

---

### Step 3: Start Spring Boot Backend

```bash
cd backend
mvn spring-boot:run
```
Backend API: `http://localhost:8080`  
Health Check: `http://localhost:8080/api/health`

---

### Step 4: Start React Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend App: `http://localhost:5173`

---

## Demo Credentials

You can sign in with the pre-seeded investor profile:
- **Username**: `demo-user`
- **Password**: `finsight2026`
- **Virtual Balance**: ₹10,00,000.00
- **Pre-seeded Portfolio**: Reliance Industries (100 shares), TCS (50 shares), HDFC Bank (150 shares)

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` — Authenticate and receive JWT Bearer token
- `GET /api/auth/me` — Retrieve active authenticated user details
- `POST /api/auth/logout` — Invalidate user session

### Stocks & Market Data
- `GET /api/stocks` — Fetch all 50 Nifty stocks with metrics & AI scores
- `GET /api/stocks/{symbol}` — Query specific stock details

### Portfolio & Trading
- `GET /api/portfolio/{userId}` — Portfolio valuation, invested capital, diversification rating
- `GET /api/portfolio/{userId}/transactions` — Order history audit trail
- `POST /api/trade/buy` — Execute paper buy order
- `POST /api/trade/sell` — Execute paper sell order

### Virtual Wallet
- `GET /api/wallet/{userId}` — Fetch current cash balance
- `POST /api/wallet/{userId}/deposit` — Add virtual funds
- `POST /api/wallet/{userId}/reset` — Reset wallet to ₹10,00,000

### Watchlist & Alerts
- `GET /api/watchlist/{userId}` — Retrieve saved stocks
- `POST /api/watchlist/{userId}?symbol={sym}` — Pin stock to watchlist
- `DELETE /api/watchlist/{userId}/{sym}` — Remove stock
- `GET /api/alerts/{userId}` — Get active price triggers
- `POST /api/alerts/{userId}` — Create price alert
- `DELETE /api/alerts/{id}` — Delete price alert

### AI Intelligence
- `GET /api/ai/insights` — Overall market sentiment & top stock rankings

---

## Disclaimer

This platform is developed as an educational software project and paper-trading simulator. AI factor calculations and sentiment ratings do not constitute certified financial advice.
