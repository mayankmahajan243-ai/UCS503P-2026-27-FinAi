import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 8000,
});

export const getStocks = () => api.get("/stocks").then(r => r.data);
export const getPortfolio = (userId = "demo-user") => api.get(`/portfolio/${userId}`).then(r => r.data);
export const getWatchlist = (userId = "demo-user") => api.get(`/watchlist/${userId}`).then(r => r.data);
export const getAlerts = (userId = "demo-user") => api.get(`/alerts/${userId}`).then(r => r.data);
export const getAIInsights = (userId = "demo-user") => api.get(`/ai/insights/${userId}`).then(r => r.data);

export default api;
