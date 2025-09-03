// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "../api/api";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const nav = useNavigate();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    if (p1 !== p2) { setErr("Passwords do not match"); return; }
    try {
      await axios.post(`${baseURL}/auth/reset-password/`, {
        uidb64: uid, token, new_password: p1
      });
      setMsg("Password set. You can login now.");
      setTimeout(()=> nav("/login"), 1200);
    } catch (e) {
      const d = e?.response?.data;
      if (d?.new_password) {
          setErr(d.new_password.join(" "));   // show password validation messages
        } else {
          setErr(d?.detail || "Reset failed. Link may be invalid or expired.");
        }
    }
  }

  return (
    <div className="page-wrap">
      <div className="card" style={{maxWidth: 420, marginInline: "auto"}}>
        <h2>Set Password</h2>
        {msg && <div className="success">{msg}</div>}
        {err && <div className="error">{err}</div>}
        <form onSubmit={submit} className="form">
          <input type="password" placeholder="New password" value={p1} onChange={(e)=>setP1(e.target.value)} required />
          <input type="password" placeholder="Confirm password" value={p2} onChange={(e)=>setP2(e.target.value)} required />
          <button className="btn primary">Save password</button>
        </form>
      </div>
    </div>
  );
}
