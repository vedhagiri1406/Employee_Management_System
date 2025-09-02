// src/pages/ChangePassword.jsx
import React, { useState } from "react";
import api from "../api/api";

const GradientInput = ({ type = "text", ...props }) => (
  <div className="rounded-md bg-gradient-to-b from-white to-gray-200 p-[2px] shadow">
    <input
      type={type}
      className="w-full rounded-md bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none"
      {...props}
    />
  </div>
);

export default function ChangePassword() {
  const [f, setF] = useState({ old_password: "", new_password: "" });
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    await api.put("/auth/change-password/", f);
    setMsg("Password changed successfully");
    setF({ old_password: "", new_password: "" });
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg shadow-xl bg-indigo-950 p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Change Password</h2>

          <form onSubmit={submit} className="space-y-4">
            <GradientInput
              type="password"
              value={f.old_password}
              onChange={(e) => setF({ ...f, old_password: e.target.value })}
              placeholder="Old Password"
              required
            />
            <GradientInput
              type="password"
              value={f.new_password}
              onChange={(e) => setF({ ...f, new_password: e.target.value })}
              placeholder="New Password"
              required
            />

            <button
              type="submit"
              className="w-full rounded-md bg-yellow-400 text-black font-medium py-2 hover:bg-yellow-500 transition"
            >
              Save
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
