// client/src/pages/reports/Reports.js
//
// All numbers here come from GET /api/reports/*, which computes them from
// real MongoDB data (server/services/analyticsService.js) — nothing here
// is hard-coded. Restricted to ADMIN/MANAGER at the route level (see App.js)
// to match the backend's authorization on /api/reports.

  import React, { useEffect, useState, useCallback } from "react";
  import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
  import api from "../../services/api";

  const TABS = ["Summary", "Sales", "Production", "Inventory", "Crops"];

  export default function Reports() {
    const [tab, setTab] = useState("Summary");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [data, setData] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const endpointFor = useCallback((t) => {
      switch (t) {
        case "Sales":
          return "/reports/sales";
        case "Production":
          return "/reports/production";
        case "Inventory":
          return "/reports/inventory";
        case "Crops":
          return "/reports/crops";
        default:
          return "/reports/summary";
      }
    }, []);

    const load = useCallback(() => {
      setLoading(true);
      setError("");
      setMessage("");
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      api
        .get(endpointFor(tab), { params })
        .then((res) => {
          setData(res.data.data);
          setMessage(res.data.message || "");
        })
        .catch((err) => setError(err.message || "Could not load report."))
        .finally(() => setLoading(false));
    }, [tab, from, to, endpointFor]);

    useEffect(() => {
      load();
    }, [load]);

    const supportsDateRange = tab === "Sales" || tab === "Production" || tab === "Summary";

    return (
      <div>
        <div className="page-header">
          <h1>Reports & Analytics</h1>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t}
                className={t === tab ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {supportsDateRange && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="from">From</label>
                <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="to">To</label>
                <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <button className="btn btn-secondary" onClick={load}>
                Apply
              </button>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}
          {!error && message && <p className="coming-soon">{message}</p>}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {tab === "Summary" && data && <SummaryReport data={data} />}
              {tab === "Sales" && data && <SalesReport data={data} />}
              {tab === "Production" && data && <ProductionReport data={data} />}
              {tab === "Inventory" && data && <InventoryReport data={data} />}
              {tab === "Crops" && data && <CropReport data={data} />}
            </>
          )}
        </div>
      </div>
    );
  }

 function SummaryReport({ data }) {
  const sales = data?.sales || {};
  const production = data?.production || {};
  const inventory = data?.inventory || {};
  const crops = data?.crops || {};

  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-value">
          {sales.totalTransactions ?? 0}
        </div>
        <div className="stat-label">Sales Transactions</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          {sales.totalRevenue ?? 0}
        </div>
        <div className="stat-label">Total Revenue</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          {sales.averageSaleValue ?? 0}
        </div>
        <div className="stat-label">Average Sale Value</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          {production.totalProduction ?? 0}
        </div>
        <div className="stat-label">Total Production</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          {inventory.totalItems ?? 0}
        </div>
        <div className="stat-label">Inventory Items</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          {inventory.lowStockCount ?? 0}
        </div>
        <div className="stat-label">Low Stock</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          {inventory.outOfStockCount ?? 0}
        </div>
        <div className="stat-label">Out of Stock</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">
          {crops.totalCrops ?? 0}
        </div>
        <div className="stat-label">Total Crops</div>
      </div>
    </div>
  );
}

  function SalesReport({ data }) {
    const byDate = Array.isArray(data.byDate) ? data.byDate : [];
    const byProduct = Array.isArray(data.byProduct) ? data.byProduct : [];

    return (
      <div>
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-value">{data.totalTransactions ?? 0}</div>
            <div className="stat-label">Transactions</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{data.totalRevenue ?? 0}</div>
            <div className="stat-label">Total Revenue</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{data.averageSaleValue ?? 0}</div>
            <div className="stat-label">Average Sale Value</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{data.totalQuantity ?? 0}</div>
            <div className="stat-label">Total Quantity Sold</div>
          </div>
        </div>

        {byDate.length > 0 && (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {byProduct.length > 0 && (
          <table style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>

            <tbody>
              {byProduct.map((p) => (
                <tr key={p.product}>
                  <td>{p.product}</td>
                  <td>{p.quantity}</td>
                  <td>{p.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {byDate.length === 0 && byProduct.length === 0 && (
          <p>No sales details available for the selected period.</p>
        )}
      </div>
    );
  }
  function InventoryReport({ data }) {
    const lowStockItems = Array.isArray(data.lowStockItems)
      ? data.lowStockItems
      : [];

    return (
      <div>
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-value">{data.totalItems ?? 0}</div>
            <div className="stat-label">Total Items</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{data.lowStockCount ?? 0}</div>
            <div className="stat-label">Low Stock</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{data.outOfStockCount ?? 0}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>

        {lowStockItems.length > 0 && (
          <>
            <strong>Low Stock Items</strong>

            <table style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                </tr>
              </thead>

              <tbody>
                {lowStockItems.map((i) => (
                  <tr key={i.id}>
                    <td>{i.name}</td>
                    <td>
                      {i.quantity} {i.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {lowStockItems.length === 0 && (
          <p>No low-stock items found.</p>
        )}
      </div>
    );
  }
function ProductionReport({ data }) {
  const byCrop = Array.isArray(data.byCrop) ? data.byCrop : [];

  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-value">{data.totalRecords ?? 0}</div>
          <div className="stat-label">Records</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{data.totalProduction ?? 0}</div>
          <div className="stat-label">Total Production</div>
        </div>
      </div>

      {byCrop.length > 0 && (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byCrop}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cropName" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalQuantity" name="Production" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {byCrop.length === 0 && (
        <p>No production details available for the selected period.</p>
      )}
    </div>
  );
}


function CropReport({ data }) {
  const byStatus = Array.isArray(data.byStatus) ? data.byStatus : [];

  const productionByCrop = Array.isArray(data.productionByCrop)
    ? data.productionByCrop
    : [];

  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-value">{data.totalCrops ?? 0}</div>
          <div className="stat-label">Total Crops</div>
        </div>

        {byStatus.map((s) => (
          <div className="stat-card" key={s.status}>
            <div className="stat-value">{s.count}</div>
            <div className="stat-label">{s.status}</div>
          </div>
        ))}
      </div>

      {productionByCrop.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Crop</th>
              <th>Total Production</th>
              <th>Records</th>
            </tr>
          </thead>

          <tbody>
            {productionByCrop.map((p) => (
              <tr key={p.cropId || p.cropName}>
                <td>{p.cropName}</td>
                <td>{p.totalQuantity}</td>
                <td>{p.records}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {productionByCrop.length === 0 && (
        <p>No production details available.</p>
      )}
    </div>
  );
}