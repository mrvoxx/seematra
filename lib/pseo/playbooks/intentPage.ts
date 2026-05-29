// lib/pseo/playbooks/intentPage.ts — Generate intent-based SEO pages
import type {
  PseoPage, IntentContent, IntentSection, IntentTemplate,
  DestinationSeed, CircuitSeed, ActivitySeed,
} from '../types';
import { buildTitle, buildMetaDescription, buildSlug, titleCase } from '../ctrOptimizer';
import { createHash } from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

export function generateIntentPages(
  intents: IntentTemplate[],
  destinations: DestinationSeed[],
  circuits: CircuitSeed[],
  activities: ActivitySeed[],
): PseoPage[] {
  const pages: PseoPage[] = [];

  for (const intent of intents) {
    if (intent.applicable_to.includes('destination')) {
      for (const dest of destinations) {
        const page = generateIntentForDestination(intent, dest, circuits, activities);
        if (page) pages.push(page);
      }
    }
    if (intent.applicable_to.includes('circuit')) {
      for (const circuit of circuits) {
        const page = generateIntentForCircuit(intent, circuit, destinations, activities);
        if (page) pages.push(page);
      }
    }
  }

  return pages;
}

function generateIntentForDestination(
  intent: IntentTemplate,
  dest: DestinationSeed,
  circuits: CircuitSeed[],
  activities: ActivitySeed[],
): PseoPage | null {
  const circuit = circuits.find(c => c.slug === dest.circuit);
  if (!circuit) return null;

  const replacements = {
    target: dest.slug,
    Target: dest.name,
    destination: dest.slug,
    Destination: dest.name,
    Duration: '3-Day',
    Distance: `${dest.from_delhi.distance_km} km`,
    Season: dest.weather.find(w => w.accessible && w.crowd_level !== 'low')?.months || 'Oct–Nov',
    activity: activities.find(a => a.destinations.includes(dest.slug))?.name.toLowerCase() || 'sightseeing',
  };

  const slug = `intent/${buildSlug(intent.slug_pattern, replacements)}`;
  const title = buildTitle(intent.title_pattern, replacements);
  const metaDesc = buildMetaDescription(intent.meta_pattern, replacements);
  const targetIntent = buildSlug(intent.target_intent, replacements).replace(/-/g, ' ');

  const sections = generateSectionsForIntent(intent.category, dest, circuit, activities);
  const faq = generateFaqForIntent(intent.category, dest, circuit);

  const content: IntentContent = {
    type: 'intent',
    intent_category: intent.category,
    target_destination: dest.slug,
    target_circuit: dest.circuit,
    overview: generateOverview(intent.category, dest, circuit),
    sections,
  };

  const contentStr = JSON.stringify(content);
  const wordCount = contentStr.split(/\s+/).length + faq.reduce((sum, f) => sum + f.answer.split(/\s+/).length, 0);

  return {
    slug,
    page_type: 'intent',
    status: 'published',
    circuit: dest.circuit,
    title,
    content,
    seo: {
      title: title.slice(0, 70),
      meta_description: metaDesc,
      primary_keyword: targetIntent,
      secondary_keywords: [
        `${dest.name.toLowerCase()} ${intent.category.replace(/_/g, ' ')}`,
        `${dest.name.toLowerCase()} guide`,
        `${dest.name.toLowerCase()} travel`,
      ],
      target_intent: targetIntent,
    },
    internal_links: [],
    related_pages: [],
    faq,
    entity_tags: [
      { type: 'destination', name: dest.name, slug: dest.slug, circuit: dest.circuit },
    ],
    schema_markup: buildIntentSchema(intent, dest, title, slug),
    generated_at: new Date(),
    updated_at: new Date(),
    word_count: wordCount,
    content_hash: createHash('md5').update(contentStr).digest('hex'),
  };
}

