import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("fs_token") || null);
  const [loading, setLoading] = useState(true);

  // On mount — verify token still valid
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.get("/auth/me", { headers: { "X-Auth-Token": token } })
      .then(res => {
        if (res.data?.success) setUser(res.data.user);
        else logout();
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    if (!res.data?.success) throw new Error(res.data?.message || "Login failed");
    const { token: tk, user: u } = res.data;
    localStorage.setItem("fs_token", tk);
    setToken(tk);
    setUser(u);
    return u;
  };

  const logout = () => {
    if (token) api.post("/auth/logout", {}, { headers: { "X-Auth-Token": token } }).catch(() => {});
    localStorage.removeItem("fs_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
