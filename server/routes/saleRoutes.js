// server/routes/saleRoutes.js
//
// Mounted at /api/sales. Viewing is open to every authenticated role
// (FARM_STAFF can view sales per the RBAC spec, same as Crops); creating,
// updating and deleting are ADMIN + MANAGER only.

const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validateObjectId = require("../middleware/validateObjectId");
const { getSales, getSale, createSale, updateSale, deleteSale } = require("../controllers/saleController");

const router = express.Router();

router.use(authenticate);

router.get("/", getSales);
router.get("/:id", validateObjectId(), getSale);
router.post("/", authorize("ADMIN", "MANAGER"), createSale);
router.put("/:id", validateObjectId(), authorize("ADMIN", "MANAGER"), updateSale);
router.delete("/:id", validateObjectId(), authorize("ADMIN", "MANAGER"), deleteSale);

module.exports = router;
