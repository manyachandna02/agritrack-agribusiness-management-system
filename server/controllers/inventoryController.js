// server/controllers/inventoryController.js
//
// Full MongoDB-backed CRUD for Inventory. `status` is never trusted
// from the request body — it is always recomputed from quantity vs
// minimumThreshold, both on create (via the model's pre-validate hook)
// and on update (explicitly here, since findByIdAndUpdate does not run
// the same "pre" middleware sequence as .save()).

const Inventory = require("../models/Inventory");
const asyncHandler = require("../utils/asyncHandler");

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function validateCommonFields({ name, category, quantity, unit, minimumThreshold }, { partial } = {}) {
  if (!partial || name !== undefined) {
    if (!name || typeof name !== "string" || !name.trim()) return "Item name is required.";
  }
  if (!partial || category !== undefined) {
    if (!category) return "Category is required.";
    if (!Inventory.CATEGORIES.includes(category)) {
      return `Category must be one of: ${Inventory.CATEGORIES.join(", ")}`;
    }
  }
  if (!partial || quantity !== undefined) {
    if (quantity === undefined || quantity === null || Number.isNaN(Number(quantity))) {
      return "Quantity is required and must be a number.";
    }
    if (Number(quantity) < 0) return "Quantity cannot be negative.";
  }
  if (!partial || unit !== undefined) {
    if (!unit) return "Unit is required.";
    if (!Inventory.UNITS.includes(unit)) {
      return `Unit must be one of: ${Inventory.UNITS.join(", ")}`;
    }
  }
  if (!partial || minimumThreshold !== undefined) {
    if (minimumThreshold === undefined || minimumThreshold === null || Number.isNaN(Number(minimumThreshold))) {
      return "Minimum threshold is required and must be a number.";
    }
    if (Number(minimumThreshold) < 0) return "Minimum threshold cannot be negative.";
  }
  return null;
}

// GET /api/inventory
const getInventory = asyncHandler(async (req, res) => {
  const items = await Inventory.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: items.length, items });
});

// GET /api/inventory/:id
const getInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Inventory item not found." });
  }
  res.status(200).json({ success: true, item });
});

// POST /api/inventory  (ADMIN, MANAGER)
const createInventoryItem = asyncHandler(async (req, res) => {
  const { name, category, quantity, unit, minimumThreshold, supplier, unitCost, currentPrice, averageMonthlySales } =
    req.body;

  const error = validateCommonFields(req.body);
  if (error) return badRequest(res, error);

  // status is intentionally omitted — the model computes it.
  const item = await Inventory.create({
    name,
    category,
    quantity,
    unit,
    minimumThreshold,
    supplier,
    unitCost,
    currentPrice,
    averageMonthlySales,
  });

  res.status(201).json({ success: true, item });
});

// PUT /api/inventory/:id
// ADMIN and MANAGER can edit any field. FARM_STAFF has "limited inventory
// access" per the RBAC spec: they may only adjust `quantity` (e.g. logging
// stock used/received), not price, supplier, thresholds, etc.
const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Inventory item not found." });
  }

  const isFarmStaff = req.user.role === "FARM_STAFF";
  const fullEditableFields = [
    "name",
    "category",
    "quantity",
    "unit",
    "minimumThreshold",
    "supplier",
    "unitCost",
    "currentPrice",
    "averageMonthlySales",
  ];
  const editableFields = isFarmStaff ? ["quantity"] : fullEditableFields;

  if (isFarmStaff) {
    const attemptedOtherFields = Object.keys(req.body).some(
      (key) => key !== "quantity" && fullEditableFields.includes(key)
    );
    if (attemptedOtherFields) {
      return res.status(403).json({
        success: false,
        message: "Farm staff may only update the quantity field on inventory items.",
      });
    }
  }

  const error = validateCommonFields(req.body, { partial: true });
  if (error) return badRequest(res, error);

  for (const field of editableFields) {
    if (req.body[field] !== undefined) item[field] = req.body[field];
  }
  // Never accept a client-provided status — recompute from the
  // (possibly just-updated) quantity/minimumThreshold.
  item.status = Inventory.computeStatus(item.quantity, item.minimumThreshold);
  item.lastUpdated = new Date();

  await item.save();
  res.status(200).json({ success: true, item });
});

// DELETE /api/inventory/:id  (ADMIN, MANAGER)
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Inventory item not found." });
  }
  res.status(200).json({ success: true, message: "Inventory item deleted.", id: req.params.id });
});

module.exports = {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
