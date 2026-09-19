// server/models/Crop.js

const mongoose = require("mongoose");

const STATUSES = ["Planned", "Growing", "Harvested"];

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Crop name is required"],
      trim: true,
    },
    season: {
      type: String,
      required: [true, "Season is required"],
      trim: true,
    },
    area: {
      type: Number,
      required: [true, "Area is required"],
      min: [0.01, "Area must be greater than 0"],
    },
    sowingDate: {
      type: Date,
      required: [true, "Sowing date is required"],
    },
    expectedHarvest: {
      type: Date,
      required: [true, "Expected harvest date is required"],
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: `Status must be one of: ${STATUSES.join(", ")}` },
      default: "Planned",
    },
  },
  { timestamps: true }
);

cropSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model("Crop", cropSchema);
