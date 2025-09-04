import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { baseURL } from "../api/api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../App.css";

export default function Login() {
  const nav = useNavigate();
  const { search } = useLocation();
  const verified = useMemo(() => new URLSearchParams(search).get("verified"), [search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevent vertical scroll while on the auth page
  useEffect(() => {
    document.body.classList.add("auth-no-scroll");
    return () => document.body.classList.remove("auth-no-scroll");
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/auth/login-email/`, { email, password });
      sessionStorage.setItem("access", data.access);
      sessionStorage.setItem("refresh", data.refresh);
      nav("/forms", { replace: true });
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.email ||
        "Invalid email or password";
      setErr(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card login-card">
        <div className="auth-header">
          <h1 className="auth-title">Employee Management</h1>
          <p className="auth-sub">Sign in with your email</p>
        </div>

        {verified === "1" && <div className="success">Email verified. Please log in.</div>}
        {verified === "0" && <div className="error">Verification failed or link expired.</div>}
        {err && <div className="error" aria-live="polite">{err}</div>}

        <form onSubmit={submit} className="form auth-form">
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </label>

          <button className="btn primary block" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="divider" role="separator" />

        <div className="auth-links center">
          <Link to="/register">Create account</Link>
          <span className="dot">•</span>
          <Link to="/forgot-password">Forgot password</Link>
        </div>
      </div>
    </div>
  );
}
