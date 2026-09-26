// server/utils/calculations.js
//
// Pure calculation functions with no database access and no side effects,
// shared by the Sales module (real transactions) and the What-If Simulator
// (hypothetical projections). Keeping them here — instead of inline in
// controllers — is what makes them independently unit-testable and is what
// guarantees the simulator can compute projections without ever importing
// a model or touching MongoDB.

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/** totalAmount = quantity × price. Used by Sale creation. */
function calculateTotalAmount(quantity, price) {
  return round2(quantity * price);
}

/** Same calculation, named for its use in Simulator Scenario 1/2 (projected revenue). */
function calculateProjectedRevenue(quantity, price) {
  return round2(quantity * price);
}

/** Simulator Scenario 1: stock remaining after a hypothetical sale. Never floors at 0 —
 *  a negative result is meaningful (it means the hypothetical sale isn't fulfillable),
 *  and the caller decides how to warn about it. */
function calculateProjectedInventory(currentStock, hypotheticalSale) {
  return round2(currentStock - hypotheticalSale);
}

/** Simulator Scenarios 3 & 4: apply a +/- percentage change to a current value.
 *  percentChange is e.g. 20 for +20%, -15 for -15%. */
function calculatePercentageChange(current, percentChange) {
  return round2(current * (1 + percentChange / 100));
}

/** Simulator Scenario 5: stock remaining after consuming a fixed amount per period
 *  over a number of periods (e.g. monthly consumption over N months). */
function calculateProjectedConsumption(currentStock, consumptionPerPeriod, periods) {
  return round2(currentStock - consumptionPerPeriod * periods);
}

/** Shared low-stock rule — identical logic to Inventory.computeStatus, duplicated
 *  here (not imported from the model) so the Simulator has zero dependency on any
 *  Mongoose model and can never accidentally touch the database. */
function determineStockWarning(projectedStock, minimumThreshold) {
  if (projectedStock <= 0) return "OUT OF STOCK WARNING";
  if (minimumThreshold !== undefined && minimumThreshold !== null && projectedStock < minimumThreshold) {
    return "LOW STOCK WARNING";
  }
  return null;
}

module.exports = {
  round2,
  isFiniteNumber,
  calculateTotalAmount,
  calculateProjectedRevenue,
  calculateProjectedInventory,
  calculatePercentageChange,
  calculateProjectedConsumption,
  determineStockWarning,
};
