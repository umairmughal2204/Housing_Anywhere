import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Missing MONGODB_URI, ADMIN_EMAIL, or ADMIN_PASSWORD in .env");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);

const { UserModel } = await import("../src/models/User.js");

const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

const existing = await UserModel.findOne({ email: ADMIN_EMAIL.toLowerCase() });

if (existing) {
  existing.role = "admin";
  existing.passwordHash = passwordHash;
  existing.isBanned = false;
  await existing.save();
  console.log(`✅ Updated existing user to admin: ${ADMIN_EMAIL}`);
} else {
  await UserModel.create({
    email: ADMIN_EMAIL.toLowerCase(),
    firstName: "Super",
    lastName: "Admin",
    role: "admin",
    isLandlord: false,
    authProvider: "local",
    emailVerified: true,
    passwordHash,
  });
  console.log(`✅ Created new admin account: ${ADMIN_EMAIL}`);
}

await mongoose.disconnect();
console.log("Done.");
