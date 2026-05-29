// scripts/pseo/seeds/seedPseo.ts — CLI script to seed pSEO data into MongoDB
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { CIRCUITS } from './circuits';
import { DESTINATIONS } from './destinations';
import { ACTIVITIES } from './activities';
import { INTENT_TEMPLATES } from './intents';
import { ENTITIES } from './entities';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env.local');
  process.exit(1);
}

// Import model after dotenv
import PseoSeed from '../../../models/PseoSeed';

async function seedCollection(
  seedType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: { slug: string; name: string; circuit?: string; [key: string]: any }[],
) {
  let inserted = 0;
  let updated = 0;

  for (const item of items) {
    const filter = { seed_type: seedType, slug: item.slug };
    const doc = {
      seed_type: seedType,
      slug: item.slug,
      name: item.name,
      circuit: item.circuit || '',
      data: item,
      updated_at: new Date(),
    };

    const result = await PseoSeed.findOneAndUpdate(filter, doc, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    if (result.isNew !== false) {
      inserted++;
    } else {
      updated++;
    }
  }

  return { inserted, updated, total: items.length };
}

async function main() {
  console.log('\n🌱 Seematra pSEO Seeder\n');
  console.log('Connecting to MongoDB...');

  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
  });

  console.log('✅ Connected to MongoDB\n');

  // Clear existing seeds (optional, controlled by flag)
  const shouldClear = process.argv.includes('--clear');
  if (shouldClear) {
    console.log('🗑️  Clearing existing pseo_seeds collection...');
    await PseoSeed.deleteMany({});
    console.log('✅ Cleared\n');
  }

  // Seed circuits
  console.log('📦 Seeding circuits...');
  const circuitResult = await seedCollection('circuit', CIRCUITS);
  console.log(`   ✅ ${circuitResult.total} circuits (${circuitResult.inserted} new, ${circuitResult.updated} updated)`);

  // Seed destinations
  console.log('📦 Seeding destinations...');
  const destResult = await seedCollection('destination', DESTINATIONS);
  console.log(`   ✅ ${destResult.total} destinations (${destResult.inserted} new, ${destResult.updated} updated)`);

  // Seed activities
  console.log('📦 Seeding activities...');
  const actResult = await seedCollection('activity', ACTIVITIES);
  console.log(`   ✅ ${actResult.total} activities (${actResult.inserted} new, ${actResult.updated} updated)`);

  // Seed intent templates
  console.log('📦 Seeding intent templates...');
  const intentItems = INTENT_TEMPLATES.map((t) => ({
    slug: t.category,
    name: t.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    data: t,
    circuit: '',
  }));
  const intentResult = await seedCollection('intent_template', intentItems);
  console.log(`   ✅ ${intentResult.total} intent templates (${intentResult.inserted} new, ${intentResult.updated} updated)`);

  // Seed entities
  console.log('📦 Seeding entities...');
  const entityResult = await seedCollection('entity', ENTITIES);
  console.log(`   ✅ ${entityResult.total} entities (${entityResult.inserted} new, ${entityResult.updated} updated)`);

  // Summary
  const totalSeeds = circuitResult.total + destResult.total + actResult.total + intentResult.total + entityResult.total;
  console.log(`\n🎉 Done! Total: ${totalSeeds} seeds in pseo_seeds collection.\n`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
