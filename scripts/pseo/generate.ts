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
import { generateAllPages, generatePagesByType } from '../../lib/pseo/generator';
import type { PseoPageType } from '../../types/pseo';

// Import seed data directly — avoids double-nesting from MongoDB storage
import { CIRCUITS } from './seeds/circuits';
import { DESTINATIONS } from './seeds/destinations';
import { ACTIVITIES } from './seeds/activities';
import { INTENT_TEMPLATES } from './seeds/intents';
import { ENTITIES } from './seeds/entities';

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

  // Use seed data directly from TypeScript files
  const seedData = {
    circuits: CIRCUITS,
    destinations: DESTINATIONS,
    activities: ACTIVITIES,
    intents: INTENT_TEMPLATES,
    entities: ENTITIES,
  };

  console.log(`📂 Seed data loaded:`);
  console.log(`   Circuits: ${seedData.circuits.length}, Destinations: ${seedData.destinations.length}, Activities: ${seedData.activities.length}`);
  console.log(`   Intents: ${seedData.intents.length}, Entities: ${seedData.entities.length}\n`);

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
    pages.slice(0, 20).forEach(p => console.log(`   ${p.page_type.padEnd(20)} /explore/${p.slug}`));
    if (pages.length > 20) console.log(`   ... and ${pages.length - 20} more`);
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
