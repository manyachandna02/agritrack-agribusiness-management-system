// client/src/pages/inventory/InventoryList.js
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function statusBadgeClass(status) {
  if (status === "In Stock") return "badge badge-in-stock";
  if (status === "Low Stock") return "badge badge-low-stock";
  return "badge badge-out-of-stock";
}

export default function InventoryList() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/inventory")
      .then((res) => setItems(res.data.items))
      .catch((err) => setError(err.message || "Could not load inventory."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this inventory item?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      load();
    } catch (err) {
      setError(err.message || "Could not delete item.");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Inventory</h1>
        {canManage && (
          <Link className="btn btn-primary" to="/inventory/add">
            + Add Item
          </Link>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No inventory items yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Supplier</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>
                    {item.quantity} {item.unit}
                  </td>
                  <td>
                    {item.minimumThreshold} {item.unit}
                  </td>
                  <td>
                    <span className={statusBadgeClass(item.status)}>{item.status}</span>
                  </td>
                  <td>{item.supplier || "-"}</td>
                  <td>
                    <Link className="btn btn-secondary btn-sm" to={`/inventory/edit/${item._id}`}>
                      Edit
                    </Link>{" "}
                    {canManage && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
