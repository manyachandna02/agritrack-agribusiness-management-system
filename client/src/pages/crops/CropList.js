// client/src/pages/crops/CropList.js
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function CropList() {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/crops")
      .then((res) => setCrops(res.data.crops))
      .catch((err) => setError(err.message || "Could not load crops."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this crop?")) return;
    try {
      await api.delete(`/crops/${id}`);
      load();
    } catch (err) {
      setError(err.message || "Could not delete crop.");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Crops</h1>
        {canManage && (
          <Link className="btn btn-primary" to="/crops/add">
            + Add Crop
          </Link>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : crops.length === 0 ? (
          <p>No crops yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Season</th>
                <th>Area</th>
                <th>Sowing Date</th>
                <th>Expected Harvest</th>
                <th>Status</th>
                {canManage && <th></th>}
              </tr>
            </thead>
            <tbody>
              {crops.map((crop) => (
                <tr key={crop._id}>
                  <td>{crop.name}</td>
                  <td>{crop.season}</td>
                  <td>{crop.area}</td>
                  <td>{new Date(crop.sowingDate).toLocaleDateString()}</td>
                  <td>{new Date(crop.expectedHarvest).toLocaleDateString()}</td>
                  <td>{crop.status}</td>
                  {canManage && (
                    <td>
                      <Link className="btn btn-secondary btn-sm" to={`/crops/edit/${crop._id}`}>
                        Edit
                      </Link>{" "}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(crop._id)}>
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
