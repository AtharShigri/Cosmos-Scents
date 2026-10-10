import mongoose from "mongoose";

/**
 * Cached Mongoose connection, the standard pattern for Next.js: in dev,
 * modules get re-evaluated on every hot reload, so without caching on
 * `global` we'd open a new MongoDB connection on every file save.
 */

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and fill in " +
        "your MongoDB Atlas connection string (see README.md)."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
