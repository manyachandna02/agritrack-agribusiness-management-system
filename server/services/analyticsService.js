// server/services/analyticsService.js
//
// All real-data aggregation lives here, shared by controllers/dashboardController.js
// (a few headline numbers) and controllers/reportController.js (full breakdowns).
// Every function here reads from MongoDB via Mongoose aggregation/count/find —
// nothing here is hard-coded, and nothing here writes.

const Crop = require("../models/Crop");
const Inventory = require("../models/Inventory");
const Production = require("../models/Production");
const Sale = require("../models/Sale");

function buildDateMatch(field, from, to) {
  const match = {};
  if (from || to) {
    match[field] = {};
    if (from) match[field].$gte = new Date(from);
    if (to) match[field].$lte = new Date(to);
  }
  return match;
}

async function getInventorySummary() {
  const items = await Inventory.find().select("name category quantity unit status minimumThreshold");
  const totalItems = items.length;
  const lowStockItems = items.filter((i) => i.status === "Low Stock");
  const outOfStockItems = items.filter((i) => i.status === "Out of Stock");
  return {
    totalItems,
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    lowStockItems: lowStockItems.map((i) => ({ id: i._id, name: i.name, quantity: i.quantity, unit: i.unit })),
    outOfStockItems: outOfStockItems.map((i) => ({ id: i._id, name: i.name, unit: i.unit })),
    byCategory: Object.values(
      items.reduce((acc, i) => {
        acc[i.category] = acc[i.category] || { category: i.category, itemCount: 0, totalQuantity: 0 };
        acc[i.category].itemCount += 1;
        acc[i.category].totalQuantity += i.quantity;
        return acc;
      }, {})
    ),
  };
}

async function getCropSummary() {
  const crops = await Crop.find().select("name status");
  const byStatus = Object.values(
    crops.reduce((acc, c) => {
      acc[c.status] = acc[c.status] || { status: c.status, count: 0 };
      acc[c.status].count += 1;
      return acc;
    }, {})
  );

  const productionByCrop = await Production.aggregate([
    { $group: { _id: "$crop", totalQuantity: { $sum: "$quantity" }, records: { $sum: 1 } } },
    { $lookup: { from: "crops", localField: "_id", foreignField: "_id", as: "crop" } },
    { $unwind: { path: "$crop", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        cropId: "$_id",
        cropName: { $ifNull: ["$crop.name", "(deleted crop)"] },
        totalQuantity: 1,
        records: 1,
      },
    },
    { $sort: { totalQuantity: -1 } },
  ]);

  return { totalCrops: crops.length, byStatus, productionByCrop };
}

async function getProductionSummary(from, to) {
  const match = buildDateMatch("date", from, to);
  const records = await Production.find(match).select("quantity date crop").populate("crop", "name");

  const totalProduction = records.reduce((sum, r) => sum + r.quantity, 0);

  const byCropMap = {};
  for (const r of records) {
    const key = r.crop ? String(r.crop._id) : "unknown";
    const name = r.crop ? r.crop.name : "(deleted crop)";
    byCropMap[key] = byCropMap[key] || { cropName: name, totalQuantity: 0, records: 0 };
    byCropMap[key].totalQuantity += r.quantity;
    byCropMap[key].records += 1;
  }

  const byDateMap = {};
  for (const r of records) {
    const day = r.date.toISOString().slice(0, 10);
    byDateMap[day] = (byDateMap[day] || 0) + r.quantity;
  }
  const byDate = Object.entries(byDateMap)
    .map(([date, totalQuantity]) => ({ date, totalQuantity }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRecords: records.length,
    totalProduction,
    byCrop: Object.values(byCropMap),
    byDate,
  };
}

async function getSalesSummary(from, to) {
  const match = buildDateMatch("date", from, to);
  const sales = await Sale.find(match).select("quantity price totalAmount date product customer");

  const totalTransactions = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);
  const averageSaleValue = totalTransactions > 0 ? Math.round((totalRevenue / totalTransactions) * 100) / 100 : 0;

  const byDateMap = {};
  for (const s of sales) {
    const day = s.date.toISOString().slice(0, 10);
    byDateMap[day] = byDateMap[day] || { date: day, revenue: 0, transactions: 0 };
    byDateMap[day].revenue += s.totalAmount;
    byDateMap[day].transactions += 1;
  }
  const byDate = Object.values(byDateMap).sort((a, b) => a.date.localeCompare(b.date));

  const byProductMap = {};
  for (const s of sales) {
    byProductMap[s.product] = byProductMap[s.product] || { product: s.product, quantity: 0, revenue: 0 };
    byProductMap[s.product].quantity += s.quantity;
    byProductMap[s.product].revenue += s.totalAmount;
  }

  return {
    totalTransactions,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalQuantity,
    averageSaleValue,
    byDate,
    byProduct: Object.values(byProductMap),
  };
}

module.exports = {
  getInventorySummary,
  getCropSummary,
  getProductionSummary,
  getSalesSummary,
};
