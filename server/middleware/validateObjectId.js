// server/middleware/validateObjectId.js
//
// Rejects a route param that is not a syntactically valid MongoDB
// ObjectId with a clean 400 before it ever reaches Mongoose (which
// would otherwise throw a CastError, caught later by the centralized
// error handler as a fallback — this middleware is the first line of
// defense so the error message is predictable and immediate).

const mongoose = require("mongoose");

function validateObjectId(paramName = "id") {
  return function validate(req, res, next) {
    const value = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}: ${value}`,
      });
    }
    return next();
  };
}

module.exports = validateObjectId;
