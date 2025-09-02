import React from "react";
import { Label } from "./Input";

export default function FormField({ label, required, hint, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
      <Label className="md:col-span-4">
        {label}{required && <span className="text-red-600"> *</span>}
      </Label>
      <div className="md:col-span-8">
        {children}
        {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      </div>
    </div>
  );
}
