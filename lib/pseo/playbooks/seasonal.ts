// lib/pseo/playbooks/seasonal.ts — Generate seasonal travel guide pages
import type { PseoPage, SeasonalContent, CircuitSeed, DestinationSeed, ActivitySeed, Season } from '../types';
import { titleCase } from '../ctrOptimizer';
import { createHash } from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';
const SEASON_MONTHS: Record<Season, string> = { summer: 'April – June', monsoon: 'July – September', autumn: 'October – November', winter: 'December – March', snowfall: 'December – February' };
const SEASONS_TO_GENERATE: Season[] = ['summer', 'monsoon', 'winter'];

export function generateSeasonalPages(circuits: CircuitSeed[], destinations: DestinationSeed[], activities: ActivitySeed[]): PseoPage[] {
  const pages: PseoPage[] = [];
  for (const circuit of circuits) {
    const circuitDests = destinations.filter(d => d.circuit === circuit.slug);
    for (const season of SEASONS_TO_GENERATE) {
      pages.push(generateSeasonalPage(circuit, circuitDests, activities, season));
    }
  }
  return pages;
}

function generateSeasonalPage(circuit: CircuitSeed, dests: DestinationSeed[], activities: ActivitySeed[], season: Season): PseoPage {
  const year = new Date().getFullYear();
  const circuitName = circuit.name;
  const accessibleDests = dests.filter(d => d.weather.some(w => w.season === season && w.accessible));
  const seasonActivities = activities.filter(a => a.best_seasons.includes(season) && a.destinations.some(d => circuit.destinations.includes(d)));

  const weatherData = dests[0]?.weather.find(w => w.season === season);
  const content: SeasonalContent = {
    type: 'seasonal',
    season,
    circuit: circuit.slug,
    overview: `${titleCase(season)} in the ${circuitName} (${SEASON_MONTHS[season]}) transforms the landscape and travel experience. ${season === 'winter' ? 'Snow-dusted peaks, cozy mountain stays, and crisp Himalayan air await.' : season === 'monsoon' ? 'Lush greenery, roaring waterfalls, and dramatic cloud formations — but roads require caution.' : 'Pleasant temperatures, clear skies, and ideal conditions for outdoor adventures.'}`,
    weather: { temp_range: weatherData ? `${weatherData.temp_min}°C to ${weatherData.temp_max}°C` : 'Varies', rainfall: weatherData?.rainfall || 'Moderate', conditions: weatherData?.road_conditions || 'Varies' },
    activities: seasonActivities.map(a => a.name),
    road_conditions: accessibleDests.length === dests.length ? `All roads in the ${circuitName} are generally accessible during ${season}.` : `Some high-altitude routes may be ${season === 'monsoon' ? 'affected by landslides' : 'snow-covered'}. ${dests.filter(d => !d.weather.some(w => w.season === season && w.accessible)).map(d => d.name).join(', ')} may have restricted access.`,
    packing_list: season === 'winter' ? ['Heavy woolens and thermal innerwear', 'Waterproof jacket', 'Snow boots or sturdy shoes', 'Gloves, cap, and muffler', 'Sunscreen (UV is strong at altitude)', 'Hand warmers', 'Power bank (batteries drain fast in cold)'] : season === 'monsoon' ? ['Rain jacket and umbrella', 'Waterproof bags for electronics', 'Quick-dry clothing', 'Insect repellent', 'Sturdy waterproof shoes', 'Extra socks', 'First aid kit'] : ['Light layers', 'Sunscreen and sunglasses', 'Comfortable walking shoes', 'Hat or cap', 'Reusable water bottle', 'Camera with extra batteries', 'Light rain jacket (evenings can be cool)'],
    accommodation_notes: season === 'monsoon' ? `Some high-altitude camps and lodges close during monsoon. Book in advance and confirm availability.` : season === 'winter' ? `Many budget options reduce availability in winter. Luxury stays offer room heaters and bonfire evenings. Book early for peak winter season.` : `Peak season — book well in advance. Prices are highest during summer holidays (May–June).`,
    travel_warnings: season === 'monsoon' ? ['Landslide risk on mountain roads', 'Some routes may be temporarily closed', 'Avoid night driving', 'Carry emergency contacts'] : season === 'winter' ? ['Carry chains for vehicles if driving to high altitudes', 'Check road conditions before departure', 'Keep emergency supplies in vehicle'] : [],
    recommended_destinations: accessibleDests.map(d => d.name),
  };

  const title = `${circuitName} ${titleCase(season)} Guide (${SEASON_MONTHS[season]}) — Weather, Activities & Tips (${year})`;
  const slug = `${circuit.slug}/${season}-travel-guide`;
  const contentStr = JSON.stringify(content);

  return {
    slug, page_type: 'seasonal', status: 'published', circuit: circuit.slug, title, content,
    seo: {
      title: `${circuitName} in ${titleCase(season)} (${year}) — Complete Travel Guide`.slice(0, 70),
      meta_description: `Planning to visit ${circuitName} in ${season}? Weather, activities, road conditions, packing list, and expert tips for ${SEASON_MONTHS[season]}.`.slice(0, 160),
      primary_keyword: `${circuitName.toLowerCase()} in ${season}`,
      secondary_keywords: [`${circuit.hub_city.toLowerCase()} ${season}`, `${season} trip uttarakhand`],
      target_intent: `${circuitName.toLowerCase()} in ${season}`,
    },
    internal_links: [], related_pages: [],
    faq: [
      { question: `Is ${circuitName} good to visit in ${season}?`, answer: `${circuit.best_seasons.includes(season) ? 'Yes!' : 'It depends.'} ${content.overview}` },
      { question: `What to pack for ${circuitName} in ${season}?`, answer: content.packing_list.join(', ') + '.' },
      { question: `Are roads open in ${circuitName} during ${season}?`, answer: content.road_conditions },
    ],
    entity_tags: accessibleDests.slice(0, 5).map(d => ({ type: 'destination' as const, name: d.name, slug: d.slug, circuit: circuit.slug })),
    schema_markup: { '@context': 'https://schema.org', '@type': 'Article', headline: title, url: `${BASE_URL}/explore/${slug}` },
    generated_at: new Date(), updated_at: new Date(),
    word_count: contentStr.split(/\s+/).length,
    content_hash: createHash('md5').update(contentStr).digest('hex'),
  };
}
