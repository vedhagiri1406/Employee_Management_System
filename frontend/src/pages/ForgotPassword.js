import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "../api/api";

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
    <div className="page-wrap">
      <div className="card" style={{maxWidth: 420, marginInline: "auto"}}>
        <h2>Forgot Password</h2>
        {msg && <div className="success">{msg}</div>}
        <form onSubmit={submit} className="form">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <button className="btn primary" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
