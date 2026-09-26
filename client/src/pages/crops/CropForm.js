// client/src/pages/crops/CropForm.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const STATUSES = ["Planned", "Growing", "Harvested"];

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

const emptyForm = { name: "", season: "", area: "", sowingDate: "", expectedHarvest: "", status: "Planned" };

export default function CropForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/crops/${id}`)
      .then((res) => {
        const crop = res.data.crop;
        setForm({
          name: crop.name,
          season: crop.season,
          area: crop.area,
          sowingDate: toDateInput(crop.sowingDate),
          expectedHarvest: toDateInput(crop.expectedHarvest),
          status: crop.status,
        });
      })
      .catch((err) => setError(err.message || "Could not load crop."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, area: Number(form.area) };
      if (isEdit) {
        await api.put(`/crops/${id}`, payload);
      } else {
        await api.post("/crops", payload);
      }
      navigate("/crops");
    } catch (err) {
      setError(err.message || "Could not save crop.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? "Edit Crop" : "Add Crop"}</h1>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="season">Season</label>
            <input id="season" name="season" value={form.season} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="area">Area (acres)</label>
            <input
              id="area"
              name="area"
              type="number"
              min="0.01"
              step="0.01"
              value={form.area}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sowingDate">Sowing Date</label>
            <input
              id="sowingDate"
              name="sowingDate"
              type="date"
              value={form.sowingDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="expectedHarvest">Expected Harvest</label>
            <input
              id="expectedHarvest"
              name="expectedHarvest"
              type="date"
              value={form.expectedHarvest}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
