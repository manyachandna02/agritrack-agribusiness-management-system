// server/routes/reportRoutes.js
//
// Mounted at /api/reports. Reports surface revenue and business
// analytics, so — unlike Crops/Production/Sales viewing — this module
// is restricted to ADMIN and MANAGER; FARM_STAFF does not get a Reports
// view (this mirrors the Simulator's "Admin/Manager only" restriction
// from the Week 2 planning report, applied consistently here).

const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  getSummaryReport,
  getSalesReport,
  getProductionReport,
  getInventoryReport,
  getCropReport,
} = require("../controllers/reportController");

const router = express.Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

router.get("/summary", getSummaryReport);
router.get("/sales", getSalesReport);
router.get("/production", getProductionReport);
router.get("/inventory", getInventoryReport);
router.get("/crops", getCropReport);

module.exports = router;
