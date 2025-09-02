import React, { useEffect, useState } from "react";
import api from "../api/api";
import Section from "../components/Section";
import PageHeader from "../components/PageHeader";
import TemplatePicker from "../components/TemplatePicker";
import FieldRenderer from "../components/FieldRenderer";
import Button from "../components/Button";
import { keyFromLabel } from "../utils/keys";

export default function EmployeeCreate() {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState({});

  useEffect(() => { api.get("/api/forms/").then(({data}) => setTemplates(data)); }, []);
  useEffect(() => {
    if (!templateId) return setTemplate(null);
    api.get(`/api/forms/${templateId}/`).then(({ data }) => {
      setTemplate(data);
      const init = {};
      data.fields.forEach((f) => (init[f.key || keyFromLabel(f.label)] = ""));
      setValues(init);
    });
  }, [templateId]);

  function updateValue(k, v) { setValues((prev) => ({ ...prev, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    await api.post("/api/employees/", { template: template.id, values });
    alert("Created!");
  }

  return (
    <div className="container-app page-narrow">
      <PageHeader title="Create Employee" />
      <Section title="Template">
        <TemplatePicker templates={templates} templateId={templateId} onChange={setTemplateId} />
      </Section>

      {template && (
        <Section title="Details">
          <form onSubmit={submit} className="space-y-4">
            {template.fields.sort((a,b)=>a.order-b.order).map((f) => (
              <FieldRenderer
                key={f.id}
                field={f}
                value={values[f.key || keyFromLabel(f.label)]}
                onChange={updateValue}
              />
            ))}
            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Section>
      )}
    </div>
  );
}
