import React, { useEffect, useState } from "react";
import api from "../api/api";
import Section from "../components/Section";
import PageHeader from "../components/PageHeader";
import Input from "../components/Input";
import Button from "../components/Button";
import FormField from "../components/FormField";

export default function Profile() {
  const [u, setU] = useState({ username: "", email: "", first_name: "", last_name: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => { api.get("/auth/profile/").then(({ data }) => setU(data)); }, []);

  async function save(e) {
    e.preventDefault();
    await api.put("/auth/profile/", u);
    setMsg("Saved!");
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div className="container-app page-narrow">
      <PageHeader title="Profile" />
      <Section>
        <form onSubmit={save} className="space-y-4">
          <FormField label="Username"><Input value={u.username || ""} onChange={(e)=>setU({...u, username:e.target.value})}/></FormField>
          <FormField label="Email"><Input value={u.email || ""} onChange={(e)=>setU({...u, email:e.target.value})}/></FormField>
          <FormField label="First name"><Input value={u.first_name || ""} onChange={(e)=>setU({...u, first_name:e.target.value})}/></FormField>
          <FormField label="Last name"><Input value={u.last_name || ""} onChange={(e)=>setU({...u, last_name:e.target.value})}/></FormField>
          <div className="flex items-center gap-3 justify-end">
            <Button type="submit">Save</Button>
            {msg && <span className="text-green-700">{msg}</span>}
          </div>
        </form>
      </Section>
    </div>
  );
}
