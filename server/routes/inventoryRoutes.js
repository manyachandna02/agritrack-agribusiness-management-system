// server/routes/inventoryRoutes.js
//
// Mounted at /api/inventory in server.js. All routes require
// authentication. Viewing is open to every role; mutation is scoped
// per the RBAC spec (ADMIN + MANAGER full access, FARM_STAFF limited
// to quantity updates only — enforced inside the controller since it
// depends on the request body, not just the role).

const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validateObjectId = require("../middleware/validateObjectId");
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require("../controllers/inventoryController");

const router = express.Router();

router.use(authenticate);

router.get("/", getInventory);
router.get("/:id", validateObjectId(), getInventoryItem);
router.post("/", authorize("ADMIN", "MANAGER"), createInventoryItem);
router.put("/:id", validateObjectId(), authorize("ADMIN", "MANAGER", "FARM_STAFF"), updateInventoryItem);
router.delete("/:id", validateObjectId(), authorize("ADMIN", "MANAGER"), deleteInventoryItem);

module.exports = router;
