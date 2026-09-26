// client/src/pages/sales/SalesForm.js
//
// A sale may optionally reference a Crop (for crop-level reporting) and/or
// an Inventory item (which the backend then atomically decrements — see
// server/controllers/saleController.js). Both are optional: a sale with
// neither is still valid (e.g. a miscellaneous product not tracked in
// Inventory).

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

const emptyForm = { customer: "", product: "", crop: "", inventoryItem: "", quantity: "", price: "", date: "" };

export default function SalesForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cropsRes, inventoryRes] = await Promise.all([api.get("/crops"), api.get("/inventory")]);
        setCrops(cropsRes.data.crops);
        setInventoryItems(inventoryRes.data.items);

        if (isEdit) {
          const saleRes = await api.get(`/sales/${id}`);
          const sale = saleRes.data.sale;
          setForm({
            customer: sale.customer,
            product: sale.product,
            crop: sale.crop?._id || "",
            inventoryItem: sale.inventoryItem?._id || "",
            quantity: sale.quantity,
            price: sale.price,
            date: toDateInput(sale.date),
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
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Convenience: picking an inventory item pre-fills product name and price
      // if those fields are still empty, without overwriting anything the user
      // already typed.
      if (name === "inventoryItem" && value) {
        const item = inventoryItems.find((i) => i._id === value);
        if (item) {
          if (!prev.product) next.product = item.name;
          if (!prev.price) next.price = item.currentPrice || "";
        }
      }
      return next;
    });
  }

  const selectedItem = inventoryItems.find((i) => i._id === form.inventoryItem);
  const totalPreview =
    form.quantity && form.price ? (Number(form.quantity) * Number(form.price)).toFixed(2) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        customer: form.customer,
        product: form.product,
        crop: form.crop || null,
        inventoryItem: form.inventoryItem || null,
        quantity: Number(form.quantity),
        price: Number(form.price),
        date: form.date,
      };
      if (isEdit) {
        await api.put(`/sales/${id}`, payload);
      } else {
        await api.post("/sales", payload);
      }
      navigate("/sales");
    } catch (err) {
      setError(err.message || "Could not save sale.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? "Edit Sale" : "Record Sale"}</h1>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customer">Customer</label>
            <input id="customer" name="customer" value={form.customer} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="crop">Crop (optional)</label>
            <select id="crop" name="crop" value={form.crop} onChange={handleChange}>
              <option value="">— None —</option>
              {crops.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.season})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="inventoryItem">Inventory Item (optional — sale will reduce this stock)</label>
            <select id="inventoryItem" name="inventoryItem" value={form.inventoryItem} onChange={handleChange}>
              <option value="">— None —</option>
              {inventoryItems.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.name} ({i.quantity} {i.unit} available)
                </option>
              ))}
            </select>
            {selectedItem && (
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                Current stock: {selectedItem.quantity} {selectedItem.unit}. This sale will reduce it — it will be
                rejected if the quantity below exceeds what is available.
              </p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="product">Product</label>
            <input id="product" name="product" value={form.product} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
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
            <label htmlFor="price">Price (per unit)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input id="date" name="date" type="date" value={form.date} onChange={handleChange} required />
          </div>
          {totalPreview && (
            <p style={{ fontSize: 14 }}>
              Total amount: <strong>{totalPreview}</strong> (calculated server-side on save)
            </p>
          )}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
