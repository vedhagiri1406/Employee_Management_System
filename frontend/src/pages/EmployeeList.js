import React, { useEffect, useState } from "react";
import api from "../api/api";
import Button from "../components/Button";
import TemplatePicker from "../components/TemplatePicker";
import FiltersBar from "../components/FiltersBar";
import Table from "../components/Table";
import Section from "../components/Section";
import PageHeader from "../components/PageHeader";
import { keyFromLabel } from "../utils/keys";
import { Link } from "react-router-dom";

export default function EmployeeList() {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [template, setTemplate] = useState(null);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => { api.get("/api/forms/").then(({ data }) => setTemplates(data)); }, []);
  useEffect(() => {
    if (!templateId) { setTemplate(null); setRows([]); return; }
    api.get(`/api/forms/${templateId}/`).then(({ data }) => {
      setTemplate(data);
      fetchRows({});
    });
  }, [templateId]);

  function fetchRows(extra = {}) {
    const params = new URLSearchParams({ template: templateId, ...filters, ...extra }).toString();
    api.get(`/api/employees/?${params}`).then(({ data }) => setRows(data));
  }

  function changeFilter(key, value) {
    const nf = { ...filters, [key]: value };
    setFilters(nf);
    const t = setTimeout(() => fetchRows(nf), 200);
    return () => clearTimeout(t);
  }

  async function remove(id) {
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/api/employees/${id}/`);
    fetchRows();
  }

  return (
    <div className="container-app page-wide">
      <PageHeader
        title="Employees"
        actions={<Link to="/employees/new"><Button>Add Employee</Button></Link>}
      />

      <Section>
        <TemplatePicker templates={templates} templateId={templateId} onChange={setTemplateId} />
      </Section>

      <Section>
        <FiltersBar template={template} filters={filters} onChange={changeFilter} />
      </Section>

      {template && (
        <Section>
          <Table
            header={
              <>
                {template.fields.map((f) => (
                  <th key={f.id}>{f.label}</th>
                ))}
                <th>Actions</th>
              </>
            }
            rows={
              rows.length ? rows.map((r) => (
                <tr key={r.id}>
                  {template.fields.map((f) => {
                    const k = f.key || keyFromLabel(f.label);
                    return <td key={k}>{String(r.values?.[k] ?? "")}</td>;
                  })}
                  <td className="flex items-center gap-3 py-2">
                    <Link to={`/employees/${r.id}`} className="text-blue-700 hover:underline">Edit</Link>
                    <button className="text-red-600 hover:underline" onClick={() => remove(r.id)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={template.fields.length + 1} className="py-6 text-center text-gray-500">No records</td></tr>
              )
            }
          />
        </Section>
      )}
    </div>
  );
}
