// server/seed/seedAdmin.js
//
// Creates the initial ADMIN account from ADMIN_EMAIL / ADMIN_PASSWORD
// in .env. This exists specifically to solve the bootstrap problem:
// POST /api/auth/register requires an ADMIN token to call, so the
// very first Admin account cannot be created through the API.
//
// Run with:  npm run seed:admin   (from server/)
//
// Safe to re-run: if an account with ADMIN_EMAIL already exists,
// no changes are made.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env before running this script."
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters long.");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`An account already exists for ${email} (role: ${existing.role}). No changes made.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const admin = await User.create({
    name: "Admin User",
    email,
    password,
    role: "ADMIN",
  });

  console.log(`Admin account created successfully: ${admin.email} (role: ${admin.role})`);
  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("Failed to seed admin account:", error.message);
  process.exit(1);
});
