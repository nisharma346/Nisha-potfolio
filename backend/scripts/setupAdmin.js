/**
 * Bootstrap the first admin account.
 * Run from any directory with ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD set.
 * Existing admin accounts are never modified by this script.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const adminName = process.env.ADMIN_NAME?.trim();
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

async function setup() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be configured in backend/.env.");
  }

  if (!adminName || !adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured before running this script."
    );
  }

  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    if (await Admin.exists({})) {
      console.error("An administrator already exists; no changes were made.");
      process.exitCode = 1;
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await Admin.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created. Credentials were not printed.");
  } finally {
    await mongoose.disconnect();
  }
}

setup().catch((error) => {
  console.error("Admin bootstrap failed:", error.name || "Error");
  process.exitCode = 1;
});
