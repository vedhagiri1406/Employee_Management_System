import React, { useEffect, useRef, useState } from "react";
import Sortable from "sortablejs";
import api from "../api/api";
import Section from "../components/Section";
import PageHeader from "../components/PageHeader";
import Input, { Label } from "../components/Input";
import Select from "../components/Select";
import Checkbox from "../components/Checkbox";
import Button from "../components/Button";

const TYPES = ["text", "number", "date", "password"];

export default function FormBuilder() {
  const [name, setName] = useState("");
  const [fields, setFields] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    const sortable = Sortable.create(listRef.current, {
      animation: 150,
      handle: ".grab",
      onEnd: (evt) => {
        const arr = Array.from(fields);
        const [moved] = arr.splice(evt.oldIndex, 1);
        arr.splice(evt.newIndex, 0, moved);
        setFields(arr.map((f, i) => ({ ...f, order: i })));
      },
    });
    return () => sortable.destroy();
  }, [fields]);

  function addField() {
    const id = crypto.randomUUID();
    setFields([...fields, { id, label: "Field", type: "text", required: false, order: fields.length }]);
  }

  async function save() {
    if (!name.trim()) return alert("Template name is required");
    await api.post("/api/forms/", { name, fields });
    alert("Template saved");
    setName(""); setFields([]);
  }

  return (
    <div className="container-app page-narrow">
      <PageHeader title="Form Builder" />

      <Section title="Template">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label>Template name</Label>
            <Input value={name} onChange={(e)=>setName(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={addField}>Add Field</Button>
          </div>
        </div>
      </Section>

      <ul ref={listRef} className="space-y-3">
        {fields.map((f) => (
          <li key={f.id} className="section">
            <div className="grid md:grid-cols-[24px_1fr_160px_120px] gap-3 items-center">
              <span className="grab text-gray-500 select-none">≡</span>
              <div>
                <Label>Label</Label>
                <Input value={f.label} onChange={e=>setFields(fields.map(x=>x.id===f.id?{...x, label:e.target.value}:x))} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={f.type} onChange={e=>setFields(fields.map(x=>x.id===f.id?{...x, type:e.target.value}:x))}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div className="pt-6">
                <Checkbox
                  label="Required"
                  checked={f.required}
                  onChange={(e)=>setFields(fields.map(x=>x.id===f.id?{...x, required:e.target.checked}:x))}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <Button onClick={save}>Save Template</Button>
      </div>
    </div>
  );
}
