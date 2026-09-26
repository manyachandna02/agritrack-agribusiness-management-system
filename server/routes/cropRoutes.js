// server/routes/cropRoutes.js
//
// Mounted at /api/crops. Viewing is open to every authenticated role
// (FARM_STAFF needs to view crops per the RBAC spec). Mutation is
// ADMIN + MANAGER only.

const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validateObjectId = require("../middleware/validateObjectId");
const { getCrops, getCrop, createCrop, updateCrop, deleteCrop } = require("../controllers/cropController");

const router = express.Router();

router.use(authenticate);

router.get("/", getCrops);
router.get("/:id", validateObjectId(), getCrop);
router.post("/", authorize("ADMIN", "MANAGER"), createCrop);
router.put("/:id", validateObjectId(), authorize("ADMIN", "MANAGER"), updateCrop);
router.delete("/:id", validateObjectId(), authorize("ADMIN", "MANAGER"), deleteCrop);

module.exports = router;
