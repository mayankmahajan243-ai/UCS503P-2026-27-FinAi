#!/usr/bin/env bash
set -e
docker compose up -d postgres
echo "PostgreSQL is running on localhost:5432"
echo "Start AI: cd ai-service && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000"
echo "Start backend in IntelliJ on port 8080"
echo "Start frontend in WebStorm: cd frontend && npm install && npm run dev"
