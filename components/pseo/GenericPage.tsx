// components/pseo/GenericPage.tsx — Fallback renderer for seasonal, persona, faq_hub, nearby_places, activity
import Link from 'next/link';
import Breadcrumbs from './Breadcrumbs';
import FaqAccordion from './FaqAccordion';
import SeasonBadge from './SeasonBadge';
import WeightedLinkGrid from './WeightedLinkGrid';

interface GenericPageProps {
  data: Record<string, unknown>;
  related: Record<string, unknown>[];
}

export default function GenericPage({ data, related }: GenericPageProps) {
  const page = data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const content = page.content;
  const pageType = page.page_type;

  // Type-specific config
  const typeConfig: Record<string, { gradient: string; icon: string }> = {
    seasonal: { gradient: 'from-sky-900 via-blue-900 to-sky-800', icon: '🌤️' },
    persona: { gradient: 'from-rose-900 via-pink-900 to-rose-800', icon: '👤' },
    faq_hub: { gradient: 'from-violet-900 via-purple-900 to-violet-800', icon: '❓' },
    nearby_places: { gradient: 'from-emerald-900 via-green-900 to-emerald-800', icon: '📍' },
    activity: { gradient: 'from-orange-900 via-red-900 to-orange-800', icon: '⛰️' },
  };

  const config = typeConfig[pageType] || typeConfig.seasonal;

  return (
    <article className="min-h-screen bg-white">
      {/* Hero */}
      <section className={`bg-gradient-to-br ${config.gradient} text-white`}>
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <Breadcrumbs
            items={[
              { label: page.circuit.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()), href: `/explore/${page.circuit}` },
              { label: page.title.split('—')[0]?.trim() || page.title, href: `/explore/${page.slug}` },
            ]}
          />
          <span className="text-4xl mb-4 block">{config.icon}</span>
          <h1 className="text-2xl md:text-3xl font-outfit font-bold leading-tight mb-3">{page.title}</h1>
          {content.overview && (
            <p className="text-lg text-white/80 max-w-3xl">{content.overview}</p>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Seasonal-specific content */}
        {pageType === 'seasonal' && (
          <>
            {content.weather && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <span className="text-xs text-gray-500 block">Temperature</span>
                  <span className="font-bold text-gray-900">{content.weather.temp_range}</span>
                </div>
                <div className="p-4 bg-sky-50 rounded-xl text-center">
                  <span className="text-xs text-gray-500 block">Rainfall</span>
                  <span className="font-bold text-gray-900">{content.weather.rainfall}</span>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl text-center">
                  <span className="text-xs text-gray-500 block">Conditions</span>
                  <span className="font-bold text-gray-900">{content.weather.conditions}</span>
                </div>
              </div>
            )}

            {content.activities?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-base font-outfit font-bold text-gray-900 mb-3">🎯 Activities This Season</h2>
                <div className="flex flex-wrap gap-2">
                  {content.activities.map((a: string) => (
                    <span key={a} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm">{a}</span>
                  ))}
                </div>
              </section>
            )}

            {content.road_conditions && (
              <section className="mb-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-1">🚗 Road Conditions</h3>
                <p className="text-sm text-amber-700">{content.road_conditions}</p>
              </section>
            )}

            {content.packing_list?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-base font-outfit font-bold text-gray-900 mb-3">🎒 Packing List</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {content.packing_list.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-teal-500">✓</span>{item}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {content.travel_warnings?.length > 0 && (
              <section className="mb-8 p-4 bg-red-50 rounded-xl border border-red-200">
                <h3 className="font-bold text-red-800 mb-2">⚠️ Travel Warnings</h3>
                <ul className="space-y-1">
                  {content.travel_warnings.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-red-700">• {w}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {/* FAQ Hub specific */}
        {pageType === 'faq_hub' && content.categories?.map((cat: any) => (
          <section key={cat.name} className="mb-10">
            <h2 className="text-base font-outfit font-bold text-gray-900 mb-4">{cat.name}</h2>
            <FaqAccordion faqs={cat.faqs} title="" />
          </section>
        ))}

        {/* Nearby Places specific */}
        {pageType === 'nearby_places' && content.places?.length > 0 && (
          <div className="space-y-4 mb-8">
            {content.places.map((place: any) => (
              <Link
                key={place.slug}
                href={`/explore/destination/${place.slug}-travel-guide`}
                className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏔️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-teal-700">{place.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{place.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-bold text-teal-700">{place.distance_km} km</span>
                  <span className="block text-xs text-gray-500">{place.travel_hours < 1 ? `${Math.round(place.travel_hours * 60)} min` : `${place.travel_hours} hrs`}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Activity specific */}
        {pageType === 'activity' && (
          <>
            {content.best_spots?.map((spot: any, i: number) => (
              <div key={i} className="mb-6 p-5 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900">{spot.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{spot.description}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>📍 {spot.location}</span>
                  <span>💪 {spot.difficulty}</span>
                  <span>🌤️ Best: {spot.best_season}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Persona specific */}
        {pageType === 'persona' && (
          <>
            {content.why_this_circuit && (
              <section className="mb-8">
                <h2 className="text-base font-outfit font-bold text-gray-900 mb-3">Why This Circuit?</h2>
                <p className="text-gray-700">{content.why_this_circuit}</p>
              </section>
            )}
            {content.recommended_activities?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-base font-outfit font-bold text-gray-900 mb-3">Recommended Activities</h2>
                <div className="flex flex-wrap gap-2">
                  {content.recommended_activities.map((a: string) => (
                    <span key={a} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm">{a}</span>
                  ))}
                </div>
              </section>
            )}
            {content.tips?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">💡 Tips</h2>
                <ul className="space-y-2">
                  {content.tips.map((tip: string, i: number) => (
                    <li key={i} className="flex gap-2 text-gray-700"><span className="text-teal-500">•</span>{tip}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        {/* Generic FAQs (for non-faq_hub types) */}
        {pageType !== 'faq_hub' && page.faq?.length > 0 && (
          <FaqAccordion faqs={page.faq} />
        )}

        {/* Internal Links */}
        <WeightedLinkGrid links={page.internal_links} title="Related Pages" />
      </div>
    </article>
  );
}