function generateIntentForCircuit(
  intent: IntentTemplate,
  circuit: CircuitSeed,
  destinations: DestinationSeed[],
  activities: ActivitySeed[],
): PseoPage | null {
  const circuitDests = destinations.filter(d => d.circuit === circuit.slug);
  const circuitName = circuit.name.replace(' Circuit', '');

  const replacements = {
    target: circuit.slug.replace('-circuit', ''),
    Target: circuitName,
    circuit: circuit.slug.replace('-circuit', ''),
    Circuit: circuitName,
    Duration: '3–5 Day',
  };

  const slug = `intent/${buildSlug(intent.slug_pattern, replacements)}`;
  const title = buildTitle(intent.title_pattern, replacements);
  const metaDesc = buildMetaDescription(intent.meta_pattern, replacements);
  const targetIntent = buildSlug(intent.target_intent, replacements).replace(/-/g, ' ');

  const sections = generateCircuitIntentSections(intent.category, circuit, circuitDests, activities);
  const faq = generateCircuitFaq(intent.category, circuit, circuitDests);

  const content: IntentContent = {
    type: 'intent',
    intent_category: intent.category,
    target_destination: circuit.slug,
    target_circuit: circuit.slug,
    overview: `Your complete guide to ${intent.category.replace(/_/g, ' ')} for the ${circuit.name}. Whether you're planning your first visit or returning for more, this guide covers everything you need to know.`,
    sections,
  };

  const contentStr = JSON.stringify(content);
  const wordCount = contentStr.split(/\s+/).length + faq.reduce((sum, f) => sum + f.answer.split(/\s+/).length, 0);

  return {
    slug,
    page_type: 'intent',
    status: 'published',
    circuit: circuit.slug,
    title,
    content,
    seo: {
      title: title.slice(0, 70),
      meta_description: metaDesc,
      primary_keyword: targetIntent,
      secondary_keywords: [
        `${circuitName.toLowerCase()} trip`,
        `${circuitName.toLowerCase()} travel guide`,
      ],
      target_intent: targetIntent,
    },
    internal_links: [],
    related_pages: [],
    faq,
    entity_tags: circuitDests.slice(0, 5).map(d => ({
      type: 'destination' as const,
      name: d.name,
      slug: d.slug,
      circuit: circuit.slug,
    })),
    schema_markup: buildIntentSchema(intent, circuitDests[0] || null, title, slug),
    generated_at: new Date(),
    updated_at: new Date(),
    word_count: wordCount,
    content_hash: createHash('md5').update(contentStr).digest('hex'),
  };
}

// ─── Content Generators ───────────────────────────────────────────────────────

function generateOverview(category: string, dest: DestinationSeed, circuit: CircuitSeed): string {
  const overviews: Record<string, string> = {
    best_time: `Planning a trip to ${dest.name}? Choosing the right time to visit can make or break your experience. This comprehensive guide breaks down ${dest.name}'s weather, crowd levels, activities, and accessibility month by month so you can plan the perfect trip.`,
    budget_trip: `Exploring ${dest.name} doesn't have to be expensive. With smart planning, you can experience the best of ${dest.name} — from ${dest.activities.slice(0, 2).map(a => titleCase(a)).join(' to ')} — on a budget under ₹5,000. Here's your complete cost breakdown.`,
    weekend_trip: `${dest.name} is one of the best weekend getaways from Delhi, located just ${dest.from_delhi.distance_km} km away (${dest.from_delhi.drive_hours} hours drive). This 2-day itinerary covers the perfect route, overnight stay, and must-do activities.`,
    how_to_reach: `Getting to ${dest.name} in ${dest.district}, Uttarakhand is straightforward with multiple transport options. Located at ${dest.altitude_m}m altitude, ${dest.name} is accessible by air, rail, and road. Here's your complete transport guide.`,
    hidden_places: `Beyond the popular tourist spots, ${dest.name} and the ${circuit.name} hide some incredible offbeat gems. From secret viewpoints to lesser-known trails, here are the places most tourists miss.`,
    things_to_do: `${dest.name} offers far more than meets the eye. From ${dest.activities.slice(0, 3).map(a => titleCase(a)).join(', ')} to exploring ancient temples and hidden waterfalls — here's your comprehensive activity guide.`,
    travel_tips: `Heading to ${dest.name}? These practical travel tips will save you time, money, and hassle. From packing advice to local customs, safety tips to budget hacks — everything you need for a smooth trip.`,
    couple_trip: `${dest.name} is one of Uttarakhand's most romantic destinations, perfect for couples seeking a mix of adventure and tranquility. This curated couple trip guide covers the best stays, sunset spots, and intimate experiences.`,
    adventure: `Thrill-seekers, ${dest.name} is calling. From ${dest.activities.filter(a => ['rafting', 'trekking', 'bungee-jumping', 'camping', 'skiing'].includes(a)).slice(0, 3).map(a => titleCase(a)).join(', ')} — this destination packs serious adrenaline. Here's your adventure planning guide.`,
    family_trip: `Planning a family vacation to ${dest.name}? This kid-friendly travel guide covers safe activities, comfortable stays, easy routes, and practical tips for traveling with children in Uttarakhand.`,
  };
  return overviews[category] || `Complete guide to ${category.replace(/_/g, ' ')} for ${dest.name}.`;
}

