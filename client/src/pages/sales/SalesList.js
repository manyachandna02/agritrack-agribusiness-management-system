// client/src/pages/sales/SalesList.js
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function SalesList() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/sales")
      .then((res) => setSales(res.data.sales))
      .catch((err) => setError(err.message || "Could not load sales."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this sale? If it was linked to an inventory item, that stock will be restored.")) return;
    try {
      await api.delete(`/sales/${id}`);
      load();
    } catch (err) {
      setError(err.message || "Could not delete sale.");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Sales</h1>
        {canManage && (
          <Link className="btn btn-primary" to="/sales/add">
            + Record Sale
          </Link>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : sales.length === 0 ? (
          <p>No sales recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                {canManage && <th></th>}
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td>{new Date(sale.date).toLocaleDateString()}</td>
                  <td>{sale.customer}</td>
                  <td>{sale.product}</td>
                  <td>{sale.crop?.name || "-"}</td>
                  <td>{sale.quantity}</td>
                  <td>{sale.price}</td>
                  <td>{sale.totalAmount}</td>
                  {canManage && (
                    <td>
                      <Link className="btn btn-secondary btn-sm" to={`/sales/edit/${sale._id}`}>
                        Edit
                      </Link>{" "}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(sale._id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
