import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import "../App.css";

/* ------------ helpers ------------ */
const toKey = (s) =>
  s.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
const newId = () =>
  String(Date.now()) + Math.random().toString(36).slice(2, 8);

/* Drag handle + row wrapper (only the handle is draggable) */
function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="row-drag">
      <span
        className="drag-handle"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
      >
        ⋮⋮
      </span>
      <div className="row-drag-content">{children}</div>
    </div>
  );
}

export default function FormDesign() {
  /* ---------- Templates ---------- */
  const [templates, setTemplates] = useState([]);
  const [tplId, setTplId] = useState(null);
  const [tplName, setTplName] = useState("New Template");
  // [{id,label,key,type,required,order}]
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  /* DnD sensors */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  /* Load templates once */
  useEffect(() => {
    refreshTemplates();
  }, []);

  async function refreshTemplates(selectFirst = true) {
    try {
      const { data } = await api.get("/forms/");
      setTemplates(data || []);
      if (selectFirst && data?.length) selectTemplate(data[0]);
      if (selectFirst && !data?.length) {
        // if none exist, reset the editor
        setTplId(null);
        setTplName("New Template");
        setFields([]);
      }
    } catch (e) {
      setErr(extractAxiosMessage(e, "Failed to load templates."));
    }
  }

  /* Select / CRUD templates */
  function selectTemplate(tpl) {
    setErr("");
    setTplId(tpl.id);
    setTplName(tpl.name || "Template");
    const fs = (tpl.fields || []).map((f, i) => ({
      id: f.id || `${i}_${newId()}`,
      label: f.label,
      key: f.key || toKey(f.label),
      type: f.type || "text",
      required: !!f.required,
      order: f.order ?? i,
    }));
    setFields(fs);
  }

  function newTemplate() {
    setErr("");
    setTplId(null);
    setTplName("New Template");
    setFields([]);
  }

  async function deleteTemplate() {
    if (!tplId) return;
    const ok = typeof window !== "undefined"
      ? window.confirm(`Delete "${tplName}" template?`)
      : true;
    if (!ok) return;
    try {
      await api.delete(`/forms/${tplId}/`);
      await refreshTemplates();
    } catch (e) {
      // Show DRF 409 detail (ProtectedError)
      setErr(
        e?.response?.data?.detail ||
          "Cannot delete template because it is used by one or more employees."
      );
    }
  }

  /* Field actions */
  function addField() {
    setFields((prev) => [
      ...prev,
      {
        id: newId(),
        label: "New Field",
        key: "new_field",
        type: "text",
        required: false,
        order: prev.length,
      },
    ]);
  }

  function updateField(i, patch) {
    setFields((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], ...patch };
      // keep key in sync if it looked auto-generated
      if (patch.label && (!prev[i].key || prev[i].key === toKey(prev[i].label))) {
        copy[i].key = toKey(patch.label);
      }
      return copy;
    });
  }

  function removeField(i) {
    setFields((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleDragEnd(e) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setFields((items) => {
      const oldIndex = items.findIndex((f) => String(f.id) === String(active.id));
      const newIndex = items.findIndex((f) => String(f.id) === String(over.id));
      const reordered = arrayMove(items, oldIndex, newIndex);
      return reordered.map((f, idx) => ({ ...f, order: idx }));
    });
  }

  /* Save with validation */
  // eslint-disable-next-line no-unused-vars
  const keySet = useMemo(() => new Set(fields.map((f) => f.key)), [fields]);

  function validate() {
    if (!tplName.trim()) return "Template name is required.";
    for (const f of fields) {
      if (!f.label.trim()) return "Every field must have a label.";
      if (!f.key.trim()) return "Every field must have a key.";
      if (!["text", "number", "date", "password"].includes(f.type)) {
        return `Unsupported type: ${f.type}`;
      }
    }
    // duplicate keys check
    const seen = new Set();
    for (const f of fields) {
      if (seen.has(f.key)) return `Duplicate key: "${f.key}".`;
      seen.add(f.key);
    }
    return "";
  }

  async function saveTemplate() {
    setErr("");
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setSaving(true);
    const payload = {
      name: tplName.trim(),
      fields: fields.map((f, i) => ({ ...f, order: i })),
    };

    try {
      if (tplId) {
        // Try update; if 404, fall back to create
        try {
          const { data } = await api.put(`/forms/${tplId}/`, payload);
          await refreshTemplates(false);
          selectTemplate(data);
        } catch (e) {
          if (e?.response?.status === 404) {
            const { data } = await api.post(`/forms/`, payload);
            await refreshTemplates(false);
            selectTemplate(data);
          } else {
            throw e;
          }
        }
      } else {
        const { data } = await api.post(`/forms/`, payload);
        await refreshTemplates(false);
        selectTemplate(data);
      }
    } catch (e) {
      setErr(extractAxiosMessage(e, "Failed to save template."));
    } finally {
      setSaving(false);
    }
  }

  /* UI */
  return (
    <div className="page-wrap">
      <div className="card">
        <div className="card-head">
          <h2>Form Design</h2>
          <div className="row gap">
            <select
              className="input"
              value={tplId || ""}
              onChange={(e) => {
                const id = e.target.value;
                const t = templates.find((x) => String(x.id) === id);
                if (t) selectTemplate(t);
              }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
              {!templates.length && <option value="">No templates yet</option>}
            </select>
            <button className="btn" onClick={newTemplate}>
              New
            </button>
            <button
              className="btn danger"
              onClick={deleteTemplate}
              disabled={!tplId}
            >
              Delete
            </button>
          </div>
        </div>

        {/* canvas + side actions */}
        <div className="builder-grid">
          {/* canvas */}
          <div className="builder-canvas">
            <label
              className="grid-span-2"
              style={{ display: "block", marginBottom: 10 }}
            >
              Template Name
              <input
                className="input"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                placeholder="e.g. Employee Basic Info"
              />
            </label>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => String(f.id))}
                strategy={verticalListSortingStrategy}
              >
                <div className="list">
                  {fields.map((f, i) => (
                    <SortableRow id={String(f.id)} key={f.id}>
                      <div className="field-row">
                        <input
                          className="input"
                          value={f.label}
                          onChange={(e) =>
                            updateField(i, { label: e.target.value })
                          }
                          placeholder="Label"
                        />
                        <select
                          className="input"
                          value={f.type}
                          onChange={(e) => updateField(i, { type: e.target.value })}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="password">Password</option>
                        </select>
                        <label className="row" style={{ gap: 8 }}>
                          <input
                            type="checkbox"
                            checked={!!f.required}
                            onChange={(e) =>
                              updateField(i, { required: e.target.checked })
                            }
                          />
                          required
                        </label>
                        <button
                          className="btn danger"
                          onClick={() => removeField(i)}
                        >
                          Delete
                        </button>
                      </div>
                    </SortableRow>
                  ))}
                  {!fields.length && (
                    <div className="muted" style={{ padding: 12 }}>
                      Click “Add Field” to start building your form.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>

            {err && (
              <div className="error" style={{ marginTop: 10 }}>
                {err}
              </div>
            )}
          </div>

          {/* actions */}
          <div className="builder-actions">
            <button className="btn block" onClick={addField}>
              Add Field
            </button>
            <button
              className="btn primary block"
              onClick={saveTemplate}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----- tiny helper for nicer axios errors ----- */
function extractAxiosMessage(e, fallback) {
  return (
    e?.response?.data?.detail ||
    e?.response?.data?.message ||
    (typeof e?.response?.data === "string" ? e.response.data : null) ||
    fallback
  );
}
