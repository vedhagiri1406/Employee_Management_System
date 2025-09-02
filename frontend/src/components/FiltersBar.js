import React from "react";
import Card from "./Card";
import Input from "./Input";
import { keyFromLabel } from "../utils/keys";

export default function FiltersBar({ template, filters, onChange }) {
  if (!template) return null;
  return (
    <Card className="flex flex-wrap gap-3">
      {template.fields.map((f) => {
        const k = f.key || keyFromLabel(f.label);
        return (
          <Input
            key={f.id}
            placeholder={f.label}
            value={filters[k] || ""}
            onChange={(e) => onChange(k, e.target.value)}
            className="w-56"
          />
        );
      })}
    </Card>
  );
}
