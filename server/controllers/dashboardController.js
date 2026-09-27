// server/controllers/dashboardController.js
//
// Week 3 Dashboard Controller
// Keeps the original Week 2 dashboard fields and adds
// Sales/Revenue and chart-ready analytics for Week 3.

const Inventory = require("../models/Inventory");
const Crop = require("../models/Crop");
const Production = require("../models/Production");
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
    Crop.countDocuments(),
    Inventory.countDocuments(),
    Inventory.countDocuments({
      status: { $in: ["Low Stock", "Out of Stock"] },
    }),
    Production.countDocuments(),

    Sale.countDocuments(),

    analytics.getCropSummary(),
    analytics.getInventorySummary(),
    analytics.getProductionSummary(),
    analytics.getSalesSummary(),
  ]);

  res.status(200).json({
    success: true,

    stats: {
      // Week 2 fields — unchanged.
      totalCrops,
      totalInventoryItems,
      lowStockItems,
      totalProductionRecords,

      // Week 3 additions.
      totalSales,
      totalRevenue: salesSummary.totalRevenue,
      totalProductionQuantity: productionSummary.totalProduction,
    },

    charts: {
      productionByCrop: cropSummary.productionByCrop,

      inventoryStatusBreakdown: [
        {
          status: "In Stock",
          count:
            inventorySummary.totalItems -
            inventorySummary.lowStockCount -
            inventorySummary.outOfStockCount,
        },
        {
          status: "Low Stock",
          count: inventorySummary.lowStockCount,
        },
        {
          status: "Out of Stock",
          count: inventorySummary.outOfStockCount,
        },
      ],

      cropStatusBreakdown: cropSummary.byStatus,

      salesTrend: salesSummary.byDate,
    },
  });
});

module.exports = { getDashboardStats };