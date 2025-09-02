import React from "react";
import { Link, useLocation } from "react-router-dom";

function NavLink({ to, children }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  }

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container-app py-3 flex items-center gap-3">
        <div className="font-semibold text-lg">EMS</div>
        <nav className="flex gap-2">
          <NavLink to="/">Employees</NavLink>
          <NavLink to="/employees/new">Add Employee</NavLink>
          <NavLink to="/forms">Form Builder</NavLink>
        </nav>
        <div className="ml-auto flex gap-2">
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/change-password">Change Password</NavLink>
          <button
            onClick={logout}
            className="px-3 py-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-black"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
