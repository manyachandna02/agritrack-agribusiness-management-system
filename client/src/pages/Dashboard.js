// client/src/pages/Dashboard.js
//
// Week 2 dashboard is deliberately basic per spec: four counts pulled
// from GET /api/dashboard/stats (backed by real MongoDB queries — see
// server/controllers/dashboardController.js). No charts/analytics yet;
// that's Week 3.

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data.stats))
      .catch((err) => setError(err.message || "Could not load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <p style={{ color: "var(--muted)", marginTop: -12 }}>
        Welcome back, {user?.name} ({user?.role}).
      </p>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{stats?.totalCrops ?? "-"}</div>
            <div className="stat-label">Total Crops</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalInventoryItems ?? "-"}</div>
            <div className="stat-label">Total Inventory Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.lowStockItems ?? "-"}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalProductionRecords ?? "-"}</div>
            <div className="stat-label">Total Production Records</div>
          </div>
        </div>
      )}
      <div className="card" style={{ marginTop: 20 }}>
        <strong>Coming in Week 3:</strong>
        <p className="coming-soon">Sales, Reports & Analytics, What-If Simulator.</p>
      </div>
    </div>
  );
}
