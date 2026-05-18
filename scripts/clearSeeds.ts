// scripts/clearSeeds.ts
// Run with: npx ts-node -r tsconfig-paths/register scripts/clearSeeds.ts

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function clearAll() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB:', uri);

  const db = mongoose.connection.db!;

  const itineraryResult = await db.collection('itineraries').deleteMany({});
  console.log(`✅ Deleted ${itineraryResult.deletedCount} itineraries`);

  const blogResult = await db.collection('blogs').deleteMany({});
  console.log(`✅ Deleted ${blogResult.deletedCount} blogs`);

  const reviewResult = await db.collection('reviews').deleteMany({});
  console.log(`✅ Deleted ${reviewResult.deletedCount} reviews`);

  await mongoose.disconnect();
  console.log('Done. Database is clean.');
}

clearAll().catch(err => { console.error(err); process.exit(1); });