function generateSectionsForIntent(
  category: string,
  dest: DestinationSeed,
  circuit: CircuitSeed,
  activities: ActivitySeed[],
): IntentSection[] {
  const destActivities = activities.filter(a => a.destinations.includes(dest.slug));

  switch (category) {
    case 'best_time':
      return dest.weather.map(w => ({
        heading: `${dest.name} in ${titleCase(w.season)} (${w.months})`,
        body: `Temperature: ${w.temp_min}°C to ${w.temp_max}°C. Rainfall: ${w.rainfall}. Road conditions: ${w.road_conditions}. Crowd level: ${w.crowd_level}. ${w.accessible ? 'All areas accessible.' : '⚠️ Some areas may be inaccessible.'}`,
        data: { temp_min: w.temp_min, temp_max: w.temp_max, crowd: w.crowd_level, accessible: w.accessible },
      }));

    case 'how_to_reach':
      return [
        { heading: 'By Air', body: `The nearest airport to ${dest.name} is ${dest.nearest_airport}. From the airport, you can hire a taxi or take a shared cab to ${dest.name}.` },
        { heading: 'By Train', body: `The nearest railway station is ${dest.nearest_railway}. ${dest.from_delhi.train_to ? `Trains from Delhi are available to ${dest.from_delhi.train_to}.` : ''} From the station, local transport connects to ${dest.name}.` },
        { heading: 'By Road from Delhi', body: `${dest.name} is ${dest.from_delhi.distance_km} km from Delhi via NH roads. The drive takes approximately ${dest.from_delhi.drive_hours} hours. ${dest.from_delhi.bus ? 'Regular bus services are available from ISBT Kashmiri Gate.' : 'Private cabs or self-drive recommended.'}` },
        { heading: 'By Road from Dehradun', body: `From Dehradun, ${dest.name} is ${dest.from_dehradun.distance_km} km (approximately ${dest.from_dehradun.drive_hours} hours drive). Taxis and shared cabs are available.` },
      ];

    case 'things_to_do':
      return destActivities.map(a => ({
        heading: a.name,
        body: `${a.description} Duration: ${a.duration}. Difficulty: ${a.difficulty}. Best season: ${a.best_seasons.join(', ')}. Cost: ${a.cost_range}.`,
        data: { difficulty: a.difficulty, cost: a.cost_range },
      }));

    case 'budget_trip':
      return [
        { heading: 'Getting There on a Budget', body: `Take a bus from Delhi ISBT to ${dest.from_delhi.train_to || dest.nearest_railway.split('(')[0].trim()} (₹300–600), then a shared taxi to ${dest.name}. Total transport: ₹500–1,000 one way.` },
        { heading: 'Budget Accommodation', body: `${dest.accommodation.budget}. Book in advance during peak season for better rates.` },
        { heading: 'Food on a Budget', body: `Local dhabas and small restaurants offer meals for ₹80–200. Look for thali meals for the best value. Street food is safe and affordable.` },
        { heading: 'Free & Low-Cost Activities', body: `Many activities in ${dest.name} are free or low-cost: ${destActivities.filter(a => a.cost_range.includes('Free') || a.cost_range.includes('₹0')).map(a => a.name.toLowerCase()).join(', ') || 'nature walks, sightseeing, temple visits'}.` },
        { heading: 'Total Budget Breakdown', body: `Transport: ₹1,000–2,000 | Stay: ₹500–1,500/night | Food: ₹300–500/day | Activities: ₹500–1,500 | Total for 2D/1N: ₹2,800–5,000 per person.` },
      ];

    case 'weekend_trip':
      return [
        { heading: 'Day 1 — Delhi to ' + dest.name, body: `Depart Delhi early morning (5–6 AM). Drive ${dest.from_delhi.distance_km} km via NH to ${dest.name} (arrive by ${10 + Math.floor(dest.from_delhi.drive_hours)} AM). Check into your hotel, freshen up, and explore ${dest.attractions.slice(0, 2).map(a => titleCase(a)).join(' and ')}. Evening: ${destActivities[0]?.name.toLowerCase() || 'local exploration'}.` },
        { heading: 'Day 2 — Explore & Return', body: `Morning: ${destActivities[1]?.name.toLowerCase() || 'Sunrise viewpoint visit'}. ${dest.attractions.length > 2 ? `Visit ${titleCase(dest.attractions[2])}.` : ''} Post-lunch, begin drive back to Delhi. Expected arrival: ${17 + Math.floor(dest.from_delhi.drive_hours)} hours.` },
        { heading: 'Best Route from Delhi', body: `Delhi → ${dest.from_delhi.train_to || 'NH'} → ${dest.name}. Total: ${dest.from_delhi.distance_km} km, approximately ${dest.from_delhi.drive_hours} hours. Start early to avoid traffic on the way out of Delhi.` },
        { heading: 'Weekend Budget Estimate', body: `Fuel/transport: ₹2,000–4,000 | Stay (1 night): ₹1,500–4,000 | Food: ₹500–1,000 | Activities: ₹500–2,000 | Total: ₹4,500–11,000 per person.` },
      ];

    default:
      return [
        { heading: `About ${dest.name}`, body: dest.description },
        { heading: 'Key Highlights', body: dest.why_visit.join('. ') + '.' },
      ];
  }
}

