// client/src/pages/simulator/Simulator.js
//
// This page only ever calls POST /api/simulator/*, which are read-only on
// the backend (see server/controllers/simulatorController.js — it never
// writes to any collection). Nothing run here changes real Inventory,
// Crop, Production or Sale data.

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import api from "../../services/api";

const SCENARIOS = [
  { key: "inventory-sale", label: "Inventory Sale" },
  { key: "price-change", label: "Price Change" },
  { key: "demand-change", label: "Demand Change" },
  { key: "production-change", label: "Production Change" },
  { key: "inventory-consumption", label: "Inventory Consumption" },
];

export default function Simulator() {
  const [scenario, setScenario] = useState("inventory-sale");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/inventory")
      .then((res) => setInventoryItems(res.data.items))
      .catch(() => {
        /* Inventory list is a convenience for auto-filling current values;
           the simulator still works with manually typed values if this fails. */
      });
  }, []);

  useEffect(() => {
    setInputs({});
    setResult(null);
    setError("");
  }, [scenario]);

  function handleInput(e) {
    const { name, value } = e.target;
    setInputs((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "inventoryItemId" && value) {
        const item = inventoryItems.find((i) => i._id === value);
        if (item) {
          next.currentStock = item.quantity;
          next.minimumThreshold = item.minimumThreshold;
          next.currentPrice = item.currentPrice;
        }
      }
      return next;
    });
  }

  async function handleCalculate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post(`/simulator/${scenario}`, inputs);
      setResult(res.data.result);
    } catch (err) {
      setError(err.message || "Could not run simulation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>What-If Business Simulator</h1>
      </div>
      <p style={{ color: "var(--muted)", marginTop: -12 }}>
        Hypothetical projections only. Nothing here changes real Inventory, Crop, Production or Sales data.
      </p>

      <div className="card" style={{ maxWidth: 520 }}>
        <div className="form-group">
          <label htmlFor="scenario">Scenario</label>
          <select id="scenario" value={scenario} onChange={(e) => setScenario(e.target.value)}>
            {SCENARIOS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleCalculate}>
          {(scenario === "inventory-sale" || scenario === "demand-change" || scenario === "inventory-consumption") && (
            <div className="form-group">
              <label htmlFor="inventoryItemId">Inventory Item (optional — auto-fills current values)</label>
              <select id="inventoryItemId" name="inventoryItemId" value={inputs.inventoryItemId || ""} onChange={handleInput}>
                <option value="">— Enter values manually —</option>
                {inventoryItems.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name} ({i.quantity} {i.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          {scenario === "inventory-sale" && (
            <>
              <NumberField label="Current Stock (kg)" name="currentStock" value={inputs.currentStock} onChange={handleInput} />
              <NumberField label="Minimum Threshold (kg)" name="minimumThreshold" value={inputs.minimumThreshold} onChange={handleInput} />
              <NumberField label="Current Price (per kg)" name="currentPrice" value={inputs.currentPrice} onChange={handleInput} />
              <NumberField label="Hypothetical Sale (kg)" name="hypotheticalSale" value={inputs.hypotheticalSale} onChange={handleInput} required />
            </>
          )}

          {scenario === "price-change" && (
            <>
              <NumberField label="Current Price" name="currentPrice" value={inputs.currentPrice} onChange={handleInput} required />
              <NumberField label="Hypothetical Price" name="hypotheticalPrice" value={inputs.hypotheticalPrice} onChange={handleInput} required />
              <NumberField label="Quantity" name="quantity" value={inputs.quantity} onChange={handleInput} required />
            </>
          )}

          {scenario === "demand-change" && (
            <>
              <NumberField label="Current Stock (optional, for impact)" name="currentStock" value={inputs.currentStock} onChange={handleInput} />
              <NumberField label="Minimum Threshold (optional)" name="minimumThreshold" value={inputs.minimumThreshold} onChange={handleInput} />
              <NumberField label="Current Expected Demand (kg/month)" name="currentDemand" value={inputs.currentDemand} onChange={handleInput} required />
              <NumberField label="Demand Change (%, e.g. 20 or -10)" name="demandChangePercent" value={inputs.demandChangePercent} onChange={handleInput} required />
            </>
          )}

          {scenario === "production-change" && (
            <>
              <NumberField label="Current Production (kg)" name="currentProduction" value={inputs.currentProduction} onChange={handleInput} required />
              <NumberField label="Production Change (%, e.g. 15 or -10)" name="productionChangePercent" value={inputs.productionChangePercent} onChange={handleInput} required />
            </>
          )}

          {scenario === "inventory-consumption" && (
            <>
              <NumberField label="Current Stock (kg)" name="currentStock" value={inputs.currentStock} onChange={handleInput} />
              <NumberField label="Minimum Threshold (optional)" name="minimumThreshold" value={inputs.minimumThreshold} onChange={handleInput} />
              <NumberField label="Monthly Consumption (kg)" name="monthlyConsumption" value={inputs.monthlyConsumption} onChange={handleInput} required />
              <NumberField label="Months" name="months" value={inputs.months} onChange={handleInput} required />
            </>
          )}

          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Calculating..." : "Calculate"}
          </button>
        </form>
      </div>

      {result && <ResultCard result={result} />}
    </div>
  );
}

function NumberField({ label, name, value, onChange, required }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type="number" step="any" value={value ?? ""} onChange={onChange} required={required} />
    </div>
  );
}

function ResultCard({ result }) {
  const currentEntries = Object.entries(result.currentValue || {}).filter(([, v]) => v !== null && v !== undefined);
  const projectedEntries = Object.entries(result.projectedValue || {}).filter(([, v]) => v !== null && v !== undefined);
  const differenceEntries = Object.entries(result.difference || {}).filter(([, v]) => v !== null && v !== undefined);

  // Simple current-vs-projected chart for the first matching numeric metric.
  const chartKey = projectedEntries.length > 0 ? projectedEntries[0][0] : null;
  const chartData =
    chartKey && currentEntries.find(([k]) => k === chartKey)
      ? [
          { name: "Current", value: Number(currentEntries.find(([k]) => k === chartKey)[1]) },
          { name: "Projected", value: Number(projectedEntries.find(([k]) => k === chartKey)[1]) },
        ]
      : null;

  return (
    <div className="card" style={{ marginTop: 20, maxWidth: 700 }}>
      <h3 style={{ marginTop: 0 }}>Results</h3>
      {result.warning && (
        <div className="alert alert-error" style={{ fontWeight: 600 }}>
          {result.warning}
        </div>
      )}
      <div className="stat-grid">
        <ResultBlock title="Current Value" entries={currentEntries} />
        <ResultBlock title="Hypothetical Change" entries={Object.entries(result.hypotheticalChange || {})} />
        <ResultBlock title="Projected Value" entries={projectedEntries} />
        <ResultBlock title="Difference" entries={differenceEntries} />
      </div>
      {chartData && (
        <div style={{ marginTop: 20 }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2e7d32" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function ResultBlock({ title, entries }) {
  return (
    <div className="stat-card">
      <div className="stat-label" style={{ marginBottom: 8 }}>
        {title}
      </div>
      {entries.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--muted)" }}>—</div>
      ) : (
        entries.map(([key, value]) => (
          <div key={key} style={{ fontSize: 13 }}>
            {key}: <strong>{String(value)}</strong>
          </div>
        ))
      )}
    </div>
  );
}
