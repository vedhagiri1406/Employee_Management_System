// src/components/Select.jsx
import React from "react";

export default function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
