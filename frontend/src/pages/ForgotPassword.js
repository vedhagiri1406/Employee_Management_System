import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "../api/api";
import "../App.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await axios.post(`${baseURL}/auth/forgot-password/`, { email });
      setMsg("If the email exists, a reset link has been sent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="login-card">
        <div className="auth-header">
          <div className="auth-logo">📧</div>
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-sub">We will email you a reset link</p>
        </div>

        {msg && <div className="success">{msg}</div>}
        <form onSubmit={submit} className="form auth-form">
          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button className="btn primary" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
