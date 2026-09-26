// server/controllers/simulatorController.js
//
// SAFETY INVARIANT: this file must never call .create(), .save(),
// .updateOne(), .findOneAndUpdate(), .deleteOne(), or any other
// write operation, on any model. Every function below only reads
// (via findById) and computes (via utils/calculations.js). This is
// what guarantees a simulation can never modify Inventory, Crop,
// Production or Sale data — it isn't enforced by a permissions check,
// it's enforced by this file simply not containing any write calls.
//
// Each scenario accepts either explicit "current" values in the request
// body (so the simulator works as a standalone calculator) or an
// `inventoryItemId` to read the current quantity/threshold/price from
// the database — read-only, via findById, same as any GET endpoint.

const Inventory = require("../models/Inventory");
const asyncHandler = require("../utils/asyncHandler");
const {
  calculateProjectedInventory,
  calculateProjectedRevenue,
  calculatePercentageChange,
  calculateProjectedConsumption,
  determineStockWarning,
  isFiniteNumber,
} = require("../utils/calculations");

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function invalidNumber(value) {
  return value === undefined || value === null || value === "" || !isFiniteNumber(Number(value));
}

// Reads (never writes) an Inventory item so a scenario can be run against
// real current data instead of manually re-typed numbers.
async function loadInventoryItem(id) {
  if (!id) return null;
  return Inventory.findById(id).select("name quantity minimumThreshold currentPrice unit");
}

// --- Scenario 1: Inventory Sale --------------------------------------
// POST /api/simulator/inventory-sale
const simulateInventorySale = asyncHandler(async (req, res) => {
  const { inventoryItemId, hypotheticalSale } = req.body;
  let { currentStock, minimumThreshold, currentPrice } = req.body;

  const item = await loadInventoryItem(inventoryItemId);
  if (item) {
    currentStock = item.quantity;
    minimumThreshold = item.minimumThreshold;
    currentPrice = currentPrice !== undefined ? currentPrice : item.currentPrice;
  }

  if (invalidNumber(currentStock)) return badRequest(res, "currentStock is required and must be a valid number.");
  if (invalidNumber(hypotheticalSale) || Number(hypotheticalSale) < 0) {
    return badRequest(res, "hypotheticalSale is required and must be a non-negative number.");
  }
  if (invalidNumber(currentPrice) || Number(currentPrice) < 0) {
    return badRequest(res, "currentPrice is required and must be a non-negative number.");
  }

  currentStock = Number(currentStock);
  const sale = Number(hypotheticalSale);
  const price = Number(currentPrice);

  const projectedStock = calculateProjectedInventory(currentStock, sale);
  const projectedRevenue = calculateProjectedRevenue(sale, price);
  const warning = determineStockWarning(projectedStock, minimumThreshold !== undefined ? Number(minimumThreshold) : undefined);

  res.status(200).json({
    success: true,
    scenario: "inventory-sale",
    result: {
      currentValue: { stock: currentStock, minimumThreshold: minimumThreshold ?? null },
      hypotheticalChange: { sale },
      projectedValue: { stock: projectedStock, revenue: projectedRevenue },
      difference: { stock: projectedStock - currentStock },
      warning,
    },
  });
});

// --- Scenario 2: Price Change -----------------------------------------
// POST /api/simulator/price-change
const simulatePriceChange = asyncHandler(async (req, res) => {
  const { inventoryItemId, hypotheticalPrice, quantity } = req.body;
  let { currentPrice } = req.body;

  const item = await loadInventoryItem(inventoryItemId);
  if (item && currentPrice === undefined) {
    currentPrice = item.currentPrice;
  }

  if (invalidNumber(currentPrice) || Number(currentPrice) < 0) return badRequest(res, "currentPrice is required and must be a non-negative number.");
  if (invalidNumber(hypotheticalPrice) || Number(hypotheticalPrice) < 0) return badRequest(res, "hypotheticalPrice is required and must be a non-negative number.");
  if (invalidNumber(quantity) || Number(quantity) <= 0) return badRequest(res, "quantity is required and must be greater than 0.");

  const qty = Number(quantity);
  const oldPrice = Number(currentPrice);
  const newPrice = Number(hypotheticalPrice);

  const currentRevenue = calculateProjectedRevenue(qty, oldPrice);
  const projectedRevenue = calculateProjectedRevenue(qty, newPrice);

  res.status(200).json({
    success: true,
    scenario: "price-change",
    result: {
      currentValue: { price: oldPrice, revenue: currentRevenue },
      hypotheticalChange: { price: newPrice },
      projectedValue: { revenue: projectedRevenue },
      difference: { revenue: Math.round((projectedRevenue - currentRevenue) * 100) / 100 },
      warning: null,
    },
  });
});

