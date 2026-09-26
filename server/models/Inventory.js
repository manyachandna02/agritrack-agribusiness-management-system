// server/models/Inventory.js
//
// Inventory item. `status` is NEVER accepted from client input — it is
// always derived server-side from quantity vs minimumThreshold in the
// pre-save hook and in the update flow (see controllers/inventoryController.js).

const mongoose = require("mongoose");

const CATEGORIES = ["Seeds", "Fertilizer", "Pesticide", "Equipment", "Tools", "Fuel", "Other"];
const UNITS = ["kg", "g", "l", "ml", "units", "bags", "boxes"];
const STATUSES = ["In Stock", "Low Stock", "Out of Stock"];

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: `Category must be one of: ${CATEGORIES.join(", ")}` },
      required: [true, "Category is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    unit: {
      type: String,
      enum: { values: UNITS, message: `Unit must be one of: ${UNITS.join(", ")}` },
      required: [true, "Unit is required"],
    },
    minimumThreshold: {
      type: Number,
      required: [true, "Minimum threshold is required"],
      min: [0, "Minimum threshold cannot be negative"],
    },
    supplier: {
      type: String,
      trim: true,
      default: "",
    },
    unitCost: {
      type: Number,
      min: [0, "Unit cost cannot be negative"],
      default: 0,
    },
    currentPrice: {
      type: Number,
      min: [0, "Current price cannot be negative"],
      default: 0,
    },
    averageMonthlySales: {
      type: Number,
      min: [0, "Average monthly sales cannot be negative"],
      default: 0,
    },
    status: {
      type: String,
      enum: STATUSES,
      // Always computed server-side. Default here only satisfies the
      // schema before the pre-validate hook below sets the real value.
      default: "Out of Stock",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Single source of truth for the status calculation, used by both the
// pre-validate hook (covers .create() / .save()) and the controller
// (covers findByIdAndUpdate-style updates, where hooks don't run the
// same way).
function computeStatus(quantity, minimumThreshold) {
  if (quantity === 0) return "Out of Stock";
  if (quantity <= minimumThreshold) return "Low Stock";
  return "In Stock";
}

inventorySchema.statics.computeStatus = computeStatus;
inventorySchema.statics.CATEGORIES = CATEGORIES;
inventorySchema.statics.UNITS = UNITS;
inventorySchema.statics.STATUSES = STATUSES;

inventorySchema.pre("validate", function setComputedStatus(next) {
  if (this.quantity !== undefined && this.minimumThreshold !== undefined) {
    this.status = computeStatus(this.quantity, this.minimumThreshold);
  }
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);
