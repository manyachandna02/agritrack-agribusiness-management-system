// client/src/pages/inventory/InventoryForm.js
//
// One component handles both /inventory/add and /inventory/edit/:id.
// FARM_STAFF only reaches the edit route (no "Add Item" link is shown
// to them) and, per backend RBAC, may only change `quantity` there —
// this form disables every other field for that role so the UI matches
// what the API will actually accept.

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["Seeds", "Fertilizer", "Pesticide", "Equipment", "Tools", "Fuel", "Other"];
const UNITS = ["kg", "g", "l", "ml", "units", "bags", "boxes"];

const emptyForm = {
  name: "",
  category: "Seeds",
  quantity: "",
  unit: "kg",
  minimumThreshold: "",
  supplier: "",
  unitCost: "",
  currentPrice: "",
  averageMonthlySales: "",
};

export default function InventoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const farmStaffLimited = isEdit && user?.role === "FARM_STAFF";

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/inventory/${id}`)
      .then((res) => {
        const item = res.data.item;
        setForm({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          minimumThreshold: item.minimumThreshold,
          supplier: item.supplier || "",
          unitCost: item.unitCost || "",
          currentPrice: item.currentPrice || "",
          averageMonthlySales: item.averageMonthlySales || "",
        });
      })
      .catch((err) => setError(err.message || "Could not load item."))
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
      if (isEdit) {
        const payload = farmStaffLimited ? { quantity: Number(form.quantity) } : { ...form };
        if (!farmStaffLimited) {
          payload.quantity = Number(payload.quantity);
          payload.minimumThreshold = Number(payload.minimumThreshold);
          payload.unitCost = Number(payload.unitCost || 0);
          payload.currentPrice = Number(payload.currentPrice || 0);
          payload.averageMonthlySales = Number(payload.averageMonthlySales || 0);
        }
        await api.put(`/inventory/${id}`, payload);
      } else {
        await api.post("/inventory", {
          ...form,
          quantity: Number(form.quantity),
          minimumThreshold: Number(form.minimumThreshold),
          unitCost: Number(form.unitCost || 0),
          currentPrice: Number(form.currentPrice || 0),
          averageMonthlySales: Number(form.averageMonthlySales || 0),
        });
      }
      navigate("/inventory");
    } catch (err) {
      setError(err.message || "Could not save item.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? "Edit Inventory Item" : "Add Inventory Item"}</h1>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {farmStaffLimited && (
          <div className="alert alert-success">You can update quantity only.</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={farmStaffLimited}
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} disabled={farmStaffLimited}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <select id="unit" name="unit" value={form.unit} onChange={handleChange} disabled={farmStaffLimited}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="minimumThreshold">Minimum Threshold</label>
            <input
              id="minimumThreshold"
              name="minimumThreshold"
              type="number"
              min="0"
              value={form.minimumThreshold}
              onChange={handleChange}
              required
              disabled={farmStaffLimited}
            />
          </div>
          <div className="form-group">
            <label htmlFor="supplier">Supplier</label>
            <input id="supplier" name="supplier" value={form.supplier} onChange={handleChange} disabled={farmStaffLimited} />
          </div>
          <div className="form-group">
            <label htmlFor="unitCost">Unit Cost</label>
            <input
              id="unitCost"
              name="unitCost"
              type="number"
              min="0"
              step="0.01"
              value={form.unitCost}
              onChange={handleChange}
              disabled={farmStaffLimited}
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentPrice">Current Price</label>
            <input
              id="currentPrice"
              name="currentPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.currentPrice}
              onChange={handleChange}
              disabled={farmStaffLimited}
            />
          </div>
          <div className="form-group">
            <label htmlFor="averageMonthlySales">Average Monthly Sales</label>
            <input
              id="averageMonthlySales"
              name="averageMonthlySales"
              type="number"
              min="0"
              value={form.averageMonthlySales}
              onChange={handleChange}
              disabled={farmStaffLimited}
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>
            Status (In Stock / Low Stock / Out of Stock) is calculated automatically by the server.
          </p>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
