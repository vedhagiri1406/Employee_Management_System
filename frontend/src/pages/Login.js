// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { baseURL } from "../api/api";

export default function Login() {
  const [username, setUsername] = useState(""); // backend expects username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${baseURL}/auth/login/`, {
        username,
        password,
      });

      // store tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // redirect
      window.location.href = "/";
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
  <main className="min-h-svh grid place-items-center bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 px-4">
    <div className="w-full max-w-md">
      <div className="rounded-lg shadow-xl bg-white p-8">
        {/* Header */}
        <h1 className="text-xl font-bold text-center mb-6">
          Welcome to Employment Management System
        </h1>
        <h2 className="text-lg font-semibold text-center mb-6">Login</h2>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Email or Username"
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 text-white font-medium py-2 hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm">
            Not registered?{" "}
            <a href="/register" className="text-indigo-600 hover:underline font-medium">
              Register now
            </a>
          </p>
          <p className="text-sm">
            Forgot your password?{" "}
            <a href="/change-password" className="text-indigo-600 hover:underline font-medium">
              Change password
            </a>
          </p>
        </div>
      </div>
    </div>
  </main>
);

}
