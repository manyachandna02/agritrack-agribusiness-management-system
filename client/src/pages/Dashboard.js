// client/src/pages/Dashboard.js
//
// Week 3 Dashboard
// Uses GET /api/dashboard/stats for real MongoDB-backed
// statistics and chart-ready analytics.

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const STATUS_COLORS = {
  "In Stock": "#2e7d32",
  "Low Stock": "#ef6c00",
  "Out of Stock": "#c62828",
};

const CROP_STATUS_COLORS = {
  Planned: "#6b7a71",
  Growing: "#2e7d32",
  Harvested: "#1b5e20",
};

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => {
        setStats(res.data.stats);
        setCharts(res.data.charts);
      })
      .catch((err) =>
        setError(err.message || "Could not load dashboard stats.")
      )
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
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">
                {stats?.totalCrops ?? "-"}
              </div>
              <div className="stat-label">Total Crops</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">
                {stats?.totalInventoryItems ?? "-"}
              </div>
              <div className="stat-label">Total Inventory Items</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">
                {stats?.lowStockItems ?? "-"}
              </div>
              <div className="stat-label">Low Stock Items</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">
                {stats?.totalProductionRecords ?? "-"}
              </div>
              <div className="stat-label">Total Production Records</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">
                {stats?.totalProductionQuantity ?? "-"}
              </div>
              <div className="stat-label">Total Production Quantity</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">
                {stats?.totalSales ?? "-"}
              </div>
              <div className="stat-label">Total Sales</div>
            </div>

            <div className="stat-card">
              <div className="stat-value">
                {stats?.totalRevenue ?? "-"}
              </div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>

          {charts && (
            <div
              className="stat-grid"
              style={{
                marginTop: 24,
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(320px, 1fr))",
              }}
            >
              {/* Sales / Revenue */}
              <ChartCard title="Sales / Revenue Trend">
                {charts.salesTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={charts.salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="revenue"
                        fill="#2e7d32"
                        name="Revenue"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No sales recorded yet." />
                )}
              </ChartCard>

              {/* Production */}
              <ChartCard title="Production by Crop">
                {charts.productionByCrop?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={charts.productionByCrop}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="cropName"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="totalQuantity"
                        fill="#2e7d32"
                        name="Production"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No production records yet." />
                )}
              </ChartCard>

              {/* Inventory */}
              <ChartCard title="Inventory Status">
                {charts.inventoryStatusBreakdown?.some(
                  (s) => s.count > 0
                ) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={charts.inventoryStatusBreakdown}
                        dataKey="count"
                        nameKey="status"
                        outerRadius={80}
                        label
                      >
                        {charts.inventoryStatusBreakdown.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={
                              STATUS_COLORS[entry.status] || "#999"
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No inventory items yet." />
                )}
              </ChartCard>

              {/* Crop Status */}
              <ChartCard title="Crop Status">
                {charts.cropStatusBreakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={charts.cropStatusBreakdown}
                        dataKey="count"
                        nameKey="status"
                        outerRadius={80}
                        label
                      >
                        {charts.cropStatusBreakdown.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={
                              CROP_STATUS_COLORS[entry.status] ||
                              "#999"
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="No crops yet." />
                )}
              </ChartCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card">
      <strong>{title}</strong>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function EmptyChart({ message }) {
  return <p className="coming-soon">{message}</p>;
}