import React from "react";

export default function PageHeader({ title, subtitle, actions, className = "" }) {
  return (
    <div className={`flex items-start gap-3 mb-4 ${className}`}>
      <div className="flex-1">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
