import React from "react";
import Input from "./Input";
import FormField from "./FormField";

export default function FieldRenderer({ field, value, onChange }) {
  const key = field.key || field.label;
  const common = {
    value: value ?? "",
    onChange: (e) => onChange(key, e.target.value),
  };

  return (
    <FormField label={field.label} required={field.required}>
      {field.type === "number" && <Input type="number" {...common} />}
      {field.type === "date" && <Input type="date" {...common} />}
      {field.type === "password" && <Input type="password" {...common} />}
      {["text", undefined, null].includes(field.type) && <Input {...common} />}
    </FormField>
  );
}
