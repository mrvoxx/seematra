// lib/pseo/playbooks/circuitHub.ts — Generate circuit hub pages
import type {
  PseoPage, CircuitHubContent, CircuitSeed, DestinationSeed,
  ActivitySeed, CircuitDestinationEntry, SeasonInfo, BudgetRange,
} from '../types';
import { titleCase } from '../ctrOptimizer';
import { createHash } from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

export function generateCircuitHubPages(
  circuits: CircuitSeed[],
  destinations: DestinationSeed[],
  activities: ActivitySeed[],
): PseoPage[] {
  return circuits.map(circuit => generateCircuitHub(circuit, destinations, activities));
}

function generateCircuitHub(
  circuit: CircuitSeed,
  allDestinations: DestinationSeed[],
  allActivities: ActivitySeed[],
): PseoPage {
  const circuitDests = allDestinations.filter(d => d.circuit === circuit.slug);
  const circuitActivities = allActivities.filter(a =>
    a.destinations.some(d => circuit.destinations.includes(d))
  );

  const destinationEntries: CircuitDestinationEntry[] = circuitDests.map(d => ({
    name: d.name,
    slug: d.slug,
    description: d.description.slice(0, 200) + '...',
    image: d.image,
    altitude: d.altitude_m > 500 ? `${d.altitude_m}m` : undefined,
    distance_from_hub: d.travel_times.find(t => t.to === circuit.hub_city.toLowerCase().replace(/\s/g, '-'))
      ? `${d.travel_times.find(t => t.to === circuit.hub_city.toLowerCase().replace(/\s/g, '-'))!.km} km`
      : `Near ${circuit.hub_city}`,
    highlights: d.why_visit.slice(0, 3),
  }));

  const seasons: SeasonInfo[] = [
    { season: 'summer', months: 'April – June', description: `Summer in ${circuit.name} offers pleasant weather ideal for sightseeing and outdoor activities. Temperatures are comfortable at altitude making it peak season for most destinations.`, recommended: circuit.best_seasons.includes('summer'), weather: 'Warm days, cool evenings' },
    { season: 'monsoon', months: 'July – September', description: `Monsoon brings heavy rainfall to the ${circuit.name}. Many high-altitude routes may be closed due to landslide risk. However, the landscape turns lush green and waterfalls are at their best.`, recommended: false, weather: 'Heavy rainfall, landslide risk', road_conditions: 'Some routes may be closed' },
    { season: 'autumn', months: 'October – November', description: `Autumn is the best time to visit the ${circuit.name}. Crystal-clear skies, comfortable temperatures, and post-monsoon freshness make this the ideal season for trekking, photography, and sightseeing.`, recommended: circuit.best_seasons.includes('autumn'), weather: 'Clear skies, crisp air' },
    { season: 'winter', months: 'December – March', description: `Winter in the ${circuit.name} brings cold temperatures and possible snowfall at higher elevations. Perfect for snow activities, cozy mountain stays, and experiencing the Himalayas in their pristine white glory.`, recommended: circuit.best_seasons.includes('winter'), weather: 'Cold, possible snowfall' },
  ];

  if (circuit.best_seasons.includes('snowfall')) {
    seasons.push({
      season: 'snowfall',
      months: 'December – February',
      description: `Heavy snowfall transforms the ${circuit.name} into a winter wonderland. Snow trekking, skiing (where available), and snow camping are the highlights.`,
      recommended: true,
      weather: 'Heavy snowfall, sub-zero temperatures',
      road_conditions: 'Chains may be required, some areas inaccessible',
    });
  }

  const budgetOverview: BudgetRange = {
    budget: { min: 1500, max: 3000 },
    mid_range: { min: 3000, max: 7000 },
    luxury: { min: 8000, max: 20000 },
    currency: 'INR',
    note: `Per person per day estimate for the ${circuit.name} including accommodation, meals, transport, and activities.`,
  };

  const mainDest = circuitDests[0];
  const transport = mainDest ? {
    from_delhi: mainDest.from_delhi,
    from_dehradun: mainDest.from_dehradun,
    nearest_airport: mainDest.nearest_airport,
    nearest_railway: mainDest.nearest_railway,
    local_transport: 'Local taxis, shared autos, and private cabs available. Pre-booking recommended during peak season.',
    route_summary: `The most common route from Delhi is via ${mainDest.nearest_railway.split('(')[0].trim()} by train, then by road to ${circuit.hub_city}. Total journey: approximately ${mainDest.from_delhi.drive_hours} hours by road.`,
  } : {
    from_delhi: { distance_km: 300, drive_hours: 8, bus_available: true },
    nearest_airport: 'Jolly Grant Airport, Dehradun',
    nearest_railway: 'Haridwar Junction',
    local_transport: 'Local taxis and shared transport available.',
    route_summary: `Accessible from Delhi via NH roads. Multiple transport options available.`,
  };

  const content: CircuitHubContent = {
    type: 'circuit_hub',
    overview: circuit.overview,
    destinations: destinationEntries,
    activities: circuitActivities.map(a => a.name),
    best_seasons: seasons,
    budget_overview: budgetOverview,
    transportation: transport,
    sample_itineraries: circuit.destinations.slice(0, 3).map(d =>
      `${circuit.slug}/3-day-${d}-itinerary`
    ),
  };

  const circuitName = titleCase(circuit.slug);
  const title = `${circuit.name} — Complete Travel Guide, Itineraries & Best Places (${new Date().getFullYear()})`;

  const faq = [
    { question: `What is the best time to visit the ${circuit.name}?`, answer: `The best months to visit the ${circuit.name} are ${seasons.filter(s => s.recommended).map(s => s.months).join(' and ')}. During these months, the weather is pleasant and all roads and attractions are accessible.` },
    { question: `How to reach ${circuit.hub_city} from Delhi?`, answer: `You can reach ${circuit.hub_city} from Delhi by road (${mainDest?.from_delhi.distance_km || 300} km, ${mainDest?.from_delhi.drive_hours || 8} hours), by train to ${mainDest?.nearest_railway || 'nearest station'}, or by flight to ${mainDest?.nearest_airport || 'nearest airport'}.` },
    { question: `What are the top things to do in the ${circuit.name}?`, answer: `The ${circuit.name} offers ${circuitActivities.slice(0, 5).map(a => a.name.toLowerCase()).join(', ')}. Each destination within the circuit has unique activities suited to different traveler types.` },
    { question: `How many days are needed for the ${circuit.name}?`, answer: `We recommend 3–5 days to comfortably explore the ${circuit.name}. A 3-day trip covers the highlights, while 5 days allows for in-depth exploration of multiple destinations.` },
    { question: `What is the budget for a ${circuit.name} trip?`, answer: `A budget trip costs ₹1,500–3,000 per person/day, mid-range ₹3,000–7,000, and luxury ₹8,000–20,000+. This includes accommodation, meals, transport, and activities.` },
  ];

  const contentStr = JSON.stringify(content);
  const wordCount = contentStr.split(/\s+/).length + circuit.overview.split(/\s+/).length + faq.reduce((sum, f) => sum + f.answer.split(/\s+/).length, 0);

  const page: PseoPage = {
    slug: circuit.slug,
    page_type: 'circuit_hub',
    status: 'published',
    circuit: circuit.slug,
    title,
    content,
    seo: {
      title: title.length > 70 ? `${circuit.name} — Travel Guide, Itineraries & Best Places` : title,
      meta_description: `Explore the ${circuit.name} — ${circuit.tagline}. Plan your trip with detailed itineraries, best seasons, budget tips, and expert travel advice.`.slice(0, 160),
      primary_keyword: circuit.name.toLowerCase(),
      secondary_keywords: [
        `${circuit.hub_city.toLowerCase()} travel guide`,
        `${circuit.hub_city.toLowerCase()} itinerary`,
        `things to do in ${circuit.hub_city.toLowerCase()}`,
        `${circuit.hub_city.toLowerCase()} trip plan`,
        `best places in ${circuit.slug.replace('-circuit', '').replace(/-/g, ' ')}`,
      ],
      target_intent: `${circuit.name.toLowerCase()} travel guide`,
    },
    internal_links: [],
    related_pages: [],
    faq,
    entity_tags: circuitDests.map(d => ({
      type: 'destination' as const,
      name: d.name,
      slug: d.slug,
      circuit: circuit.slug,
    })),
    schema_markup: buildCircuitHubSchema(circuit, circuitDests),
    generated_at: new Date(),
    updated_at: new Date(),
    word_count: wordCount,
    content_hash: createHash('md5').update(contentStr).digest('hex'),
  };

  return page;
}

function buildCircuitHubSchema(circuit: CircuitSeed, destinations: DestinationSeed[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TouristDestination',
        name: circuit.name,
        description: circuit.overview.slice(0, 200),
        url: `${BASE_URL}/explore/${circuit.slug}`,
        touristType: circuit.primary_activities.slice(0, 3).map(a => titleCase(a)),
        containsPlace: destinations.map(d => ({
          '@type': 'Place',
          name: d.name,
          geo: { '@type': 'GeoCoordinates', latitude: d.coords.lat, longitude: d.coords.lng },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Explore', item: `${BASE_URL}/explore` },
          { '@type': 'ListItem', position: 3, name: circuit.name, item: `${BASE_URL}/explore/${circuit.slug}` },
        ],
      },
    ],
  };
}
