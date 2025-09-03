import React, { useEffect, useState } from "react";
import api from "../api/api";
import "../App.css";

export default function Profile() {
  const [u, setU] = useState({ name: "", email: "" });

  useEffect(() => {
    api.get("/auth/profile/").then(({ data }) => {
      const name =
        [data.first_name, data.last_name].filter(Boolean).join(" ") ||
        data.username || "";
      setU({ name, email: data.email || "" });
    });
  }, []);

  return (
    <div className="page-wrap">
      <div className="card">
        <h2>Profile</h2>
        <div className="grid grid-2">
          <div>
            <strong>Name:</strong>
            <div className="muted">{u.name}</div>
          </div>
          <br />
          <div>
            <strong>Email:</strong>
            <div className="muted">{u.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
