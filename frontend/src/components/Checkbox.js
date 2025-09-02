// src/components/Checkbox.jsx
import React from "react";

export default function Checkbox({ label, ...props }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" className="h-4 w-4" {...props} />
      {label}
    </label>
  );
}
