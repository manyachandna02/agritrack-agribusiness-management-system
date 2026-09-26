// client/src/pages/production/ProductionList.js
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ProductionList() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const canDelete = user?.role === "ADMIN" || user?.role === "MANAGER";

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/production")
      .then((res) => setRecords(res.data.records))
      .catch((err) => setError(err.message || "Could not load production records."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this production record?")) return;
    try {
      await api.delete(`/production/${id}`);
      load();
    } catch (err) {
      setError(err.message || "Could not delete record.");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Production</h1>
        <Link className="btn btn-primary" to="/production/add">
          + Add Record
        </Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : records.length === 0 ? (
          <p>No production records yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Quality</th>
                <th>Farm</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec._id}>
                  <td>{rec.crop?.name || "(deleted crop)"}</td>
                  <td>{rec.quantity}</td>
                  <td>{new Date(rec.date).toLocaleDateString()}</td>
                  <td>{rec.quality}</td>
                  <td>{rec.farm}</td>
                  <td>
                    <Link className="btn btn-secondary btn-sm" to={`/production/edit/${rec._id}`}>
                      Edit
                    </Link>{" "}
                    {canDelete && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rec._id)}>
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
