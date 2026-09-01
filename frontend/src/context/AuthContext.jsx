import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api";

const AuthContext = createContext(null);

/**
 * Decode JWT payload (no verification — just read claims for display).
 */
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("fs_token") || null);
  const [loading, setLoading] = useState(true);

  // On mount — check if existing token is still valid
  useEffect(() => {
    if (!token) { setLoading(false); return; }

    // Quick client-side expiry check
    const claims = decodeJwt(token);
    if (claims?.exp && claims.exp * 1000 < Date.now()) {
      logout();
      setLoading(false);
      return;
    }

    // Verify with backend
    api.get("/auth/me")
      .then(res => {
        if (res.data?.success) setUser(res.data.user);
        else logout();
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-logout when token expires
  useEffect(() => {
    if (!token) return;
    const claims = decodeJwt(token);
    if (!claims?.exp) return;

    const msUntilExpiry = claims.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) { logout(); return; }

    const timer = setTimeout(() => logout(), msUntilExpiry);
    return () => clearTimeout(timer);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    if (!res.data?.success) throw new Error(res.data?.message || "Login failed");
    const { token: tk, user: u } = res.data;
    localStorage.setItem("fs_token", tk);
    setToken(tk);
    setUser(u);
    return u;
  };

  const logout = useCallback(() => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("fs_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
