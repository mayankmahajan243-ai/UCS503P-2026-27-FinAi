Write-Host "Starting FinSight local infrastructure..."
docker compose up -d postgres
Write-Host "PostgreSQL is starting on localhost:5432"
Write-Host "Start ai-service with: cd ai-service; .venv\Scripts\activate; pip install -r requirements.txt; uvicorn app.main:app --reload --port 8000"
Write-Host "Start backend in IntelliJ on port 8080"
Write-Host "Start frontend in WebStorm with: npm install; npm run dev"
