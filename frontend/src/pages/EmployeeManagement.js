// src/pages/EmployeeManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import "../App.css";

/* -------- helpers -------- */
const toKey = (s) =>
  s.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

/* -------- main -------- */
export default function EmployeeManagement() {
  /* Templates */
  const [templates, setTemplates] = useState([]);
  const [tplId, setTplId] = useState(null);
  const [fields, setFields] = useState([]); // [{id,label,key,type,required,order}]
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  /* Employees */
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  /* Create/Update form */
  const [editing, setEditing] = useState(null); // whole employee object when editing
  const [values, setValues] = useState({}); // { key: value }
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState("");
  const [formErrs, setFormErrs] = useState({}); // field or "__all__" errors

  /* Filters (server-side) */
  const [filters, setFilters] = useState({}); // { key: string }

  /* -------- load templates on mount -------- */
  useEffect(() => {
    (async () => {
      setLoadingTemplates(true);
      try {
        const { data } = await api.get("/forms/");
        setTemplates(data || []);
        if (data?.length) applyTemplate(data[0]);
      } finally {
        setLoadingTemplates(false);
      }
    })();
  }, []);

  /* -------- load employees when template or filters change -------- */
  useEffect(() => {
    if (!tplId) return;
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tplId, filters]);

  async function loadEmployees() {
    setLoadingEmployees(true);
    try {
      const params = new URLSearchParams({ template: tplId });
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
      const { data } = await api.get(`/employees/?${params.toString()}`);
      setEmployees(data || []);
    } finally {
      setLoadingEmployees(false);
    }
  }

  function applyTemplate(tpl) {
    setTplId(tpl.id);
    const fs = (tpl.fields || [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((f, i) => ({
        id: f.id || `${i}_${f.key || toKey(f.label)}`,
        label: f.label,
        key: f.key || toKey(f.label),
        type: f.type || "text",
        required: !!f.required,
        order: f.order ?? i,
      }));
    setFields(fs);
    setEditing(null);
    const blank = {};
    fs.forEach((f) => (blank[f.key] = ""));
    setValues(blank);
    setFilters({});
  }

  /* -------- create/update -------- */
  function startCreate() {
    setEditing(null);
    const blank = {};
    fields.forEach((f) => (blank[f.key] = ""));
    setValues(blank);
    setFormMsg("");
    setFormErrs({});
  }

  function startEdit(emp) {
    setEditing(emp);
    const copy = {};
    fields.forEach((f) => (copy[f.key] = emp.values?.[f.key] ?? ""));
    setValues(copy);
    setFormMsg("");
    setFormErrs({});
  }

  function onChangeValue(key, raw) {
    setValues((v) => ({ ...v, [key]: raw }));
  }

  function parseError(e, fallback = "Something went wrong") {
    const data = e?.response?.data;
    if (!data) return { __all__: fallback };
    if (typeof data === "string") return { __all__: data };
    // DRF ValidationError can be nested; normalize:
    // - {"values": "Missing required fields: ..."}
    // - {"first_name": "Must be a number"} or {"values": {"first_name": "..."}} (depending on server)
    if (data.values && typeof data.values === "string") {
      return { __all__: data.values };
    }
    if (data.values && typeof data.values === "object") {
      return data.values;
    }
    return data;
  }

  async function submitEmployee(e) {
    e.preventDefault();
    if (!tplId) return;
    setSaving(true);
    setFormMsg("");
    setFormErrs({});
    const payload = { template: tplId, values };

    try {
      if (editing) {
        const { data } = await api.put(`/employees/${editing.id}/`, payload);
        setEmployees((xs) => xs.map((x) => (x.id === editing.id ? data : x)));
        setFormMsg("Employee updated");
      } else {
        const { data } = await api.post(`/employees/`, payload);
        setEmployees((xs) => [data, ...xs]);
        setFormMsg("Employee created");
      }
      startCreate();
    } catch (e) {
      setFormErrs(parseError(e, "Failed to save employee"));
    } finally {
      setSaving(false);
      if (formMsg) {
        setTimeout(() => setFormMsg(""), 1500);
      }
    }
  }

  async function removeEmployee(id) {
    const ok =
      typeof window !== "undefined"
        ? window.confirm("Delete this employee?")
        : true;
    if (!ok) return;
    try {
      await api.delete(`/employees/${id}/`);
      setEmployees((xs) => xs.filter((x) => x.id !== id));
    } catch {
      alert("Failed to delete employee.");
    }
  }

  /* -------- UI helpers -------- */
  const hasTemplates = templates.length > 0;
  const templateOptions = useMemo(
    () =>
      templates.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      )),
    [templates]
  );

  return (
    <div className="page-wrap">
      {/* ===== Template chooser ===== */}
      <div className="card">
        <div className="card-head">
          <h2>Choose Form Template</h2>
          <div className="row gap">
            <select
              className="input"
              value={tplId || ""}
              onChange={(e) => {
                const id = e.target.value;
                const tpl = templates.find((t) => String(t.id) === id);
                if (tpl) applyTemplate(tpl);
              }}
              disabled={loadingTemplates || !hasTemplates}
            >
              {hasTemplates ? templateOptions : <option>No templates</option>}
            </select>
            <span className="muted">
              (Create/modify templates in the <code>Form Design</code> page)
            </span>
          </div>
        </div>
        {!hasTemplates && (
          <div className="muted">
            No templates found. Go to the <strong>Form Design</strong> page and
            create one.
          </div>
        )}
      </div>

      {/* ===== Employee Create / Update ===== */}
      <div className="card">
        <div className="card-head">
          <h2>Employee Creation &amp; Update</h2>
          <button className="btn" onClick={startCreate} disabled={!tplId}>
            New Employee
          </button>
        </div>

        <form className="grid grid-2" onSubmit={submitEmployee}>
          {fields.map((f) => (
            <label key={f.id}>
              {f.label}
              <input
                className={`input ${formErrs[f.key] ? "input-error" : ""}`}
                // Keep password as text to avoid browser managers, like previous impl.
                type={f.type === "password" ? "text" : f.type}
                required={!!f.required}
                value={values[f.key] ?? ""}
                onChange={(e) => onChangeValue(f.key, e.target.value)}
                placeholder={`Enter ${f.label}`}
                disabled={!tplId}
              />
              {formErrs[f.key] && (
                <div className="error small">{String(formErrs[f.key])}</div>
              )}
            </label>
          ))}

          <div className="grid-span-2">
            {formErrs.__all__ && (
              <div className="error" style={{ marginBottom: 8 }}>
                {String(formErrs.__all__)}
              </div>
            )}
            {formMsg && (
              <div className="success" style={{ marginBottom: 8 }}>
                {formMsg}
              </div>
            )}
            <div className="row">
              <button className="btn primary" disabled={!tplId || saving}>
                {editing ? "Update" : "Create"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="btn"
                  onClick={startCreate}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {!tplId && (
          <div className="muted">Select a template to enable the form.</div>
        )}
      </div>

      {/* ===== Employee Listing ===== */}
      <div className="card">
        <div className="card-head">
          <h2>Employee Listing</h2>
          <div className="row gap" style={{ flexWrap: "wrap" }}>
            {fields.map((f) => (
              <input
                key={f.id}
                className="input"
                style={{ minWidth: 200 }}
                placeholder={`Filter by ${f.label}`}
                value={filters[f.key] || ""}
                onChange={(e) =>
                  setFilters((old) => ({ ...old, [f.key]: e.target.value }))
                }
                disabled={!tplId}
              />
            ))}
            {fields.length > 0 && (
              <button
                className="btn"
                onClick={() => setFilters({})}
                disabled={!tplId}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="table">
          <div
            className="table-head"
            style={{
              gridTemplateColumns: `60px ${fields
                .map(() => "1fr")
                .join(" ")} 140px`,
            }}
          >
            <div className="th">#</div>
            {fields.map((f) => (
              <div className="th" key={f.id}>
                {f.label}
              </div>
            ))}
            <div className="th">Actions</div>
          </div>

          {loadingEmployees && <div className="muted p8">Loading…</div>}

          {!loadingEmployees &&
            employees.map((emp, idx) => (
              <div
                className="table-row"
                key={emp.id ?? idx}
                style={{
                  gridTemplateColumns: `60px ${fields
                    .map(() => "1fr")
                    .join(" ")} 140px`,
                }}
              >
                <div className="td">{idx + 1}</div>
                {fields.map((f) => (
                  <div className="td" key={f.id}>
                    {String(emp.values?.[f.key] ?? "")}
                  </div>
                ))}
                <div className="td actions-col">
                  <button className="btn small" onClick={() => startEdit(emp)}>
                    Edit
                  </button>
                  <button
                    className="btn small danger"
                    onClick={() => removeEmployee(emp.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

          {!loadingEmployees && tplId && !employees.length && (
            <div className="muted p8">No employees for this template.</div>
          )}
        </div>

        <div className="muted" style={{ marginTop: 8 }}>
          Filters are sent as query params to <code>/api/employees/</code>, e.g.{" "}
          <code>?template=ID&amp;first_name=Ann</code>.
        </div>
      </div>
    </div>
  );
}
