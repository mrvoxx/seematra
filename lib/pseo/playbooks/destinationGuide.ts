// lib/pseo/playbooks/destinationGuide.ts — Generate destination guide pages
import type {
  PseoPage, DestinationGuideContent, DestinationSeed,
  ActivitySeed, CircuitSeed, SeasonInfo, NearbyPlace,
  ThingToDo, HotelSuggestion,
} from '../types';
import { titleCase } from '../ctrOptimizer';
import { createHash } from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

export function generateDestinationGuidePages(
  destinations: DestinationSeed[],
  activities: ActivitySeed[],
  circuits: CircuitSeed[],
  allDestinations: DestinationSeed[],
): PseoPage[] {
  return destinations.map(d => generateDestinationGuide(d, activities, circuits, allDestinations));
}

function generateDestinationGuide(
  dest: DestinationSeed,
  allActivities: ActivitySeed[],
  circuits: CircuitSeed[],
  allDestinations: DestinationSeed[],
): PseoPage {
  const circuit = circuits.find(c => c.slug === dest.circuit);
  const circuitName = circuit?.name || titleCase(dest.circuit);

  // Things to do — from activities available at this destination
  const thingsToDo: ThingToDo[] = allActivities
    .filter(a => a.destinations.includes(dest.slug))
    .map(a => ({
      name: a.name,
      category: a.category,
      description: a.description.slice(0, 150) + '...',
      duration: a.duration,
      difficulty: a.difficulty,
      best_season: a.best_seasons.join(', '),
    }));

  // Nearby places — from travel_times
  const nearbyPlaces: NearbyPlace[] = dest.travel_times
    .filter(t => t.km <= 100)
    .map(t => {
      const nearbyDest = allDestinations.find(d => d.slug === t.to);
      return {
        name: nearbyDest?.name || titleCase(t.to),
        slug: t.to,
        distance_km: t.km,
        travel_hours: t.hours,
        description: nearbyDest?.description.slice(0, 120) + '...' || `Located ${t.km} km from ${dest.name}.`,
        image: nearbyDest?.image,
      };
    })
    .sort((a, b) => a.distance_km - b.distance_km);

  // Best time to visit — from weather data
  const bestTime: SeasonInfo[] = dest.weather.map(w => ({
    season: w.season,
    months: w.months,
    description: `${w.season.charAt(0).toUpperCase() + w.season.slice(1)} in ${dest.name}: temperatures range from ${w.temp_min}°C to ${w.temp_max}°C. ${w.rainfall} rainfall. ${w.road_conditions}. Crowd level: ${w.crowd_level}.`,
    recommended: w.crowd_level !== 'low' && w.accessible,
    weather: `${w.temp_min}°C – ${w.temp_max}°C, ${w.rainfall}`,
    road_conditions: w.road_conditions,
  }));

  // Hotels
  const hotels: HotelSuggestion[] = [
    { tier: 'budget', area: dest.name, price_range: dest.accommodation.budget, description: `Affordable stays in ${dest.name} for budget-conscious travelers.` },
    { tier: 'mid-range', area: dest.name, price_range: dest.accommodation.mid, description: `Comfortable hotels with good amenities in ${dest.name}.` },
    { tier: 'luxury', area: dest.name, price_range: dest.accommodation.luxury, description: `Premium stays with excellent views and service in ${dest.name}.` },
  ];

  const content: DestinationGuideContent = {
    type: 'destination_guide',
    introduction: dest.description,
    why_visit: dest.why_visit,
    best_time: bestTime,
    how_to_reach: {
      from_delhi: dest.from_delhi,
      from_dehradun: dest.from_dehradun,
      nearest_airport: dest.nearest_airport,
      nearest_railway: dest.nearest_railway,
      local_transport: 'Local taxis, shared autos, and private cabs available.',
      route_summary: `From Delhi: ${dest.from_delhi.distance_km} km drive (${dest.from_delhi.drive_hours} hours). Train to ${dest.from_delhi.train_to || dest.nearest_railway.split('(')[0].trim()}, then road journey to ${dest.name}.`,
    },
    things_to_do: thingsToDo,
    nearby_places: nearbyPlaces,
    hotels,
    trip_cost: {
      budget: { min: 1500, max: 3000 },
      mid_range: { min: 3500, max: 7000 },
      luxury: { min: 8000, max: 20000 },
      currency: 'INR',
      note: `Per person per day estimate for ${dest.name} including accommodation, meals, and activities.`,
    },
    itinerary_suggestions: [
      `${dest.circuit}/3-day-${dest.slug}-itinerary`,
      `${dest.circuit}/weekend-${dest.slug}-trip`,
    ],
  };

  const year = new Date().getFullYear();
  const title = `${dest.name} Travel Guide (${year}) — Best Time, How to Reach, Things to Do`;

  const faq = [
    {
      question: `What is the best time to visit ${dest.name}?`,
      answer: `The best months to visit ${dest.name} are ${dest.best_months}. The weather is pleasant with clear skies, making it ideal for ${thingsToDo.slice(0, 2).map(t => t.name.toLowerCase()).join(' and ') || 'sightseeing'}.`,
    },
    {
      question: `How to reach ${dest.name} from Delhi?`,
      answer: `${dest.name} is ${dest.from_delhi.distance_km} km from Delhi (approximately ${dest.from_delhi.drive_hours} hours by road). ${dest.from_delhi.bus ? 'Direct buses are available. ' : ''}The nearest airport is ${dest.nearest_airport} and the nearest railway station is ${dest.nearest_railway}.`,
    },
    {
      question: `What are the top things to do in ${dest.name}?`,
      answer: `Top activities in ${dest.name} include ${thingsToDo.slice(0, 4).map(t => t.name.toLowerCase()).join(', ')}. The destination is part of the ${circuitName} and offers experiences for adventure seekers, nature lovers, and spiritual travelers.`,
    },
    {
      question: `What is the altitude of ${dest.name}?`,
      answer: `${dest.name} is situated at an altitude of ${dest.altitude_m}m (${Math.round(dest.altitude_m * 3.281)} ft) above sea level in the ${dest.district} district of Uttarakhand.`,
    },
  ];

  const contentStr = JSON.stringify(content);
  const wordCount = contentStr.split(/\s+/).length + dest.description.split(/\s+/).length + faq.reduce((sum, f) => sum + f.answer.split(/\s+/).length, 0);

  return {
    slug: `destination/${dest.slug}-travel-guide`,
    page_type: 'destination_guide',
    status: 'published',
    circuit: dest.circuit,
    title,
    content,
    seo: {
      title: `${dest.name} Travel Guide (${year}) — Best Time, How to Reach & Things to Do`,
      meta_description: `Plan your trip to ${dest.name}, ${dest.district}. At ${dest.altitude_m}m altitude, discover the best time to visit, how to reach, top activities, and budget tips.`.slice(0, 160),
      primary_keyword: `${dest.name.toLowerCase()} travel guide`,
      secondary_keywords: [
        `${dest.name.toLowerCase()} trip`,
        `things to do in ${dest.name.toLowerCase()}`,
        `how to reach ${dest.name.toLowerCase()}`,
        `${dest.name.toLowerCase()} best time to visit`,
        `${dest.name.toLowerCase()} hotels`,
      ],
      target_intent: `${dest.name.toLowerCase()} travel guide`,
    },
    internal_links: [],
    related_pages: [],
    faq,
    entity_tags: [
      { type: 'destination', name: dest.name, slug: dest.slug, circuit: dest.circuit },
      ...dest.attractions.slice(0, 5).map(a => ({
        type: 'attraction' as const,
        name: titleCase(a),
        slug: a,
        circuit: dest.circuit,
      })),
    ],
    schema_markup: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Place',
          name: dest.name,
          description: dest.description.slice(0, 200),
          url: `${BASE_URL}/explore/destination/${dest.slug}-travel-guide`,
          geo: { '@type': 'GeoCoordinates', latitude: dest.coords.lat, longitude: dest.coords.lng },
          address: { '@type': 'PostalAddress', addressRegion: 'Uttarakhand', addressCountry: 'IN' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Explore', item: `${BASE_URL}/explore` },
            { '@type': 'ListItem', position: 3, name: circuitName, item: `${BASE_URL}/explore/${dest.circuit}` },
            { '@type': 'ListItem', position: 4, name: dest.name, item: `${BASE_URL}/explore/destination/${dest.slug}-travel-guide` },
          ],
        },
      ],
    },
    generated_at: new Date(),
    updated_at: new Date(),
    word_count: wordCount,
    content_hash: createHash('md5').update(contentStr).digest('hex'),
  };
}
