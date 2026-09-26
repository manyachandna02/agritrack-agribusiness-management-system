// server/controllers/authController.js
//
// Handles registration (Admin-only, per Week 1/2 design — there is no
// public self-registration endpoint), login, retrieving the current
// user's profile, and listing users (Admin-only). All password
// hashing happens in the User model; this controller never touches
// a plaintext-vs-hash comparison directly except via
// user.comparePassword().

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/auth/register  (protected: ADMIN only)
// Creates a new user account with a specified role. This is how
// Manager and Farm Staff accounts are created, and how additional
// Admin accounts can be created after the initial seed.
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are all required.",
      });
    }

    if (!User.ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${User.ROLES.join(", ")}`,
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const user = await User.create({ name, email, password, role });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// POST /api/auth/login  (public)
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // password has `select: false` in the schema, so it must be
    // explicitly requested here.
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      // Deliberately the same message as a wrong password, so the
      // response does not reveal whether the email is registered.
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/auth/me  (protected: any authenticated role)
// Lets the frontend confirm the current token is valid and fetch the
// associated profile — used on app load to restore session state.
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/auth/users  (protected: ADMIN only)
// Minimal user list to support the Admin "manage users" permission
// from Week 1, and to give a concrete way to verify RBAC end-to-end.
async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, getMe, listUsers };
