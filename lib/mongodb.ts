import mongoose, { ConnectOptions } from 'mongoose';

/**
 * Represents the cached Mongoose connection state.
 * - `conn` holds the active connection once established.
 * - `promise` holds the in-flight connection attempt to avoid duplicate connects.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

/**
 * Augment the Node.js global type to include a `mongoose` cache entry.
 * This lets us persist the connection during Next.js hot reloads in development
 * while avoiding re-declaring the global in every module import.
 */
declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var mongoose: MongooseCache | undefined;
}

/**
 * MongoDB connection string.
 * Must be provided via the `MONGODB_URI` environment variable (e.g. in `.env.local`).
 */
const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable (e.g. in .env.local).'
  );
}

/**
 * Initialize the cache on the global object so it survives hot reloads in development
 * but is isolated per Lambda invocation in serverless/edge environments.
 */
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establish (or reuse) a single Mongoose connection to MongoDB.
 *
 * This function is safe to call from any server-side code (API routes, server components,
 * route handlers, etc.). In development, it reuses the cached connection across hot reloads
 * to avoid creating multiple connections.
 */
async function connectDB(): Promise<typeof mongoose> {
  // If we already have a live connection, reuse it.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt is already in progress, reuse the same promise.
  if (!cached.promise) {
    const options: ConnectOptions = {
      bufferCommands: false, // Disable command buffering to surface connection issues early.
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, options);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // On error, reset the cached promise so future calls can retry a fresh connection.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
