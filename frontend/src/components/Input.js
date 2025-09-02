import React from "react";

export function Label({ children, className = "" }) {
  return <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>{children}</label>;
}

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
