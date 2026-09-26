// server/server.js
//
// AgriTrack backend entry point.
//
// WEEK 2 (Phases 1-6): Express app setup, MongoDB connection, health-check
// route, Authentication/JWT/RBAC, Inventory/Crop/Production CRUD, and
// centralized error handling.
//
// WEEK 3 additions: Sales Management (with safe inventory consumption),
// Reports & Analytics (real MongoDB aggregation), and the What-If Business
// Simulator (read-only projections). See routes/saleRoutes.js,
// routes/reportRoutes.js and routes/simulatorRoutes.js.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const cropRoutes = require("./routes/cropRoutes");
const productionRoutes = require("./routes/productionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const saleRoutes = require("./routes/saleRoutes");
const reportRoutes = require("./routes/reportRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ---- Core middleware ----
app.use(cors());
app.use(express.json());

// ---- Health check route (Phase 1 — unchanged) ----
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AgriTrack API is running",
    phase: "Week 3 — Feature Complete",
    timestamp: new Date().toISOString(),
  });
});

// ---- Module routes ----
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/simulator", simulatorRoutes);

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---- Centralized error handler (Phase 6) ----
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`AgriTrack API server listening on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

start();
