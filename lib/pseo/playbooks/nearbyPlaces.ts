// lib/pseo/playbooks/nearbyPlaces.ts — Generate nearby places pages
import type { PseoPage, NearbyPlacesContent, DestinationSeed } from '../types';
import { titleCase } from '../ctrOptimizer';
import { createHash } from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

// Hub destinations that get nearby pages (destinations with 3+ nearby places within 100km)
export function generateNearbyPlacesPages(destinations: DestinationSeed[], allDestinations: DestinationSeed[]): PseoPage[] {
  return destinations
    .filter(d => d.travel_times.filter(t => t.km <= 100).length >= 3)
    .map(d => generateNearbyPage(d, allDestinations));
}

function generateNearbyPage(dest: DestinationSeed, allDests: DestinationSeed[]): PseoPage {
  const year = new Date().getFullYear();
  const nearby = dest.travel_times
    .filter(t => t.km <= 100)
    .sort((a, b) => a.km - b.km)
    .map(t => {
      const d = allDests.find(nd => nd.slug === t.to);
      return {
        name: d?.name || titleCase(t.to),
        slug: t.to,
        distance_km: t.km,
        travel_hours: t.hours,
        description: d?.description.slice(0, 150) + '...' || `Located ${t.km} km from ${dest.name}.`,
        image: d?.image,
      };
    });

  const content: NearbyPlacesContent = {
    type: 'nearby_places',
    hub_destination: dest.slug,
    overview: `Exploring ${dest.name}? Don't miss these ${nearby.length} incredible places nearby. All are within 100 km and easily accessible as day trips or short detours from ${dest.name}.`,
    places: nearby,
  };

  const title = `${nearby.length} Places Near ${dest.name} You Must Visit — Day Trips & Detours (${year})`;
  const slug = `destination/${dest.slug}/nearby-places`;
  const contentStr = JSON.stringify(content);

  return {
    slug, page_type: 'nearby_places', status: 'published', circuit: dest.circuit, title, content,
    seo: {
      title: `${nearby.length} Places Near ${dest.name} — Day Trips & Detours (${year})`.slice(0, 70),
      meta_description: `Discover ${nearby.length} must-visit places near ${dest.name}. From ${nearby[0]?.name} (${nearby[0]?.distance_km} km) to ${nearby[nearby.length - 1]?.name} — complete guide with distances.`.slice(0, 160),
      primary_keyword: `places near ${dest.name.toLowerCase()}`,
      secondary_keywords: [`${dest.name.toLowerCase()} nearby`, `near ${dest.name.toLowerCase()}`],
      target_intent: `places near ${dest.name.toLowerCase()}`,
    },
    internal_links: [], related_pages: [],
    faq: [
      { question: `What places are near ${dest.name}?`, answer: `Top places near ${dest.name}: ${nearby.slice(0, 5).map(n => `${n.name} (${n.distance_km} km)`).join(', ')}.` },
      { question: `How far is ${nearby[0]?.name} from ${dest.name}?`, answer: `${nearby[0]?.name} is ${nearby[0]?.distance_km} km from ${dest.name}, approximately ${nearby[0]?.travel_hours} hours by road.` },
    ],
    entity_tags: [
      { type: 'destination', name: dest.name, slug: dest.slug, circuit: dest.circuit },
      ...nearby.slice(0, 5).map(n => ({ type: 'destination' as const, name: n.name, slug: n.slug, circuit: dest.circuit })),
    ],
    schema_markup: { '@context': 'https://schema.org', '@type': 'ItemList', name: `Places Near ${dest.name}`, itemListElement: nearby.map((n, i) => ({ '@type': 'ListItem', position: i + 1, name: n.name, url: `${BASE_URL}/explore/destination/${n.slug}-travel-guide` })) },
    generated_at: new Date(), updated_at: new Date(),
    word_count: contentStr.split(/\s+/).length,
    content_hash: createHash('md5').update(contentStr).digest('hex'),
  };
}
