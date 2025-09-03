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

  // 👇 prevent vertical scrollbar while on the login page
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
    <div className="auth-wrap">
      <h1>Employee Management System</h1>
      <div className="auth-card">
        <h2>Login</h2>
        {verified === "1" && <div className="success">Email verified. Please log in.</div>}
        {verified === "0" && <div className="error">Verification failed or link expired.</div>}
        {err && <div className="error">{err}</div>}
        <form onSubmit={submit} className="form">
          Email
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            disabled={loading}
          />
          Password
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button className="btn primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/register">Register</Link>
          <Link to="/forgot-password">Forgot Password</Link>
        </div>
      </div>
    </div>
  );
}
