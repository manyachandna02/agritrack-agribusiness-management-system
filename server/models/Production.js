// server/models/Production.js
//
// `crop` references the Crop collection by ObjectId. Existence of the
// referenced crop is verified in the controller before create/update
// (a schema-level `ref` alone does not enforce that the id exists).

const mongoose = require("mongoose");

const QUALITY_GRADES = ["A", "B", "C"];

const productionSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: [true, "Crop reference is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.01, "Quantity must be greater than 0"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    quality: {
      type: String,
      enum: { values: QUALITY_GRADES, message: `Quality must be one of: ${QUALITY_GRADES.join(", ")}` },
      required: [true, "Quality grade is required"],
    },
    farm: {
      type: String,
      required: [true, "Farm is required"],
      trim: true,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

productionSchema.statics.QUALITY_GRADES = QUALITY_GRADES;

module.exports = mongoose.model("Production", productionSchema);
