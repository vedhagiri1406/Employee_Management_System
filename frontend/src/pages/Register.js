// src/pages/Register.jsx
import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "../api/api";

const GradientInput = ({ type = "text", ...props }) => (
  <div className="rounded-md bg-gradient-to-b from-white to-gray-200 p-[2px] shadow">
    <input
      type={type}
      className="w-full rounded-md bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none"
      {...props}
    />
  </div>
);

export default function Register() {
  const [f, setF] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    await axios.post(`${baseURL}/auth/register/`, f);
    setMsg("Registered successfully. Please login.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg shadow-xl bg-indigo-950 p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Register</h2>

          <form onSubmit={submit} className="space-y-4">
            <GradientInput
              value={f.username}
              onChange={(e) => setF({ ...f, username: e.target.value })}
              placeholder="Username"
              required
            />
            <GradientInput
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              placeholder="Email"
              required
            />
            <GradientInput
              type="password"
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              placeholder="Password"
              required
            />

            <button
              type="submit"
              className="w-full rounded-md bg-yellow-400 text-black font-medium py-2 hover:bg-yellow-500 transition"
            >
              Register
            </button>
          </form>

          {msg && (
            <p className="mt-4 text-green-400 text-sm text-center">{msg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
