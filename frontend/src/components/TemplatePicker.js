import React from "react";
import Card from "./Card";
import Select from "./Select";
import { Label } from "./Input";

export default function TemplatePicker({ templates, templateId, onChange }) {
  return (
    <Card>
      <Label>Template</Label>
      <Select value={templateId} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select...</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </Select>
    </Card>
  );
}
