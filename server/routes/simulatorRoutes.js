// server/routes/simulatorRoutes.js
//
// Mounted at /api/simulator. Every handler here is read-only (see the
// safety invariant documented at the top of simulatorController.js).
// Restricted to ADMIN and MANAGER, matching the Week 2 planning report's
// Definition of Done for this module ("Access is restricted to
// Admin/Manager roles").

const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  simulateInventorySale,
  simulatePriceChange,
  simulateDemandChange,
  simulateProductionChange,
  simulateInventoryConsumption,
} = require("../controllers/simulatorController");

const router = express.Router();

router.use(authenticate, authorize("ADMIN", "MANAGER"));

router.post("/inventory-sale", simulateInventorySale);
router.post("/price-change", simulatePriceChange);
router.post("/demand-change", simulateDemandChange);
router.post("/production-change", simulateProductionChange);
router.post("/inventory-consumption", simulateInventoryConsumption);

module.exports = router;
