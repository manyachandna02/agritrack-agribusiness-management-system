// server/controllers/reportController.js
//
// Every number here comes from analyticsService, which reads MongoDB
// directly (find/aggregate) — nothing in this file is hard-coded. An
// empty result set is a normal, successful response (200 with empty
// arrays and a explanatory message), never a 500.

const asyncHandler = require("../utils/asyncHandler");
const analytics = require("../services/analyticsService");

function parseDateRange(req) {
  const { from, to } = req.query;
  if (from && Number.isNaN(new Date(from).getTime())) {
    return { error: "Invalid 'from' date." };
  }
  if (to && Number.isNaN(new Date(to).getTime())) {
    return { error: "Invalid 'to' date." };
  }
  if (from && to && new Date(from) > new Date(to)) {
    return { error: "'from' date must not be after 'to' date." };
  }
  return { from, to };
}

// GET /api/reports/summary?from&to
const getSummaryReport = asyncHandler(async (req, res) => {
  const { from, to, error } = parseDateRange(req);
  if (error) return res.status(400).json({ success: false, message: error });

  const [inventory, crops, production, sales] = await Promise.all([
    analytics.getInventorySummary(),
    analytics.getCropSummary(),
    analytics.getProductionSummary(from, to),
    analytics.getSalesSummary(from, to),
  ]);

  res.status(200).json({
    success: true,
    data: {
      inventory: { totalItems: inventory.totalItems, lowStockCount: inventory.lowStockCount, outOfStockCount: inventory.outOfStockCount },
      crops: { totalCrops: crops.totalCrops, byStatus: crops.byStatus },
      production: { totalRecords: production.totalRecords, totalProduction: production.totalProduction },
      sales: {
        totalTransactions: sales.totalTransactions,
        totalRevenue: sales.totalRevenue,
        averageSaleValue: sales.averageSaleValue,
      },
    },
  });
});

// GET /api/reports/sales?from&to
const getSalesReport = asyncHandler(async (req, res) => {
  const { from, to, error } = parseDateRange(req);
  if (error) return res.status(400).json({ success: false, message: error });

  const summary = await analytics.getSalesSummary(from, to);
  if (summary.totalTransactions === 0) {
    return res.status(200).json({
      success: true,
      data: summary,
      message: "No sales available for the selected period.",
    });
  }
  res.status(200).json({ success: true, data: summary });
});

// GET /api/reports/production?from&to
const getProductionReport = asyncHandler(async (req, res) => {
  const { from, to, error } = parseDateRange(req);
  if (error) return res.status(400).json({ success: false, message: error });

  const summary = await analytics.getProductionSummary(from, to);
  if (summary.totalRecords === 0) {
    return res.status(200).json({
      success: true,
      data: summary,
      message: "No production records found for the selected period.",
    });
  }
  res.status(200).json({ success: true, data: summary });
});

// GET /api/reports/inventory
const getInventoryReport = asyncHandler(async (req, res) => {
  const summary = await analytics.getInventorySummary();
  if (summary.totalItems === 0) {
    return res.status(200).json({
      success: true,
      data: summary,
      message: "No inventory items found.",
    });
  }
  res.status(200).json({ success: true, data: summary });
});

// GET /api/reports/crops
const getCropReport = asyncHandler(async (req, res) => {
  const summary = await analytics.getCropSummary();
  if (summary.totalCrops === 0) {
    return res.status(200).json({
      success: true,
      data: summary,
      message: "No crops found.",
    });
  }
  res.status(200).json({ success: true, data: summary });
});

module.exports = { getSummaryReport, getSalesReport, getProductionReport, getInventoryReport, getCropReport };
