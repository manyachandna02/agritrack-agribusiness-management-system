// server/routes/productionRoutes.js
//
// Mounted at /api/production. Creating/updating production entries is
// a "production operation" that FARM_STAFF is explicitly allowed to do
// per the RBAC spec; deleting records is restricted to ADMIN + MANAGER.

const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validateObjectId = require("../middleware/validateObjectId");
const {
  getProductionRecords,
  getProductionRecord,
  createProductionRecord,
  updateProductionRecord,
  deleteProductionRecord,
} = require("../controllers/productionController");

const router = express.Router();

router.use(authenticate);

router.get("/", getProductionRecords);
router.get("/:id", validateObjectId(), getProductionRecord);
router.post("/", authorize("ADMIN", "MANAGER", "FARM_STAFF"), createProductionRecord);
router.put("/:id", validateObjectId(), authorize("ADMIN", "MANAGER", "FARM_STAFF"), updateProductionRecord);
router.delete("/:id", validateObjectId(), authorize("ADMIN", "MANAGER"), deleteProductionRecord);

module.exports = router;
