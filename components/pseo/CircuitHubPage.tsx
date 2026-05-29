// components/pseo/CircuitHubPage.tsx — Premium circuit hub page layout
import Link from 'next/link';
import Breadcrumbs from './Breadcrumbs';
import FaqAccordion from './FaqAccordion';
import SeasonBadge from './SeasonBadge';
import BudgetIndicator from './BudgetIndicator';
import WeightedLinkGrid from './WeightedLinkGrid';

interface CircuitHubPageProps {
  data: Record<string, unknown>;
  related: Record<string, unknown>[];
}

export default function CircuitHubPage({ data, related }: CircuitHubPageProps) {
  const page = data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const content = page.content;

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white">
        <div className="absolute inset-0 bg-[url('/images/pattern-topography.svg')] opacity-5" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
          <Breadcrumbs
            items={[{ label: page.title.split('—')[0]?.trim() || page.title, href: `/explore/${page.slug}` }]}
          />
          <h1 className="text-2xl md:text-4xl font-outfit font-bold leading-tight mb-3 [&_*]:text-white">
            {page.title}
          </h1>
          <p className="text-sm md:text-base text-teal-100 max-w-3xl leading-relaxed font-inter">
            {content.overview?.slice(0, 250)}...
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {content.best_seasons?.filter((s: any) => s.recommended).map((s: any) => (
              <SeasonBadge key={s.season} season={s.season} recommended />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-lg font-outfit font-bold text-gray-900 mb-3">Overview</h2>
          <p className="text-gray-700 leading-relaxed text-sm font-inter">{content.overview}</p>
        </section>

        {/* Destinations Grid */}
        {content.destinations?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-6">
              🗺️ Destinations in This Circuit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.destinations.map((dest: any) => (
                <Link
                  key={dest.slug}
                  href={`/explore/destination/${dest.slug}-travel-guide`}
                  className="group block rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-teal-300 transition-all duration-300"
                >
                  <div className="h-40 bg-gradient-to-br from-teal-100 to-emerald-50 flex items-center justify-center">
                    <span className="text-5xl">🏔️</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                        {dest.name}
                      </h3>
                      {dest.altitude && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          📍 {dest.altitude}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{dest.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <span>📏 {dest.distance_from_hub}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Activities */}
        {content.activities?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-4">🎯 Top Activities</h2>
            <div className="flex flex-wrap gap-3">
              {content.activities.map((activity: string) => (
                <span
                  key={activity}
                  className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-sm font-medium border border-teal-100 hover:bg-teal-100 transition-colors"
                >
                  {activity}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Seasons */}
        {content.best_seasons?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-6">🌤️ Best Time to Visit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.best_seasons.map((season: any) => (
                <div
                  key={season.season}
                  className={`p-5 rounded-xl border-2 ${
                    season.recommended
                      ? 'border-teal-200 bg-teal-50/30'
                      : 'border-gray-200 bg-gray-50/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <SeasonBadge season={season.season} recommended={season.recommended} />
                    <span className="text-sm text-gray-600">{season.months}</span>
                  </div>
                  <p className="text-sm text-gray-700">{season.description}</p>
                  {season.road_conditions && (
                    <p className="mt-2 text-xs text-gray-500">
                      🚗 Road conditions: {season.road_conditions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Budget */}
        {content.budget_overview && <BudgetIndicator budget={content.budget_overview} />}

        {/* Transportation */}
        {content.transportation && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-4">🚗 How to Get Here</h2>
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">✈️</span>
                  <div>
                    <p className="font-semibold text-gray-800">Nearest Airport</p>
                    <p className="text-sm text-gray-600">{content.transportation.nearest_airport}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🚂</span>
                  <div>
                    <p className="font-semibold text-gray-800">Nearest Railway</p>
                    <p className="text-sm text-gray-600">{content.transportation.nearest_railway}</p>
                  </div>
                </div>
                {content.transportation.from_delhi && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🚗</span>
                    <div>
                      <p className="font-semibold text-gray-800">From Delhi</p>
                      <p className="text-sm text-gray-600">
                        {content.transportation.from_delhi.distance_km} km ({content.transportation.from_delhi.drive_hours} hours)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-4 border-t border-gray-200 pt-4">
                {content.transportation.route_summary}
              </p>
            </div>
          </section>
        )}

        {/* FAQs */}
        <FaqAccordion faqs={page.faq} />

        {/* Internal Links */}
        <WeightedLinkGrid links={page.internal_links} title="Explore More" maxDisplay={9} />
      </div>
    </article>
  );
}
