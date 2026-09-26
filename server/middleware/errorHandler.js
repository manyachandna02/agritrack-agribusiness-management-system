// server/middleware/errorHandler.js
//
// Centralized error handler covering every module (auth, inventory,
// crops, production), not just what Phase 2 needed. This is the same
// logic that used to live inline in server.js for Phase 2 only; it is
// now generalized and reused for all routes added since.
//
// Response shape is always: { success: false, message: "..." }

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err.stack);

  // Invalid MongoDB ObjectId (malformed :id, or a bad ObjectId inside a
  // ref field like Production.crop). validateObjectId middleware catches
  // the route-param case earlier; this is the fallback.
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Mongoose schema validation failure (bad enum value, missing
  // required field, min/max violation, etc.) across any model.
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ success: false, message });
  }

  // Duplicate key (unique index, e.g. User.email) as a fallback in
  // case a race condition slips past an explicit pre-check.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || { field: "value" })[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists.`,
    });
  }

  // Malformed JSON body (express.json() throws a SyntaxError with a
  // `body` property attached before any route handler runs).
  if (err.type === "entity.parse.failed" || (err instanceof SyntaxError && "body" in err)) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON in request body.",
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
}

module.exports = errorHandler;