// --- Scenario 3: Demand Change ------------------------------------------
// POST /api/simulator/demand-change
const simulateDemandChange = asyncHandler(async (req, res) => {
  const { inventoryItemId, currentDemand, demandChangePercent } = req.body;
  let { currentStock, minimumThreshold } = req.body;

  const item = await loadInventoryItem(inventoryItemId);
  if (item) {
    if (currentStock === undefined) currentStock = item.quantity;
    if (minimumThreshold === undefined) minimumThreshold = item.minimumThreshold;
  }

  if (invalidNumber(currentDemand) || Number(currentDemand) < 0) return badRequest(res, "currentDemand is required and must be a non-negative number.");
  if (invalidNumber(demandChangePercent)) return badRequest(res, "demandChangePercent is required and must be a valid number.");

  const demand = Number(currentDemand);
  const percent = Number(demandChangePercent);
  const projectedDemand = calculatePercentageChange(demand, percent);

  let projectedStockImpact = null;
  let warning = null;
  if (!invalidNumber(currentStock)) {
    const stock = Number(currentStock);
    projectedStockImpact = calculateProjectedInventory(stock, projectedDemand);
    warning = determineStockWarning(projectedStockImpact, minimumThreshold !== undefined ? Number(minimumThreshold) : undefined);
  }

  res.status(200).json({
    success: true,
    scenario: "demand-change",
    result: {
      currentValue: { demand },
      hypotheticalChange: { demandChangePercent: percent },
      projectedValue: { demand: projectedDemand, stockImpact: projectedStockImpact },
      difference: { demand: Math.round((projectedDemand - demand) * 100) / 100 },
      warning,
    },
  });
});

// --- Scenario 4: Production Change --------------------------------------
// POST /api/simulator/production-change
const simulateProductionChange = asyncHandler(async (req, res) => {
  const { currentProduction, productionChangePercent } = req.body;

  if (invalidNumber(currentProduction) || Number(currentProduction) < 0) {
    return badRequest(res, "currentProduction is required and must be a non-negative number.");
  }
  if (invalidNumber(productionChangePercent)) return badRequest(res, "productionChangePercent is required and must be a valid number.");

  const current = Number(currentProduction);
  const percent = Number(productionChangePercent);
  const projected = calculatePercentageChange(current, percent);

  res.status(200).json({
    success: true,
    scenario: "production-change",
    result: {
      currentValue: { production: current },
      hypotheticalChange: { productionChangePercent: percent },
      projectedValue: { production: projected },
      difference: { production: Math.round((projected - current) * 100) / 100 },
      warning: null,
    },
  });
});

// --- Scenario 5: Inventory Consumption ----------------------------------
// POST /api/simulator/inventory-consumption
const simulateInventoryConsumption = asyncHandler(async (req, res) => {
  const { inventoryItemId, monthlyConsumption, months } = req.body;
  let { currentStock, minimumThreshold } = req.body;

  const item = await loadInventoryItem(inventoryItemId);
  if (item) {
    if (currentStock === undefined) currentStock = item.quantity;
    if (minimumThreshold === undefined) minimumThreshold = item.minimumThreshold;
  }

  if (invalidNumber(currentStock)) return badRequest(res, "currentStock is required and must be a valid number.");
  if (invalidNumber(monthlyConsumption) || Number(monthlyConsumption) < 0) {
    return badRequest(res, "monthlyConsumption is required and must be a non-negative number.");
  }
  if (invalidNumber(months) || Number(months) <= 0) return badRequest(res, "months is required and must be greater than 0.");

  const stock = Number(currentStock);
  const consumption = Number(monthlyConsumption);
  const period = Number(months);

  const projectedStock = calculateProjectedConsumption(stock, consumption, period);
  const warning = determineStockWarning(projectedStock, minimumThreshold !== undefined ? Number(minimumThreshold) : undefined);

  res.status(200).json({
    success: true,
    scenario: "inventory-consumption",
    result: {
      currentValue: { stock },
      hypotheticalChange: { monthlyConsumption: consumption, months: period },
      projectedValue: { stock: projectedStock },
      difference: { stock: projectedStock - stock },
      warning,
    },
  });
});

module.exports = {
  simulateInventorySale,
  simulatePriceChange,
  simulateDemandChange,
  simulateProductionChange,
  simulateInventoryConsumption,
};
