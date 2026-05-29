// scripts/pseo/generate.ts — CLI script to generate pSEO pages and save to MongoDB
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env.local');
  process.exit(1);
}

import PseoPage from '../../models/PseoPage';
import PseoSeed from '../../models/PseoSeed';
import { generateAllPages, generatePagesByType } from '../../lib/pseo/generator';
import type { PseoPageType, CircuitSeed, DestinationSeed, ActivitySeed, IntentTemplate, EntitySeed } from '../../types/pseo';

async function loadSeedData() {
  console.log('📂 Loading seed data from MongoDB...');

  const circuits = (await PseoSeed.find({ seed_type: 'circuit' }).lean()).map(s => s.data as unknown as CircuitSeed);
  const destinations = (await PseoSeed.find({ seed_type: 'destination' }).lean()).map(s => s.data as unknown as DestinationSeed);
  const activities = (await PseoSeed.find({ seed_type: 'activity' }).lean()).map(s => s.data as unknown as ActivitySeed);
  const intentDocs = (await PseoSeed.find({ seed_type: 'intent_template' }).lean()).map(s => s.data as unknown as IntentTemplate);
  const entities = (await PseoSeed.find({ seed_type: 'entity' }).lean()).map(s => s.data as unknown as EntitySeed);

  console.log(`   Circuits: ${circuits.length}, Destinations: ${destinations.length}, Activities: ${activities.length}`);
  console.log(`   Intents: ${intentDocs.length}, Entities: ${entities.length}`);

  return { circuits, destinations, activities, intents: intentDocs, entities };
}

async function main() {
  console.log('\n🚀 Seematra pSEO Page Generator\n');

  // Parse CLI args
  const args = process.argv.slice(2);
  const typeArg = args.find(a => a.startsWith('--type='))?.split('=')[1] || 'all';
  const dryRun = args.includes('--dry-run');
  const clearExisting = args.includes('--clear');

  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Type: ${typeArg}`);
  console.log('');

  // Connect to MongoDB
  await mongoose.connect(MONGODB_URI, { bufferCommands: false, maxPoolSize: 5 });
  console.log('✅ Connected to MongoDB\n');

  // Load seed data
  const seedData = await loadSeedData();

  if (seedData.circuits.length === 0) {
    console.error('❌ No seed data found. Run `npm run pseo:seed` first.');
    process.exit(1);
  }

  // Generate pages
  let pages;
  if (typeArg === 'all') {
    const result = generateAllPages(seedData);
    pages = result.pages;

    if (result.stats.validation_warnings.length > 0 && !dryRun) {
      console.log('\n⚠️  Validation Warnings:');
      result.stats.validation_warnings.slice(0, 10).forEach(w => console.log(`   ${w}`));
      if (result.stats.validation_warnings.length > 10) {
        console.log(`   ... and ${result.stats.validation_warnings.length - 10} more`);
      }
    }
  } else {
    pages = generatePagesByType(typeArg as PseoPageType, seedData);
    console.log(`\nGenerated ${pages.length} ${typeArg} pages.`);
  }

  if (dryRun) {
    console.log(`\n🏃 DRY RUN — ${pages.length} pages would be saved. No changes made.`);
    console.log('\nSample slugs:');
    pages.slice(0, 15).forEach(p => console.log(`   ${p.page_type.padEnd(20)} /explore/${p.slug}`));
    if (pages.length > 15) console.log(`   ... and ${pages.length - 15} more`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // Clear existing pages if requested
  if (clearExisting) {
    if (typeArg === 'all') {
      console.log('\n🗑️  Clearing ALL existing pseo_pages...');
      await PseoPage.deleteMany({});
    } else {
      console.log(`\n🗑️  Clearing existing ${typeArg} pages...`);
      await PseoPage.deleteMany({ page_type: typeArg });
    }
  }

  // Save to MongoDB using bulkWrite for efficiency
  console.log(`\n💾 Saving ${pages.length} pages to MongoDB...`);

  const bulkOps = pages.map(page => ({
    updateOne: {
      filter: { slug: page.slug },
      update: { $set: page as unknown as Record<string, unknown> },
      upsert: true,
    },
  }));

  // Process in batches of 50
  const BATCH_SIZE = 50;
  let saved = 0;
  for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
    const batch = bulkOps.slice(i, i + BATCH_SIZE);
    await PseoPage.bulkWrite(batch);
    saved += batch.length;
    process.stdout.write(`\r   Progress: ${saved}/${pages.length} pages saved`);
  }

  console.log(`\n\n🎉 Done! ${pages.length} pages saved to pseo_pages collection.\n`);

  // Print summary
  const stats: Record<string, number> = {};
  pages.forEach(p => { stats[p.page_type] = (stats[p.page_type] || 0) + 1; });
  console.log('📊 Summary:');
  Object.entries(stats).sort(([, a], [, b]) => b - a).forEach(([type, count]) => {
    console.log(`   ${type.padEnd(20)} ${count} pages`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
