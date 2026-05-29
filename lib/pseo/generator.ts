// lib/pseo/generator.ts — Core pSEO page generation orchestrator
import type { PseoPage, PseoPageType, CircuitSeed, DestinationSeed, ActivitySeed, IntentTemplate, EntitySeed } from './types';
import { generateWeightedLinks, generateRelatedPages } from './linkEngine';
import { tagEntities, mergeEntityTags } from './entityTagger';
import { validateTitle, validateMetaDescription } from './ctrOptimizer';

// Playbooks
import { generateCircuitHubPages } from './playbooks/circuitHub';
import { generateDestinationGuidePages } from './playbooks/destinationGuide';
import { generateIntentPages } from './playbooks/intentPage';
import { generateComparisonPages } from './playbooks/comparison';
import { generateSeasonalPages } from './playbooks/seasonal';
import { generateFaqHubPages } from './playbooks/faqHub';
import { generateNearbyPlacesPages } from './playbooks/nearbyPlaces';

export interface GeneratorInput {
  circuits: CircuitSeed[];
  destinations: DestinationSeed[];
  activities: ActivitySeed[];
  intents: IntentTemplate[];
  entities: EntitySeed[];
}

export interface GenerationResult {
  pages: PseoPage[];
  stats: {
    total: number;
    by_type: Record<string, number>;
    duplicates_skipped: number;
    validation_warnings: string[];
  };
}

/**
 * Generate all pSEO pages from seed data.
 */
export function generateAllPages(input: GeneratorInput): GenerationResult {
  const { circuits, destinations, activities, intents, entities } = input;
  const allPages: PseoPage[] = [];
  const warnings: string[] = [];
  let duplicatesSkipped = 0;

  // Phase 1: Generate raw pages from each playbook
  console.log('\n📖 Running playbooks...\n');

  // Circuit hubs (7 pages)
  const circuitHubs = generateCircuitHubPages(circuits, destinations, activities);
  console.log(`   ✅ Circuit hubs: ${circuitHubs.length}`);
  allPages.push(...circuitHubs);

  // Destination guides (~12 pages)
  const destGuides = generateDestinationGuidePages(destinations, activities, circuits, destinations);
  console.log(`   ✅ Destination guides: ${destGuides.length}`);
  allPages.push(...destGuides);

  // Intent pages (~100+ pages)
  const intentPages = generateIntentPages(intents, destinations, circuits, activities);
  console.log(`   ✅ Intent pages: ${intentPages.length}`);
  allPages.push(...intentPages);

  // Comparison pages (~15 pages)
  const comparisonPages = generateComparisonPages(destinations);
  console.log(`   ✅ Comparison pages: ${comparisonPages.length}`);
  allPages.push(...comparisonPages);

  // Seasonal pages (21 pages)
  const seasonalPages = generateSeasonalPages(circuits, destinations, activities);
  console.log(`   ✅ Seasonal pages: ${seasonalPages.length}`);
  allPages.push(...seasonalPages);

  // FAQ hub pages (7 pages)
  const faqPages = generateFaqHubPages(circuits, destinations, activities);
  console.log(`   ✅ FAQ hub pages: ${faqPages.length}`);
  allPages.push(...faqPages);

  // Nearby places pages (~5-10 pages)
  const nearbyPages = generateNearbyPlacesPages(destinations, destinations);
  console.log(`   ✅ Nearby places pages: ${nearbyPages.length}`);
  allPages.push(...nearbyPages);

  // Phase 2: Dedup by slug
  console.log('\n🔍 Deduplicating...');
  const uniquePages: PseoPage[] = [];
  const slugSet = new Set<string>();

  for (const page of allPages) {
    if (slugSet.has(page.slug)) {
      duplicatesSkipped++;
      warnings.push(`Duplicate slug skipped: ${page.slug}`);
      continue;
    }
    slugSet.add(page.slug);
    uniquePages.push(page);
  }
  console.log(`   Unique pages: ${uniquePages.length} (${duplicatesSkipped} duplicates skipped)`);

  // Phase 3: Entity tagging
  console.log('🏷️  Tagging entities...');
  for (const page of uniquePages) {
    const autoTags = tagEntities(page.content, page.circuit, entities);
    page.entity_tags = mergeEntityTags(page.entity_tags, autoTags);
  }

  // Phase 4: Internal linking
  console.log('🔗 Building internal link graph...');
  for (const page of uniquePages) {
    page.internal_links = generateWeightedLinks(page, uniquePages, 15);
    page.related_pages = generateRelatedPages(page, uniquePages, 6);
  }

  // Phase 5: Validate CTR
  console.log('✍️  Validating CTR optimization...');
  for (const page of uniquePages) {
    const titleResult = validateTitle(page.seo.title);
    if (!titleResult.valid) {
      warnings.push(`CTR warning [${page.slug}]: ${titleResult.issues.join('; ')}`);
    }
    const metaResult = validateMetaDescription(page.seo.meta_description);
    if (!metaResult.valid) {
      warnings.push(`Meta warning [${page.slug}]: ${metaResult.issues.join('; ')}`);
    }
  }

  // Phase 6: Compile stats
  const byType: Record<string, number> = {};
  for (const page of uniquePages) {
    byType[page.page_type] = (byType[page.page_type] || 0) + 1;
  }

  console.log(`\n📊 Generation complete: ${uniquePages.length} pages`);
  for (const [type, count] of Object.entries(byType)) {
    console.log(`   ${type}: ${count}`);
  }
  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} warnings (see stats for details)`);
  }

  return {
    pages: uniquePages,
    stats: {
      total: uniquePages.length,
      by_type: byType,
      duplicates_skipped: duplicatesSkipped,
      validation_warnings: warnings,
    },
  };
}

/**
 * Generate pages for a specific type only.
 */
export function generatePagesByType(
  type: PseoPageType,
  input: GeneratorInput,
): PseoPage[] {
  const { circuits, destinations, activities, intents } = input;

  switch (type) {
    case 'circuit_hub':
      return generateCircuitHubPages(circuits, destinations, activities);
    case 'destination_guide':
      return generateDestinationGuidePages(destinations, activities, circuits, destinations);
    case 'intent':
      return generateIntentPages(intents, destinations, circuits, activities);
    case 'comparison':
      return generateComparisonPages(destinations);
    case 'seasonal':
      return generateSeasonalPages(circuits, destinations, activities);
    case 'faq_hub':
      return generateFaqHubPages(circuits, destinations, activities);
    case 'nearby_places':
      return generateNearbyPlacesPages(destinations, destinations);
    default:
      console.warn(`Playbook not yet implemented for: ${type}`);
      return [];
  }
}
