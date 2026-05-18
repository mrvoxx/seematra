// src/lib/mongodb.ts
import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null; } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable not set');

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,              // Max 10 connections per serverless instance
      serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable (5s)
      socketTimeoutMS: 45000,       // Close idle sockets after 45s
    }).then((m) => {
      return m;
    });
  }
  
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
