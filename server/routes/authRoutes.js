// server/routes/authRoutes.js
//
// Mounted at /api/auth in server.js.
//
//   POST /api/auth/login     public
//   POST /api/auth/register  ADMIN only (creates Manager/Farm Staff/Admin accounts)
//   GET  /api/auth/me        any authenticated user
//   GET  /api/auth/users     ADMIN only

const express = require("express");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { register, login, getMe, listUsers } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/register", authenticate, authorize("ADMIN"), register);
router.get("/me", authenticate, getMe);
router.get("/users", authenticate, authorize("ADMIN"), listUsers);

module.exports = router;
