import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import EmployeeManagement from "./pages/EmployeeManagement";
import FormDesign from "./pages/FormDesign";
import "./App.css";

function Protected({ children }) {
  const token = sessionStorage.getItem("access");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function Navbar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("access");
  if (!token) return null;

  function logout() {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    navigate("/login", { replace: true });
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/forms" className="nav-link">Form Builder</Link>
        <Link to="/employee_management" className="nav-link">Employee Management</Link>
      </div>
      <div className="navbar-right">
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/change-password" className="nav-link">Change Password</Link>
        <button onClick={logout} className="nav-button">Logout</button>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* protected */}
          <Route path="/" element={<Protected><EmployeeManagement /></Protected>} />
          <Route path="/forms" element={<Protected><FormDesign /></Protected>} />
          <Route path="/employee_management" element={<Protected><EmployeeManagement /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/change-password" element={<Protected><ChangePassword /></Protected>} />

          {/* public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
