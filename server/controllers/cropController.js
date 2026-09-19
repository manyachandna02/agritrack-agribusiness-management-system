// server/controllers/cropController.js

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

function validateCropFields({ name, season, area, sowingDate, expectedHarvest, status }, { partial } = {}) {
  if (!partial || name !== undefined) {
    if (!name || typeof name !== "string" || !name.trim()) return "Crop name is required.";
  }
  if (!partial || season !== undefined) {
    if (!season || typeof season !== "string" || !season.trim()) return "Season is required.";
  }
  if (!partial || area !== undefined) {
    if (area === undefined || area === null || Number.isNaN(Number(area))) return "Area is required and must be a number.";
    if (Number(area) <= 0) return "Area must be greater than 0.";
  }
  if (!partial || sowingDate !== undefined) {
    if (!isValidDate(sowingDate)) return "A valid sowing date is required.";
  }
  if (!partial || expectedHarvest !== undefined) {
    if (!isValidDate(expectedHarvest)) return "A valid expected harvest date is required.";
  }
  if (status !== undefined && !Crop.STATUSES.includes(status)) {
    return `Status must be one of: ${Crop.STATUSES.join(", ")}`;
  }
  return null;
}

// GET /api/crops
const getCrops = asyncHandler(async (req, res) => {
  const crops = await Crop.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: crops.length, crops });
});

// GET /api/crops/:id
const getCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id);
  if (!crop) return res.status(404).json({ success: false, message: "Crop not found." });
  res.status(200).json({ success: true, crop });
});

// POST /api/crops  (ADMIN, MANAGER)
const createCrop = asyncHandler(async (req, res) => {
  const error = validateCropFields(req.body);
  if (error) return badRequest(res, error);

  const { name, season, area, sowingDate, expectedHarvest, status } = req.body;
  const crop = await Crop.create({ name, season, area, sowingDate, expectedHarvest, status });
  res.status(201).json({ success: true, crop });
});

// PUT /api/crops/:id  (ADMIN, MANAGER)
const updateCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id);
  if (!crop) return res.status(404).json({ success: false, message: "Crop not found." });

  const error = validateCropFields(req.body, { partial: true });
  if (error) return badRequest(res, error);

  const editableFields = ["name", "season", "area", "sowingDate", "expectedHarvest", "status"];
  for (const field of editableFields) {
    if (req.body[field] !== undefined) crop[field] = req.body[field];
  }
  await crop.save();
  res.status(200).json({ success: true, crop });
});

// DELETE /api/crops/:id  (ADMIN, MANAGER)
const deleteCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findByIdAndDelete(req.params.id);
  if (!crop) return res.status(404).json({ success: false, message: "Crop not found." });
  res.status(200).json({ success: true, message: "Crop deleted.", id: req.params.id });
});

module.exports = { getCrops, getCrop, createCrop, updateCrop, deleteCrop };