function generateCircuitIntentSections(
  category: string,
  circuit: CircuitSeed,
  destinations: DestinationSeed[],
  activities: ActivitySeed[],
): IntentSection[] {
  switch (category) {
    case 'hidden_places':
      return destinations.map(d => ({
        heading: d.name,
        body: `${d.description.slice(0, 200)} At ${d.altitude_m}m altitude, ${d.name} offers ${d.activities.slice(0, 3).map(a => titleCase(a)).join(', ')}.`,
      }));

    case 'budget_trip':
      return [
        { heading: 'Transport Budget', body: `Take a bus/train from Delhi to ${circuit.hub_city} (₹300–800). Local shared taxis within the ${circuit.name} cost ₹100–500 per segment.` },
        { heading: 'Stay Budget', body: `Budget stays in the ${circuit.name}: ${destinations.slice(0, 3).map(d => `${d.name} (${d.accommodation.budget})`).join('; ')}.` },
        { heading: 'Food Budget', body: `Local dhabas serve meals for ₹80–200. Total food budget: ₹300–500/day.` },
        { heading: 'Activities Budget', body: `Many attractions are free. Paid activities: ${activities.filter(a => a.destinations.some(d => circuit.destinations.includes(d))).slice(0, 3).map(a => `${a.name} (${a.cost_range})`).join(', ')}.` },
      ];

    default:
      return destinations.slice(0, 5).map(d => ({
        heading: d.name,
        body: `${d.description.slice(0, 200)} Best time: ${d.best_months}.`,
      }));
  }
}

function generateFaqForIntent(category: string, dest: DestinationSeed, circuit: CircuitSeed) {
  const baseFaqs = [
    { question: `Is ${dest.name} safe for tourists?`, answer: `Yes, ${dest.name} is generally safe for tourists. As with any travel destination, take standard precautions: inform someone of your plans, carry essentials, and follow local guidelines especially for adventure activities.` },
    { question: `Can I visit ${dest.name} with family?`, answer: `Absolutely. ${dest.name} is suitable for family visits with activities for all ages. The ${circuit.name} offers comfortable stays, easy access, and kid-friendly attractions.` },
    { question: `What should I pack for ${dest.name}?`, answer: `Pack layers (temperatures vary with altitude), comfortable walking shoes, sunscreen, a reusable water bottle, and rain gear if visiting during monsoon. For winter trips, carry heavy woolens and thermal wear.` },
  ];
  return baseFaqs;
}

function generateCircuitFaq(category: string, circuit: CircuitSeed, destinations: DestinationSeed[]) {
  return [
    { question: `How many days do I need for the ${circuit.name}?`, answer: `3–5 days is ideal for the ${circuit.name}. A 3-day trip covers the top highlights, while 5 days allows for in-depth exploration.` },
    { question: `What is the best base for the ${circuit.name}?`, answer: `${circuit.hub_city} is the best base for exploring the ${circuit.name}. It has the most accommodation options and is centrally located.` },
    { question: `Is the ${circuit.name} budget-friendly?`, answer: `Yes, the ${circuit.name} can be explored on a budget of ₹1,500–3,000 per person per day including stay, food, and basic activities.` },
  ];
}

function buildIntentSchema(intent: IntentTemplate, dest: DestinationSeed | null, title: string, slug: string) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title,
        description: dest?.description.slice(0, 200) || title,
        url: `${BASE_URL}/explore/${slug}`,
        author: { '@type': 'Organization', name: 'Seematra' },
        publisher: { '@type': 'Organization', name: 'Seematra', url: BASE_URL },
        datePublished: new Date().toISOString(),
      },
    ],
  };

  // Add FAQPage schema for best_time, how_to_reach, travel_tips
  if (['best_time', 'how_to_reach', 'travel_tips', 'things_to_do'].includes(intent.category)) {
    (schema['@graph'] as Record<string, unknown>[]).push({
      '@type': 'FAQPage',
      mainEntity: [], // Will be populated from faq array at render time
    });
  }

  return schema;
}
