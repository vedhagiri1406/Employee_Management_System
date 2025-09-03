// src/pages/Register.jsx
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

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      await axios.post(`${baseURL}/auth/register/`, f);
      setMsg("Registered! Check your email to set your password.");
      setTimeout(() => nav("/login"), 1500);
    } catch (e) {
      const d = e?.response?.data;
      setErr(d?.detail || d?.email || d?.username || "Registration failed");
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Create your account</h2>
        {msg && <div className="success">{msg}</div>}
        {err && <div className="error">{String(err)}</div>}
        <form onSubmit={submit} className="form">
          <input placeholder="Username" value={f.username}
                 onChange={(e)=>setF({...f, username:e.target.value})} required />
          <input type="email" placeholder="Email" value={f.email}
                 onChange={(e)=>setF({...f, email:e.target.value})} required />
          <button className="btn primary">Register</button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
