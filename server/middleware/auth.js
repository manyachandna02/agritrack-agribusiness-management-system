// server/middleware/auth.js
//
// Authentication middleware: verifies the JWT sent in the
// Authorization header ("Bearer <token>") and attaches the decoded
// user identity (id, role) to req.user for downstream middleware
// and controllers. Does not touch the database — role-based checks
// are handled separately by middleware/authorize.js.

const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}

module.exports = authenticate;
