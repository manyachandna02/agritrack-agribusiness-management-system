// server/models/User.js
//
// User account used for authentication and role-based access control.
// Passwords are always stored hashed (bcryptjs); the plaintext password
// is never persisted. The `password` field is excluded from query
// results by default (`select: false`) and must be explicitly requested
// with `.select("+password")`, which is done only in the login controller.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["ADMIN", "MANAGER", "FARM_STAFF"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ROLES,
        message: "Role must be one of: ADMIN, MANAGER, FARM_STAFF",
      },
      required: [true, "Role is required"],
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Hash the password before saving, but only if it was set or changed.
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare a plaintext candidate password against the stored hash.
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Expose the allowed role values so controllers can validate against
// a single source of truth instead of duplicating the list.
userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model("User", userSchema);
