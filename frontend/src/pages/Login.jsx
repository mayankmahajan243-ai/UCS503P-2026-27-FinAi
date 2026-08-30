import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, TrendingUp, Zap, ShieldCheck } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => { setUsername("demo-user"); setPassword("finsight2026"); };

  return (
    <div className="login-root">
      {/* ── Animated grid background ── */}
      <div className="login-bg">
        <div className="login-grid" />
        <div className="login-glow glow-1" />
        <div className="login-glow glow-2" />
      </div>

      {/* ── Floating ticker bar ── */}
      <div className="login-ticker">
        <div className="login-ticker-inner">
          {["RELIANCE +0.54%","TCS +0.42%","INFY -0.38%","HDFCBANK +0.62%","ICICIBANK +0.78%",
            "SBIN +1.22%","BHARTIARTL +1.84%","TATAMOTORS +1.82%","SUNPHARMA +0.52%","ONGC +1.42%",
            "COALINDIA +0.94%","WIPRO -0.22%","HCLTECH +0.85%","TITAN +0.62%","ADANIENT +2.14%"].map((t, i) => (
            <span key={i} className={`login-tick ${t.includes("-") ? "neg" : "pos"}`}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Login card ── */}
      <div className="login-card-wrap">
        <div className="login-card">

          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-mark">F</div>
            <div>
              <div className="login-logo-name">FinSight</div>
              <div className="login-logo-sub">AI Wealth Lab</div>
            </div>
          </div>

          {/* Headline */}
          <div className="login-headline">
            <h1>Welcome back.</h1>
            <p>Sign in to your investment intelligence platform.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="demo-user"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-password-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="login-eye" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <><Zap size={18} /> Sign In to FinSight</>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="login-demo" onClick={fillDemo}>
            <ShieldCheck size={15} />
            <span>Demo: <b>demo-user</b> / <b>finsight2026</b> — click to fill</span>
          </div>

          {/* Feature pills */}
          <div className="login-pills">
            <span><TrendingUp size={13} /> Live Nifty 50</span>
            <span><Zap size={13} /> AI Scoring</span>
            <span><ShieldCheck size={13} /> Paper Trading</span>
          </div>
        </div>
      </div>
    </div>
  );
}
