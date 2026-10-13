/**
 * Creates (or resets the password of) an admin user. There's no public
 * signup page on purpose -- admin accounts are created from the command
 * line, so a stranger can't just register themselves as an admin.
 *
 * Usage:
 *   node scripts/create-admin.js you@example.com "some-password"
 *
 * Safe to re-run with the same email to reset that admin's password.
 */

// dotenv/config on its own only loads a file named ".env" -- this project
// follows Next.js's convention of ".env.local", so it has to be pointed
// at that file explicitly or it silently finds nothing.
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
const [, , emailArg, passwordArg] = process.argv;

if (!MONGODB_URI) {
  console.error(
    "MONGODB_URI is not set. Make sure .env.local exists and has it filled in."
  );
  process.exit(1);
}

if (!emailArg || !passwordArg) {
  console.error(
    'Usage: node scripts/create-admin.js you@example.com "some-password"'
  );
  process.exit(1);
}

if (passwordArg.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const email = emailArg.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(passwordArg, 10);

  const user = await User.findOneAndUpdate(
    { email },
    { email, passwordHash, role: "admin", name: "Admin" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin user ready: ${user.email}`);
  console.log(`Log in at /admin/login`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
