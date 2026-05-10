import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("অনুগ্রহ করে .env.local ফাইলে MONGODB_URI প্রদান করুন");
}

interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectDB = async (): Promise<Connection> => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
  const opts = {
    bufferCommands: false,
    maxPoolSize: 10, 
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };
  cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m.connection);
}

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};
