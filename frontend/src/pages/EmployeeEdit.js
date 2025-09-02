import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Section from "../components/Section";
import PageHeader from "../components/PageHeader";
import FieldRenderer from "../components/FieldRenderer";
import Button from "../components/Button";
import { keyFromLabel } from "../utils/keys";

export default function EmployeeEdit() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState({});

  useEffect(() => {
    api.get(`/api/employees/${id}/`).then(async ({ data }) => {
      setRecord(data);
      setValues(data.values || {});
      const { data: tpl } = await api.get(`/api/forms/${data.template}/`);
      setTemplate(tpl);
    });
  }, [id]);

  function updateValue(k, v) { setValues((prev) => ({ ...prev, [k]: v })); }

  async function save(e) {
    e.preventDefault();
    await api.put(`/api/employees/${id}/`, { template: template.id, values });
    alert("Updated!");
  }

  if (!template) return <div className="container-app page-narrow"><p>Loading...</p></div>;

  return (
    <div className="container-app page-narrow">
      <PageHeader title={`Edit Employee #${record?.id}`} />
      <Section title="Details">
        <form onSubmit={save} className="space-y-4">
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
    </div>
  );
}
