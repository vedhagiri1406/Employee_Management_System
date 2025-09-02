import React from "react";

export default function Section({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`section ${className}`}>
      {(title || actions) && (
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            {title && <h2 className="section-h">{title}</h2>}
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
