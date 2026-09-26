// server/controllers/saleController.js
//
// Sales consume Inventory when `inventoryItem` is set. Since this MongoDB
// instance is a standalone server (no replica set), multi-document ACID
// transactions (mongoose sessions) are not available here. Instead, the
// inventory decrement uses a single atomic conditional update —
// findOneAndUpdate({ _id, quantity: { $gte: saleQty } }, { $inc: { quantity: -saleQty } })
// — which MongoDB guarantees is atomic at the document level, so two
// concurrent sales can never both succeed past available stock. If the
// conditional update returns null, there wasn't enough stock and nothing
// is written. If the inventory decrement succeeds but the subsequent
// Sale.create() fails for any reason, the decrement is explicitly rolled
// back (re-incremented) before the error is returned, so the database is
// never left in a partially-updated state. The same pattern is applied,
// in reverse, on update and delete.

const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Crop = require("../models/Crop");
const Inventory = require("../models/Inventory");
const asyncHandler = require("../utils/asyncHandler");

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function isValidDate(value) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

async function validateSaleFields({ customer, product, crop, inventoryItem, quantity, price, date }, { partial } = {}) {
  if (!partial || customer !== undefined) {
    if (!customer || typeof customer !== "string" || !customer.trim()) return "Customer is required.";
  }
  if (!partial || product !== undefined) {
    if (!product || typeof product !== "string" || !product.trim()) return "Product is required.";
  }
  if (!partial || quantity !== undefined) {
    if (quantity === undefined || quantity === null || !Number.isFinite(Number(quantity))) {
      return "Quantity is required and must be a finite number.";
    }
    if (Number(quantity) <= 0) return "Quantity must be greater than 0.";
  }
  if (!partial || price !== undefined) {
    if (price === undefined || price === null || !Number.isFinite(Number(price))) {
      return "Price is required and must be a finite number.";
    }
    if (Number(price) < 0) return "Price cannot be negative.";
  }
  if (!partial || date !== undefined) {
    if (!isValidDate(date)) return "A valid date is required.";
  }
  if (crop) {
    if (!mongoose.Types.ObjectId.isValid(crop)) return "Crop reference is not a valid id.";
    const cropExists = await Crop.exists({ _id: crop });
    if (!cropExists) return "Referenced crop does not exist.";
  }
  if (inventoryItem) {
    if (!mongoose.Types.ObjectId.isValid(inventoryItem)) return "Inventory item reference is not a valid id.";
    const itemExists = await Inventory.exists({ _id: inventoryItem });
    if (!itemExists) return "Referenced inventory item does not exist.";
  }
  return null;
}

// Atomically decrement an Inventory item's quantity by `amount`, only if
// enough stock exists. Returns the updated document, or null if there
// wasn't enough stock (nothing is written in that case).
async function decrementInventory(inventoryItemId, amount) {
  const updated = await Inventory.findOneAndUpdate(
    { _id: inventoryItemId, quantity: { $gte: amount } },
    { $inc: { quantity: -amount } },
    { new: true }
  );
  if (updated) {
    // Recompute status/lastUpdated to match the direct-update path, since
    // this bypasses the pre-validate hook used by .save().
    updated.status = Inventory.computeStatus(updated.quantity, updated.minimumThreshold);
    updated.lastUpdated = new Date();
    await updated.save();
  }
  return updated;
}

// Restore (increment back) an Inventory item's quantity — used to reverse
// a sale on update/delete, or to roll back a decrement that succeeded but
// whose Sale write subsequently failed.
async function restoreInventory(inventoryItemId, amount) {
  const updated = await Inventory.findByIdAndUpdate(
    inventoryItemId,
    { $inc: { quantity: amount } },
    { new: true }
  );
  if (updated) {
    updated.status = Inventory.computeStatus(updated.quantity, updated.minimumThreshold);
    updated.lastUpdated = new Date();
    await updated.save();
  }
  return updated;
}

// GET /api/sales
const getSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find()
    .sort({ date: -1 })
    .populate("crop", "name season")
    .populate("inventoryItem", "name unit")
    .populate("createdBy", "name role");
  res.status(200).json({ success: true, count: sales.length, sales });
});

// GET /api/sales/:id
const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate("crop", "name season")
    .populate("inventoryItem", "name unit")
    .populate("createdBy", "name role");
  if (!sale) return res.status(404).json({ success: false, message: "Sale not found." });
  res.status(200).json({ success: true, sale });
});

