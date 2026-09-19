// server/server.js
//
// AgriTrack backend entry point.
//
// WEEK 2 MVP — all phases now wired together:
//   Phase 1: Express app setup, MongoDB connection, health-check route
//   Phase 2: Authentication (register/login/me/users), JWT, RBAC
//   Phase 3: Inventory CRUD
//   Phase 4: Crop + Production CRUD
//   Phase 5: (frontend, in client/) — this file adds CORS + the routes it calls
//   Phase 6: Centralized validation/error handling (middleware/errorHandler.js)
//
// Week 3 (Sales, Reports, What-If Simulator, testing, deployment) is
// intentionally NOT implemented here.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const cropRoutes = require("./routes/cropRoutes");
const productionRoutes = require("./routes/productionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
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
    phase: "Week 2 MVP — Phases 1-6",
    timestamp: new Date().toISOString(),
  });
});

// ---- Module routes ----
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/dashboard", dashboardRoutes);
// Sales, Reports, What-If Simulator: Coming in Week 3.

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
