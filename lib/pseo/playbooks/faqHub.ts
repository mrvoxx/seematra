// lib/pseo/playbooks/faqHub.ts — Generate FAQ hub pages per circuit
import type { PseoPage, FaqHubContent, CircuitSeed, DestinationSeed, ActivitySeed, PseoFaq } from '../types';
import { titleCase } from '../ctrOptimizer';
import { createHash } from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

export function generateFaqHubPages(circuits: CircuitSeed[], destinations: DestinationSeed[], activities: ActivitySeed[]): PseoPage[] {
  return circuits.map(c => generateFaqHub(c, destinations.filter(d => d.circuit === c.slug), activities));
}

function generateFaqHub(circuit: CircuitSeed, dests: DestinationSeed[], activities: ActivitySeed[]): PseoPage {
  const year = new Date().getFullYear();
  const mainDest = dests[0];
  const circuitActivities = activities.filter(a => a.destinations.some(d => circuit.destinations.includes(d)));

  const categories = [
    {
      name: 'Getting There',
      faqs: [
        { question: `How to reach ${circuit.hub_city}?`, answer: `${circuit.hub_city} is accessible by air (${mainDest?.nearest_airport || 'nearest airport'}), rail (${mainDest?.nearest_railway || 'nearest station'}), and road from Delhi (${mainDest?.from_delhi.distance_km || 300} km, ${mainDest?.from_delhi.drive_hours || 7} hours).` },
        { question: `What is the nearest airport to ${circuit.hub_city}?`, answer: `The nearest airport is ${mainDest?.nearest_airport || 'Jolly Grant Airport, Dehradun'}.` },
        { question: `Are there direct buses from Delhi to ${circuit.hub_city}?`, answer: `${mainDest?.from_delhi.bus ? 'Yes, regular UPSRTC and private buses run from ISBT Kashmiri Gate.' : 'Direct buses may be limited. Consider taking a train to the nearest station and then a local bus.'}` },
      ],
    },
    {
      name: 'Best Time & Weather',
      faqs: [
        { question: `What is the best time to visit the ${circuit.name}?`, answer: `The best seasons are ${circuit.best_seasons.map(s => titleCase(s)).join(' and ')}. Avoid monsoon (Jul–Sep) due to landslide risks on mountain roads.` },
        { question: `Does it snow in the ${circuit.name}?`, answer: circuit.best_seasons.includes('snowfall') ? `Yes, higher-altitude destinations receive snowfall from December to February.` : `Snowfall is rare at most destinations in this circuit, but nearby higher-altitude areas may get snow in winter.` },
        { question: `Can I visit the ${circuit.name} during monsoon?`, answer: `Monsoon (Jul–Sep) brings heavy rainfall and landslide risks. While the landscape is lush, some routes may be closed. Not recommended for first-time visitors.` },
      ],
    },
    {
      name: 'Budget & Planning',
      faqs: [
        { question: `How much does a ${circuit.name} trip cost?`, answer: `Budget: ₹1,500–3,000/day. Mid-range: ₹3,000–7,000/day. Luxury: ₹8,000–20,000+/day. Per person including stay, food, transport, and activities.` },
        { question: `How many days are needed for the ${circuit.name}?`, answer: `3–5 days is ideal. A 3-day trip covers the top highlights, while 5+ days allows for in-depth exploration.` },
        { question: `Is the ${circuit.name} safe for solo travelers?`, answer: `Yes, the ${circuit.name} is generally safe for solo travelers. Stay at reputable accommodations, inform someone of your plans, and avoid isolated areas at night.` },
      ],
    },
    {
      name: 'Activities & Attractions',
      faqs: circuitActivities.slice(0, 4).map(a => ({
        question: `Where can I do ${a.name.toLowerCase()} in the ${circuit.name}?`,
        answer: `${a.name} is available at ${a.destinations.filter(d => circuit.destinations.includes(d)).map(d => titleCase(d)).join(', ')}. ${a.description.slice(0, 100)}. Cost: ${a.cost_range}.`,
      })),
    },
    {
      name: 'Accommodation',
      faqs: dests.slice(0, 3).map(d => ({
        question: `Where to stay in ${d.name}?`,
        answer: `Budget: ${d.accommodation.budget}. Mid-range: ${d.accommodation.mid}. Luxury: ${d.accommodation.luxury}.`,
      })),
    },
  ];

  const allFaqs: PseoFaq[] = categories.flatMap(c => c.faqs);
  const content: FaqHubContent = {
    type: 'faq_hub',
    circuit: circuit.slug,
    overview: `Everything you need to know about traveling to the ${circuit.name}. Browse our comprehensive FAQ organized by category — from transport and budget to activities and accommodation.`,
    categories,
  };

  const title = `${circuit.name} FAQs — ${allFaqs.length} Frequently Asked Questions (${year})`;
  const slug = `${circuit.slug}/faqs`;
  const contentStr = JSON.stringify(content);

  return {
    slug, page_type: 'faq_hub', status: 'published', circuit: circuit.slug, title, content,
    seo: {
      title: `${circuit.name} FAQ — ${allFaqs.length} Travel Questions Answered (${year})`.slice(0, 70),
      meta_description: `Got questions about the ${circuit.name}? Find answers to ${allFaqs.length} frequently asked questions about transport, budget, weather, activities, and more.`.slice(0, 160),
      primary_keyword: `${circuit.name.toLowerCase()} faq`,
      secondary_keywords: [`${circuit.hub_city.toLowerCase()} travel questions`, `${circuit.name.toLowerCase()} guide`],
      target_intent: `${circuit.name.toLowerCase()} frequently asked questions`,
    },
    internal_links: [], related_pages: [],
    faq: allFaqs,
    entity_tags: dests.slice(0, 5).map(d => ({ type: 'destination' as const, name: d.name, slug: d.slug, circuit: circuit.slug })),
    schema_markup: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: allFaqs.map(f => ({
        '@type': 'Question', name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
    generated_at: new Date(), updated_at: new Date(),
    word_count: contentStr.split(/\s+/).length,
    content_hash: createHash('md5').update(contentStr).digest('hex'),
  };
}
