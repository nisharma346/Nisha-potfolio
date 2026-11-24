/**
 * Admin Setup / Reset Script
 * Run: node scripts/setupAdmin.js
 *
 * - If no admin exists → creates one
 * - If admin exists    → resets the password to the one below
 */

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

// ─── SET YOUR DESIRED CREDENTIALS HERE ───────────────────────────────────────
const ADMIN_EMAIL    = "nisharma346@gmail.com";
const ADMIN_NAME     = "Nisha";
const ADMIN_PASSWORD = "Nisha@123";          // change to whatever you want
// ─────────────────────────────────────────────────────────────────────────────

async function setup() {
  if (!process.env.MONGO_URI) {
    console.error("❌  MONGO_URI not found in .env — make sure .env exists in backend/");
    process.exit(1);
  }

  console.log("🔗  Connecting to MongoDB Atlas…");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  Connected!\n");

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    // Reset password
    existing.password = hashed;
    await existing.save();
    console.log(`✅  Admin found — password reset successfully!`);
    console.log(`    Email   : ${ADMIN_EMAIL}`);
    console.log(`    Password: ${ADMIN_PASSWORD}`);
  } else {
    // Create new admin
    await Admin.create({
      name     : ADMIN_NAME,
      email    : ADMIN_EMAIL.toLowerCase(),
      password : hashed,
      role     : "admin",
    });
    console.log(`✅  New admin created!`);
    console.log(`    Email   : ${ADMIN_EMAIL}`);
    console.log(`    Password: ${ADMIN_PASSWORD}`);
  }

  await mongoose.disconnect();
  console.log("\n🎉  Done! You can now login at http://localhost:3000/admin/login");
}

setup().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
