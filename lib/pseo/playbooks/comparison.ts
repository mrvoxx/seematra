// lib/pseo/playbooks/comparison.ts — Generate comparison pages
import type { PseoPage, ComparisonContent, DestinationSeed, ComparisonRow } from '../types';
import { titleCase } from '../ctrOptimizer';
import { createHash } from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

// Define sensible comparison pairs (same or neighboring circuits only)
const COMPARISON_PAIRS: [string, string][] = [
  ['chopta', 'auli'],
  ['rishikesh', 'haridwar'],
  ['mussoorie', 'kanatal'],
  ['rishikesh', 'mussoorie'],
  ['kedarkantha', 'chopta'],
  ['auli', 'kedarkantha'],
  ['mukteshwar', 'kausani'],
  ['kausani', 'chopta'],
  ['shivpuri', 'rishikesh'],
  ['kanatal', 'chopta'],
  ['mussoorie', 'rishikesh'],
  ['haridwar', 'rishikesh'],
  ['mukteshwar', 'kanatal'],
  ['auli', 'chopta'],
  ['rishikesh', 'dehradun'],
];

export function generateComparisonPages(destinations: DestinationSeed[]): PseoPage[] {
  const pages: PseoPage[] = [];
  const destMap = new Map(destinations.map(d => [d.slug, d]));

  for (const [slugA, slugB] of COMPARISON_PAIRS) {
    const destA = destMap.get(slugA);
    const destB = destMap.get(slugB);
    if (!destA || !destB) continue;

    pages.push(generateComparison(destA, destB));
  }

  return pages;
}

function generateComparison(a: DestinationSeed, b: DestinationSeed): PseoPage {
  const year = new Date().getFullYear();

  const rows: ComparisonRow[] = [
    { category: 'Altitude', destination_a: `${a.altitude_m}m`, destination_b: `${b.altitude_m}m` },
    { category: 'Best Time to Visit', destination_a: a.best_months, destination_b: b.best_months },
    { category: 'Distance from Delhi', destination_a: `${a.from_delhi.distance_km} km (${a.from_delhi.drive_hours} hrs)`, destination_b: `${b.from_delhi.distance_km} km (${b.from_delhi.drive_hours} hrs)` },
    { category: 'Top Activities', destination_a: a.activities.slice(0, 4).map(titleCase).join(', '), destination_b: b.activities.slice(0, 4).map(titleCase).join(', ') },
    { category: 'Budget (per day)', destination_a: a.accommodation.budget, destination_b: b.accommodation.budget },
    { category: 'Crowd Level (Peak)', destination_a: a.weather.find(w => w.crowd_level === 'high')?.season || 'Medium', destination_b: b.weather.find(w => w.crowd_level === 'high')?.season || 'Medium' },
    { category: 'Nearest Airport', destination_a: a.nearest_airport, destination_b: b.nearest_airport },
    { category: 'Best For', destination_a: a.activities.slice(0, 2).map(titleCase).join(', '), destination_b: b.activities.slice(0, 2).map(titleCase).join(', ') },
  ];

  const verdict = `${a.name} is better for ${a.activities[0] ? titleCase(a.activities[0]) : 'adventure'} enthusiasts, while ${b.name} is ideal for ${b.activities[0] ? titleCase(b.activities[0]) : 'nature'} lovers. If you're short on time and closer to Delhi, ${a.from_delhi.distance_km < b.from_delhi.distance_km ? a.name : b.name} is the easier choice. For a more offbeat experience, choose ${a.altitude_m > b.altitude_m ? a.name : b.name}.`;

  const content: ComparisonContent = {
    type: 'comparison',
    destination_a: { name: a.name, slug: a.slug, circuit: a.circuit, image: a.image, tagline: a.why_visit[0] || a.description.slice(0, 80) },
    destination_b: { name: b.name, slug: b.slug, circuit: b.circuit, image: b.image, tagline: b.why_visit[0] || b.description.slice(0, 80) },
    comparison_table: rows,
    verdict,
    persona_recommendations: [
      { persona: 'couple', recommendation: `For couples, ${a.altitude_m > 1500 ? a.name : b.name} offers more romantic seclusion and scenic stays.` },
      { persona: 'adventure', recommendation: `Adventure seekers should pick ${a.activities.length >= b.activities.length ? a.name : b.name} for more activity options.` },
      { persona: 'family', recommendation: `Families will find ${a.from_delhi.drive_hours <= b.from_delhi.drive_hours ? a.name : b.name} easier to access with children.` },
      { persona: 'backpacker', recommendation: `Budget backpackers should head to ${a.altitude_m < b.altitude_m ? a.name : b.name} for cheaper stays and easier transport.` },
    ],
  };

  const title = `${a.name} vs ${b.name} — Which is Better? Complete Comparison (${year})`;
  const slug = `compare/${a.slug}-vs-${b.slug}`;
  const contentStr = JSON.stringify(content);

  return {
    slug,
    page_type: 'comparison',
    status: 'published',
    circuit: a.circuit, // Primary circuit
    title,
    content,
    seo: {
      title: `${a.name} vs ${b.name} — Which is Better? (${year} Guide)`,
      meta_description: `Confused between ${a.name} and ${b.name}? Compare altitude, activities, budget, accessibility, and best season side-by-side to pick the right destination.`.slice(0, 160),
      primary_keyword: `${a.name.toLowerCase()} vs ${b.name.toLowerCase()}`,
      secondary_keywords: [`${a.name.toLowerCase()} or ${b.name.toLowerCase()}`, `compare ${a.name.toLowerCase()} ${b.name.toLowerCase()}`],
      target_intent: `${a.name.toLowerCase()} vs ${b.name.toLowerCase()}`,
    },
    internal_links: [],
    related_pages: [],
    faq: [
      { question: `Which is better, ${a.name} or ${b.name}?`, answer: verdict },
      { question: `Which is cheaper, ${a.name} or ${b.name}?`, answer: `Budget accommodation in ${a.name}: ${a.accommodation.budget}. In ${b.name}: ${b.accommodation.budget}. ${a.from_delhi.distance_km < b.from_delhi.distance_km ? a.name : b.name} is also cheaper to reach from Delhi.` },
      { question: `Can I visit both ${a.name} and ${b.name} in one trip?`, answer: `Yes, if they are in the same or neighboring circuits. Check the travel time between them and plan for 4–6 days total.` },
    ],
    entity_tags: [
      { type: 'destination', name: a.name, slug: a.slug, circuit: a.circuit },
      { type: 'destination', name: b.name, slug: b.slug, circuit: b.circuit },
    ],
    schema_markup: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      url: `${BASE_URL}/explore/${slug}`,
      author: { '@type': 'Organization', name: 'Seematra' },
    },
    generated_at: new Date(),
    updated_at: new Date(),
    word_count: contentStr.split(/\s+/).length,
    content_hash: createHash('md5').update(contentStr).digest('hex'),
  };
}
