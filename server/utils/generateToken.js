// server/utils/generateToken.js
//
// Signs a JWT for a given payload (typically { id, role }).
// The signing secret and expiry are read from environment variables,
// never hard-coded.

const jwt = require("jsonwebtoken");

function generateToken(payload) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "8h";
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

module.exports = generateToken;
