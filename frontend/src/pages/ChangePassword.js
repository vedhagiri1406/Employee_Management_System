import React, { useState } from "react";
import api from "../api/api";
import "../App.css";

export default function ChangePassword() {
  const [f, setF] = useState({ old_password: "", new_password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    setLoading(true);
    try {
      await api.put("/auth/change-password/", f);
      setMsg("Password changed successfully");
      setF({ old_password: "", new_password: "" });
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      const d = e?.response?.data;
      setErr(d?.detail || JSON.stringify(d) || "Unable to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrap">
      <div className="card">
        <h2>Change Password</h2>
        {msg && <div className="success">{msg}</div>}
        {err && <div className="error">{err}</div>}
        <form onSubmit={submit} className="form">
          <input
            type="password"
            placeholder="Old Password"
            value={f.old_password}
            onChange={(e)=>setF({...f, old_password:e.target.value})}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="New Password"
            value={f.new_password}
            onChange={(e)=>setF({...f, new_password:e.target.value})}
            required
            disabled={loading}
          />
          <button className="btn primary" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
