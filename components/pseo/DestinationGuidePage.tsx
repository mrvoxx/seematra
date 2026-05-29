// components/pseo/DestinationGuidePage.tsx — Comprehensive destination guide
import Link from 'next/link';
import Breadcrumbs from './Breadcrumbs';
import FaqAccordion from './FaqAccordion';
import SeasonBadge from './SeasonBadge';
import BudgetIndicator from './BudgetIndicator';
import WeightedLinkGrid from './WeightedLinkGrid';

interface DestinationGuidePageProps {
  data: Record<string, unknown>;
  related: Record<string, unknown>[];
}

export default function DestinationGuidePage({ data, related }: DestinationGuidePageProps) {
  const page = data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const content = page.content;

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 text-white">
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
          <Breadcrumbs
            items={[
              { label: page.circuit.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()), href: `/explore/${page.circuit}` },
              { label: page.title.split('(')[0]?.trim() || page.title, href: `/explore/${page.slug}` },
            ]}
          />
          <h1 className="text-2xl md:text-4xl font-outfit font-bold leading-tight mb-3">
            {page.title}
          </h1>

          {/* Quick Stats Strip */}
          <div className="flex flex-wrap gap-4 mt-6">
            {content.how_to_reach?.from_delhi && (
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm">
                📏 <strong>{content.how_to_reach.from_delhi.distance_km} km</strong> from Delhi
              </div>
            )}
            {page.entity_tags?.find((e: any) => e.type === 'destination') && (
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm">
                🏔️ Part of <strong>{page.circuit.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</strong>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Introduction */}
        <section className="mb-10">
          <p className="text-lg text-gray-700 leading-relaxed">{content.introduction}</p>
        </section>

        {/* Why Visit */}
        {content.why_visit?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-4">✨ Why Visit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.why_visit.map((reason: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                  <span className="text-teal-600 mt-0.5 font-bold">✓</span>
                  <span className="text-gray-700">{reason}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How to Reach */}
        {content.how_to_reach && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-4">🚗 How to Reach</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="text-2xl mb-2">✈️</div>
                <h3 className="font-bold text-gray-900 mb-1">By Air</h3>
                <p className="text-sm text-gray-600">{content.how_to_reach.nearest_airport}</p>
              </div>
              <div className="p-5 bg-green-50/50 rounded-xl border border-green-100">
                <div className="text-2xl mb-2">🚂</div>
                <h3 className="font-bold text-gray-900 mb-1">By Train</h3>
                <p className="text-sm text-gray-600">{content.how_to_reach.nearest_railway}</p>
              </div>
              <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="text-2xl mb-2">🚗</div>
                <h3 className="font-bold text-gray-900 mb-1">By Road</h3>
                <p className="text-sm text-gray-600">
                  {content.how_to_reach.from_delhi?.distance_km} km from Delhi
                  ({content.how_to_reach.from_delhi?.drive_hours} hrs)
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
              {content.how_to_reach.route_summary}
            </p>
          </section>
        )}

        {/* Best Time to Visit */}
        {content.best_time?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-4">🌤️ Best Time to Visit</h2>
            <div className="space-y-3">
              {content.best_time.map((season: any) => (
                <div key={season.season} className={`p-4 rounded-xl border-2 ${season.recommended ? 'border-teal-200 bg-teal-50/30' : 'border-gray-100 bg-gray-50/30'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <SeasonBadge season={season.season} recommended={season.recommended} />
                    <span className="text-sm text-gray-600">{season.months}</span>
                  </div>
                  <p className="text-sm text-gray-700">{season.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Things to Do */}
        {content.things_to_do?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-6">🎯 Things to Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.things_to_do.map((thing: any, i: number) => (
                <div key={i} className="p-5 rounded-xl border border-gray-200 hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{thing.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">{thing.category}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{thing.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {thing.duration && <span>⏱️ {thing.duration}</span>}
                    {thing.difficulty && <span>💪 {thing.difficulty}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Places */}
        {content.nearby_places?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-4">📍 Nearby Places</h2>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {content.nearby_places.map((place: any) => (
                  <Link
                    key={place.slug}
                    href={`/explore/destination/${place.slug}-travel-guide`}
                    className="group flex-shrink-0 w-56 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-teal-300 transition-all"
                  >
                    <div className="h-28 bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
                      <span className="text-3xl">🏔️</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-teal-700">{place.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        📏 {place.distance_km} km · {place.travel_hours < 1 ? `${Math.round(place.travel_hours * 60)} min` : `${place.travel_hours} hrs`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Hotels */}
        {content.hotels?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-4">🏨 Where to Stay</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {content.hotels.map((hotel: any) => (
                <div key={hotel.tier} className="p-5 rounded-xl border border-gray-200 bg-gray-50/30">
                  <span className="text-xs font-bold text-teal-600 uppercase">{hotel.tier}</span>
                  <p className="mt-2 font-semibold text-gray-900">{hotel.price_range}</p>
                  <p className="mt-1 text-sm text-gray-600">{hotel.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Budget */}
        {content.trip_cost && <BudgetIndicator budget={content.trip_cost} />}

        {/* FAQs */}
        <FaqAccordion faqs={page.faq} />

        {/* Internal Links */}
        <WeightedLinkGrid links={page.internal_links} title="Explore More" />
      </div>
    </article>
  );
}