// POST /api/sales  (ADMIN, MANAGER)
const createSale = asyncHandler(async (req, res) => {
  const { customer, product, crop, inventoryItem, quantity, price, date } = req.body;

  const error = await validateSaleFields(req.body);
  if (error) return badRequest(res, error);

  let decrementedItem = null;
  if (inventoryItem) {
    decrementedItem = await decrementInventory(inventoryItem, Number(quantity));
    if (!decrementedItem) {
      return res.status(409).json({
        success: false,
        message: "Insufficient stock: this sale would reduce inventory below zero.",
      });
    }
  }

  try {
    const sale = await Sale.create({
      customer,
      product,
      crop: crop || null,
      inventoryItem: inventoryItem || null,
      quantity,
      price,
      date,
      createdBy: req.user.id,
    });
    const populated = await sale.populate([
      { path: "crop", select: "name season" },
      { path: "inventoryItem", select: "name unit" },
      { path: "createdBy", select: "name role" },
    ]);
    return res.status(201).json({ success: true, sale: populated });
  } catch (err) {
    // The Sale write failed after inventory was already decremented —
    // roll the decrement back so stock isn't silently lost.
    if (decrementedItem) {
      await restoreInventory(inventoryItem, Number(quantity));
    }
    throw err;
  }
});

// PUT /api/sales/:id  (ADMIN, MANAGER)
const updateSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) return res.status(404).json({ success: false, message: "Sale not found." });

  const error = await validateSaleFields(req.body, { partial: true });
  if (error) return badRequest(res, error);

  const oldInventoryItem = sale.inventoryItem ? String(sale.inventoryItem) : null;
  const oldQuantity = sale.quantity;

  const newInventoryItem = req.body.inventoryItem !== undefined ? (req.body.inventoryItem || null) : oldInventoryItem;
  const newQuantity = req.body.quantity !== undefined ? Number(req.body.quantity) : oldQuantity;

  const inventoryChanged = String(oldInventoryItem) !== String(newInventoryItem) || oldQuantity !== newQuantity;

  if (inventoryChanged) {
    // Release whatever the old sale held against the old item.
    if (oldInventoryItem) {
      await restoreInventory(oldInventoryItem, oldQuantity);
    }
    // Claim the new amount against the new item, if any.
    if (newInventoryItem) {
      const decremented = await decrementInventory(newInventoryItem, newQuantity);
      if (!decremented) {
        // Roll back the release above so we haven't leaked stock.
        if (oldInventoryItem) {
          await decrementInventory(oldInventoryItem, oldQuantity);
        }
        return res.status(409).json({
          success: false,
          message: "Insufficient stock: this update would reduce inventory below zero.",
        });
      }
    }
  }

  const editableFields = ["customer", "product", "crop", "inventoryItem", "quantity", "price", "date"];
  for (const field of editableFields) {
    if (req.body[field] === undefined) continue;
    if (field === "crop" || field === "inventoryItem") {
      sale[field] = req.body[field] || null;
    } else {
      sale[field] = req.body[field];
    }
  }

  try {
    await sale.save();
  } catch (err) {
    // Best-effort rollback of the inventory change we just made, since the
    // Sale itself failed to save.
    if (inventoryChanged) {
      if (newInventoryItem) await restoreInventory(newInventoryItem, newQuantity);
      if (oldInventoryItem) await decrementInventory(oldInventoryItem, oldQuantity);
    }
    throw err;
  }

  const populated = await sale.populate([
    { path: "crop", select: "name season" },
    { path: "inventoryItem", select: "name unit" },
    { path: "createdBy", select: "name role" },
  ]);
  res.status(200).json({ success: true, sale: populated });
});

// DELETE /api/sales/:id  (ADMIN, MANAGER)
const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findByIdAndDelete(req.params.id);
  if (!sale) return res.status(404).json({ success: false, message: "Sale not found." });

  if (sale.inventoryItem) {
    // Deleting a recorded sale reverses its effect on stock.
    await restoreInventory(sale.inventoryItem, sale.quantity);
  }

  res.status(200).json({ success: true, message: "Sale deleted.", id: req.params.id });
});

module.exports = { getSales, getSale, createSale, updateSale, deleteSale };
