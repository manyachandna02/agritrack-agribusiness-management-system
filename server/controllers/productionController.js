// server/controllers/productionController.js

const mongoose = require("mongoose");
const Production = require("../models/Production");
const Crop = require("../models/Crop");
const asyncHandler = require("../utils/asyncHandler");

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function isValidDate(value) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

async function validateProductionFields({ crop, quantity, date, quality, farm }, { partial } = {}) {
  if (!partial || crop !== undefined) {
    if (!crop) return "Crop reference is required.";
    if (!mongoose.Types.ObjectId.isValid(crop)) return "Crop reference is not a valid id.";
    const cropExists = await Crop.exists({ _id: crop });
    if (!cropExists) return "Referenced crop does not exist.";
  }
  if (!partial || quantity !== undefined) {
    if (quantity === undefined || quantity === null || Number.isNaN(Number(quantity))) {
      return "Quantity is required and must be a number.";
    }
    if (Number(quantity) <= 0) return "Quantity must be greater than 0.";
  }
  if (!partial || date !== undefined) {
    if (!isValidDate(date)) return "A valid date is required.";
  }
  if (!partial || quality !== undefined) {
    if (!quality || !Production.QUALITY_GRADES.includes(quality)) {
      return `Quality must be one of: ${Production.QUALITY_GRADES.join(", ")}`;
    }
  }
  if (!partial || farm !== undefined) {
    if (!farm || typeof farm !== "string" || !farm.trim()) return "Farm is required.";
  }
  return null;
}

// GET /api/production
const getProductionRecords = asyncHandler(async (req, res) => {
  const records = await Production.find().sort({ date: -1 }).populate("crop", "name season status");
  res.status(200).json({ success: true, count: records.length, records });
});

// GET /api/production/:id
const getProductionRecord = asyncHandler(async (req, res) => {
  const record = await Production.findById(req.params.id).populate("crop", "name season status");
  if (!record) return res.status(404).json({ success: false, message: "Production record not found." });
  res.status(200).json({ success: true, record });
});

// POST /api/production  (ADMIN, MANAGER, FARM_STAFF)
const createProductionRecord = asyncHandler(async (req, res) => {
  const error = await validateProductionFields(req.body);
  if (error) return badRequest(res, error);

  const { crop, quantity, date, quality, farm } = req.body;
  const record = await Production.create({ crop, quantity, date, quality, farm });
  const populated = await record.populate("crop", "name season status");
  res.status(201).json({ success: true, record: populated });
});

// PUT /api/production/:id  (ADMIN, MANAGER, FARM_STAFF)
const updateProductionRecord = asyncHandler(async (req, res) => {
  const record = await Production.findById(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: "Production record not found." });

  const error = await validateProductionFields(req.body, { partial: true });
  if (error) return badRequest(res, error);

  const editableFields = ["crop", "quantity", "date", "quality", "farm"];
  for (const field of editableFields) {
    if (req.body[field] !== undefined) record[field] = req.body[field];
  }
  await record.save();
  const populated = await record.populate("crop", "name season status");
  res.status(200).json({ success: true, record: populated });
});

// DELETE /api/production/:id  (ADMIN, MANAGER)
const deleteProductionRecord = asyncHandler(async (req, res) => {
  const record = await Production.findByIdAndDelete(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: "Production record not found." });
  res.status(200).json({ success: true, message: "Production record deleted.", id: req.params.id });
});

module.exports = {
  getProductionRecords,
  getProductionRecord,
  createProductionRecord,
  updateProductionRecord,
  deleteProductionRecord,
};
