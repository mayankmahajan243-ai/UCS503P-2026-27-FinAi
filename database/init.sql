-- ════════════════════════════════════════════════════════════════
-- FinSight AI Platform — Complete Database Schema
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(150),
    email VARCHAR(200),
    role VARCHAR(30) NOT NULL DEFAULT 'INVESTOR',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(80) NOT NULL,
    balance NUMERIC(16,2) NOT NULL DEFAULT 1000000.00,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(80) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    type VARCHAR(10) NOT NULL,
    quantity NUMERIC(16,4) NOT NULL,
    price NUMERIC(14,2) NOT NULL,
    total NUMERIC(16,2) NOT NULL,
    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stocks (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    sector VARCHAR(100),
    price NUMERIC(14,2) NOT NULL,
    change_percent NUMERIC(8,3) NOT NULL DEFAULT 0,
    pe_ratio NUMERIC(10,2),
    roe NUMERIC(8,2),
    debt_to_equity NUMERIC(10,2),
    market_cap NUMERIC(20,2),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS holdings (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(80) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    quantity NUMERIC(16,4) NOT NULL,
    average_price NUMERIC(14,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS watchlists (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(80) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    watchlist_name VARCHAR(100) NOT NULL DEFAULT 'Default',
    UNIQUE(user_id, symbol, watchlist_name)
);

CREATE TABLE IF NOT EXISTS price_alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(80) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    target_price NUMERIC(14,2) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO stocks(symbol, company_name, sector, price, change_percent, pe_ratio, roe, debt_to_equity, market_cap)
VALUES
('RELIANCE','Reliance Industries','Energy',1450.50,1.24,25.8,9.8,0.43,1950000000000),
('TCS','Tata Consultancy Services','IT',3210.10,0.82,28.4,50.2,0.08,1160000000000),
('INFY','Infosys','IT',1542.35,-0.31,24.1,32.8,0.12,640000000000),
('HDFCBANK','HDFC Bank','Banking',1722.20,0.55,18.7,16.1,0.00,1300000000000),
('ICICIBANK','ICICI Bank','Banking',1248.75,1.01,19.2,17.9,0.00,875000000000),
('SUNPHARMA','Sun Pharmaceutical','Healthcare',1864.30,0.66,34.1,13.7,0.18,448000000000)
ON CONFLICT (symbol) DO NOTHING;

INSERT INTO holdings(user_id, symbol, quantity, average_price)
VALUES
('demo-user','RELIANCE',12,1310.00),
('demo-user','TCS',5,2940.00),
('demo-user','HDFCBANK',8,1580.00)
ON CONFLICT DO NOTHING;

INSERT INTO watchlists(user_id, symbol)
VALUES ('demo-user','INFY'), ('demo-user','ICICIBANK'), ('demo-user','SUNPHARMA')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_user ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON price_alerts(user_id);
