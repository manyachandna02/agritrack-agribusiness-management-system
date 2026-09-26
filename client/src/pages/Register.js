// client/src/pages/Register.js
//
// POST /api/auth/register is ADMIN-only on the backend (there is no
// public self-signup in this system — accounts are provisioned by an
// admin). This page is reachable only via an ADMIN-restricted route
// (see App.js) and is how Manager/Farm Staff/additional Admin accounts
// get created.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ROLES = ["ADMIN", "MANAGER", "FARM_STAFF"];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "FARM_STAFF" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.post("/auth/register", form);
      setSuccess(`Account created for ${form.email}.`);
      setForm({ name: "", email: "", password: "", role: "FARM_STAFF" });
    } catch (err) {
      setError(err.message || "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Create User</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/users")}>
          Back to Users
        </button>
      </div>
      <div className="card" style={{ maxWidth: 420 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
