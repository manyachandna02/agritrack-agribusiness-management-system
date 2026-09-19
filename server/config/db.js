// server/config/db.js
//
// Establishes the MongoDB connection using Mongoose.
// The connection string is read from the MONGODB_URI environment variable
// (see .env.example at the project root). This file does not hard-code
// any credentials or connection strings.

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "MONGODB_URI is not set. Copy .env.example to .env and provide a valid MongoDB connection string."
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
