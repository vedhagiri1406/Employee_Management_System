import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const nav = useNavigate();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    if (p1 !== p2) { setErr("Passwords do not match"); return; }
    setLoading(true);
    try {
      await axios.post(`${baseURL}/auth/reset-password/`, {
        uidb64: uid, token, new_password: p1
      });
      setMsg("Password set. You can login now.");
      setTimeout(()=> nav("/login"), 1200);
    } catch (e) {
      const d = e?.response?.data;
      if (d?.new_password) {
        setErr(Array.isArray(d.new_password) ? d.new_password.join(" ") : String(d.new_password));
      } else {
        setErr(d?.detail || "Reset failed. Link may be invalid or expired.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="login-card">
        <div className="auth-header">
          <div className="auth-logo">🔒</div>
          <h2 className="auth-title">Set Password</h2>
          <p className="auth-sub">Enter and confirm your new password</p>
        </div>

        {msg && <div className="success">{msg}</div>}
        {err && <div className="error">{err}</div>}

        <form onSubmit={submit} className="form auth-form">
          <div className="field">
            <label className="field-label">New Password</label>
            <input
              className="input"
              type="password"
              placeholder="New password"
              value={p1}
              onChange={(e)=>setP1(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="field">
            <label className="field-label">Confirm Password</label>
            <input
              className="input"
              type="password"
              placeholder="Confirm password"
              value={p2}
              onChange={(e)=>setP2(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button className="btn primary" disabled={loading}>
            {loading ? "Saving..." : "Save password"}
          </button>
        </form>
      </div>
    </div>
  );
}
