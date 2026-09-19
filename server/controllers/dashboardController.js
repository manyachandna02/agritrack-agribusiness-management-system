// server/controllers/dashboardController.js
//
// Week 2 dashboard is deliberately basic: four counts, computed from
// MongoDB via Mongoose .countDocuments(), not hard-coded and not
// computed by pulling full collections into the frontend. Advanced
// analytics/what-if simulation is Week 3 scope.

const Inventory = require("../models/Inventory");
const Crop = require("../models/Crop");
const Production = require("../models/Production");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalCrops, totalInventoryItems, lowStockItems, totalProductionRecords] = await Promise.all([
    Crop.countDocuments(),
    Inventory.countDocuments(),
    Inventory.countDocuments({ status: { $in: ["Low Stock", "Out of Stock"] } }),
    Production.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalCrops,
      totalInventoryItems,
      lowStockItems,
      totalProductionRecords,
    },
  });
});

module.exports = { getDashboardStats };
