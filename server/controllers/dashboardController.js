// server/controllers/dashboardController.js
//
<<<<<<< HEAD
// Week 2 shipped four basic counts. Week 3 adds Sales/Revenue and the
// chart-ready breakdowns the enhanced dashboard needs, reusing the same
// analyticsService the Reports module uses (no duplicated aggregation
// logic). The original four Week 2 field names are kept unchanged so
// nothing that already reads this endpoint breaks.
=======
// Week 2 dashboard is deliberately basic: four counts, computed from
// MongoDB via Mongoose .countDocuments(), not hard-coded and not
// computed by pulling full collections into the frontend. Advanced
// analytics/what-if simulation is Week 3 scope.
>>>>>>> 51235edef0918591d089ddfb657255776aca0596

const Inventory = require("../models/Inventory");
const Crop = require("../models/Crop");
const Production = require("../models/Production");
<<<<<<< HEAD
const Sale = require("../models/Sale");
const asyncHandler = require("../utils/asyncHandler");
const analytics = require("../services/analyticsService");

// GET /api/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalCrops,
    totalInventoryItems,
    lowStockItems,
    totalProductionRecords,
    totalSales,
    cropSummary,
    inventorySummary,
    productionSummary,
    salesSummary,
  ] = await Promise.all([
=======
const asyncHandler = require("../utils/asyncHandler");

// GET /api/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalCrops, totalInventoryItems, lowStockItems, totalProductionRecords] = await Promise.all([
>>>>>>> 51235edef0918591d089ddfb657255776aca0596
    Crop.countDocuments(),
    Inventory.countDocuments(),
    Inventory.countDocuments({ status: { $in: ["Low Stock", "Out of Stock"] } }),
    Production.countDocuments(),
<<<<<<< HEAD
    Sale.countDocuments(),
    analytics.getCropSummary(),
    analytics.getInventorySummary(),
    analytics.getProductionSummary(),
    analytics.getSalesSummary(),
=======
>>>>>>> 51235edef0918591d089ddfb657255776aca0596
  ]);

  res.status(200).json({
    success: true,
    stats: {
<<<<<<< HEAD
      // Week 2 fields — unchanged.
=======
>>>>>>> 51235edef0918591d089ddfb657255776aca0596
      totalCrops,
      totalInventoryItems,
      lowStockItems,
      totalProductionRecords,
<<<<<<< HEAD
      // Week 3 additions.
      totalSales,
      totalRevenue: salesSummary.totalRevenue,
      totalProductionQuantity: productionSummary.totalProduction,
    },
    charts: {
      productionByCrop: cropSummary.productionByCrop,
      inventoryStatusBreakdown: [
        { status: "In Stock", count: inventorySummary.totalItems - inventorySummary.lowStockCount - inventorySummary.outOfStockCount },
        { status: "Low Stock", count: inventorySummary.lowStockCount },
        { status: "Out of Stock", count: inventorySummary.outOfStockCount },
      ],
      cropStatusBreakdown: cropSummary.byStatus,
      salesTrend: salesSummary.byDate,
=======
>>>>>>> 51235edef0918591d089ddfb657255776aca0596
    },
  });
});

module.exports = { getDashboardStats };
