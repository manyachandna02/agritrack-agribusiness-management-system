// client/src/pages/production/ProductionForm.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const QUALITY_GRADES = ["A", "B", "C"];

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

const emptyForm = { crop: "", quantity: "", date: "", quality: "A", farm: "" };

export default function ProductionForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const cropsRes = await api.get("/crops");
        setCrops(cropsRes.data.crops);

        if (isEdit) {
          const recRes = await api.get(`/production/${id}`);
          const rec = recRes.data.record;
          setForm({
            crop: rec.crop?._id || rec.crop,
            quantity: rec.quantity,
            date: toDateInput(rec.date),
            quality: rec.quality,
            farm: rec.farm,
          });
        }
      } catch (err) {
        setError(err.message || "Could not load form data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity) };
      if (isEdit) {
        await api.put(`/production/${id}`, payload);
      } else {
        await api.post("/production", payload);
      }
      navigate("/production");
    } catch (err) {
      setError(err.message || "Could not save production record.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? "Edit Production Record" : "Add Production Record"}</h1>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {crops.length === 0 ? (
          <p>You need at least one crop before adding a production record.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="crop">Crop</label>
              <select id="crop" name="crop" value={form.crop} onChange={handleChange} required>
                <option value="" disabled>
                  Select a crop
                </option>
                {crops.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.season})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity (kg)</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input id="date" name="date" type="date" value={form.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="quality">Quality</label>
              <select id="quality" name="quality" value={form.quality} onChange={handleChange}>
                {QUALITY_GRADES.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="farm">Farm</label>
              <input id="farm" name="farm" value={form.farm} onChange={handleChange} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
