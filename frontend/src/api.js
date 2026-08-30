import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 8000,
});

// Auto-attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fs_token");
  if (token) config.headers["X-Auth-Token"] = token;
  return config;
});

// ─── STOCKS ───────────────────────────────────────────────────────
export const getStocks = () => api.get("/stocks").then(r => r.data);
export const getStock  = (symbol) => api.get(`/stocks/${symbol}`).then(r => r.data);

// ─── PORTFOLIO ────────────────────────────────────────────────────
export const getPortfolio     = (userId = "demo-user") => api.get(`/portfolio/${userId}`).then(r => r.data);
export const getTransactions  = (userId = "demo-user") => api.get(`/portfolio/${userId}/transactions`).then(r => r.data);

// ─── WALLET ───────────────────────────────────────────────────────
export const getWallet = (userId = "demo-user") => api.get(`/wallet/${userId}`).then(r => r.data);

// ─── TRADE ────────────────────────────────────────────────────────
export const executeBuy  = (userId, symbol, quantity) =>
  api.post("/trade/buy",  { userId, symbol, quantity }).then(r => r.data);
export const executeSell = (userId, symbol, quantity) =>
  api.post("/trade/sell", { userId, symbol, quantity }).then(r => r.data);

// ─── WATCHLIST ────────────────────────────────────────────────────
export const getWatchlist      = (userId = "demo-user") => api.get(`/watchlist/${userId}`).then(r => r.data);
export const addToWatchlist    = (userId, symbol) => api.post(`/watchlist/${userId}?symbol=${symbol}`).then(r => r.data);
export const removeFromWatchlist = (userId, symbol) => api.delete(`/watchlist/${userId}/${symbol}`).then(r => r.data);

// ─── ALERTS ───────────────────────────────────────────────────────
export const getAlerts    = (userId = "demo-user") => api.get(`/alerts/${userId}`).then(r => r.data);
export const createAlert  = (userId, symbol, direction, targetPrice) =>
  api.post(`/alerts/${userId}`, { symbol, direction, targetPrice }).then(r => r.data);
export const deleteAlert  = (id) => api.delete(`/alerts/${id}`).then(r => r.data);

// ─── AI ───────────────────────────────────────────────────────────
export const getAIInsights = (userId = "demo-user") => api.get(`/ai/insights/${userId}`).then(r => r.data);

// ─── AUTH ─────────────────────────────────────────────────────────
export const authLogin  = (username, password) => api.post("/auth/login",  { username, password }).then(r => r.data);
export const authLogout = () => api.post("/auth/logout").then(r => r.data);
export const authMe     = () => api.get("/auth/me").then(r => r.data);

export default api;
