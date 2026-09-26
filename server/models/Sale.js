// server/models/Sale.js
//
// A Sale records an actual transaction. It references Crop and/or
// Inventory rather than duplicating "what was sold" as free-standing
// data — `product` is a human-readable label (defaults to the
// referenced crop/inventory item's name if not supplied), not a
// separate product catalog.
//
// `totalAmount` is never accepted from the client — like Inventory's
// `status`, it is always computed server-side (quantity × price) in
// the pre-validate hook, so it can never drift from the inputs that
// produced it.
//
// If `inventoryItem` is set, creating this Sale atomically decrements
// that Inventory document's quantity (see controllers/saleController.js).
// This model file only defines the data shape; the inventory side-effect
// lives in the controller, same separation as Production's crop-existence
// check.

const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: [true, "Customer is required"],
      trim: true,
    },
    product: {
      type: String,
      required: [true, "Product is required"],
      trim: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      default: null,
    },
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.01, "Quantity must be greater than 0"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

saleSchema.pre("validate", function computeTotal(next) {
  if (typeof this.quantity === "number" && typeof this.price === "number") {
    this.totalAmount = Math.round((this.quantity * this.price + Number.EPSILON) * 100) / 100;
  }
  next();
});

module.exports = mongoose.model("Sale", saleSchema);
