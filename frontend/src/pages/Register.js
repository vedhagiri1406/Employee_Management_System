import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Register() {
  const nav = useNavigate();
  const [f, setF] = useState({ username: "", email: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    setLoading(true);
    try {
      await axios.post(`${baseURL}/auth/register/`, f);
      setMsg("Registered! Check your email to set your password.");
      setTimeout(() => nav("/login"), 1500);
    } catch (e) {
      const d = e?.response?.data;
      setErr(d?.detail || d?.email || d?.username || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="login-card">
        <div className="auth-header">
          <div className="auth-logo">🧑‍💼</div>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-sub">We’ll email you a secure link to set your password</p>
        </div>

        {msg && <div className="success">{msg}</div>}
        {err && <div className="error">{String(err)}</div>}

        <form onSubmit={submit} className="form auth-form">
          <div className="field">
            <label className="field-label">Username</label>
            <input
              className="input"
              placeholder="yourname"
              value={f.username}
              onChange={(e)=>setF({...f, username:e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={f.email}
              onChange={(e)=>setF({...f, email:e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <button className="btn primary" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="divider" />
        <div className="auth-links center">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
