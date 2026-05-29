// components/pseo/IntentPage.tsx — Adaptive intent-based page layout
import Breadcrumbs from './Breadcrumbs';
import FaqAccordion from './FaqAccordion';
import WeightedLinkGrid from './WeightedLinkGrid';

interface IntentPageProps {
  data: Record<string, unknown>;
  related: Record<string, unknown>[];
}

export default function IntentPage({ data, related }: IntentPageProps) {
  const page = data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const content = page.content;
  const category = content.intent_category;

  // Intent-specific color themes
  const themes: Record<string, { gradient: string; accent: string; icon: string }> = {
    best_time: { gradient: 'from-amber-900 via-orange-900 to-amber-800', accent: 'amber', icon: '🌤️' },
    budget_trip: { gradient: 'from-green-900 via-emerald-900 to-green-800', accent: 'green', icon: '💰' },
    weekend_trip: { gradient: 'from-purple-900 via-violet-900 to-purple-800', accent: 'purple', icon: '🚗' },
    how_to_reach: { gradient: 'from-blue-900 via-indigo-900 to-blue-800', accent: 'blue', icon: '🗺️' },
    hidden_places: { gradient: 'from-rose-900 via-pink-900 to-rose-800', accent: 'rose', icon: '🔍' },
    couple_trip: { gradient: 'from-pink-900 via-rose-900 to-pink-800', accent: 'pink', icon: '❤️' },
    adventure: { gradient: 'from-red-900 via-orange-900 to-red-800', accent: 'red', icon: '⛰️' },
    family_trip: { gradient: 'from-sky-900 via-cyan-900 to-sky-800', accent: 'sky', icon: '👨‍👩‍👧‍👦' },
    things_to_do: { gradient: 'from-teal-900 via-cyan-900 to-teal-800', accent: 'teal', icon: '🎯' },
    travel_tips: { gradient: 'from-yellow-900 via-amber-900 to-yellow-800', accent: 'yellow', icon: '💡' },
  };

  const theme = themes[category] || themes.things_to_do;

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${theme.gradient} text-white`}>
        <div className="absolute inset-0 bg-[url('/images/pattern-topography.svg')] opacity-5" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20">
          <Breadcrumbs
            items={[
              { label: page.circuit.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()), href: `/explore/${page.circuit}` },
              { label: page.title.split('—')[0]?.trim() || page.title, href: `/explore/${page.slug}` },
            ]}
          />
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{theme.icon}</span>
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              {category.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {page.title}
          </h1>
          <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
            {content.overview}
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {content.sections?.map((section: any, i: number) => (
          <section key={i} className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              {section.heading}
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {section.body}
            </div>

            {/* Data table for best_time sections */}
            {section.data && category === 'best_time' && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <span className="text-xs text-gray-500 block">Temperature</span>
                  <span className="font-bold text-gray-900">
                    {section.data.temp_min}°C – {section.data.temp_max}°C
                  </span>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <span className="text-xs text-gray-500 block">Crowd</span>
                  <span className="font-bold text-gray-900 capitalize">{section.data.crowd}</span>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <span className="text-xs text-gray-500 block">Accessible</span>
                  <span className="font-bold text-gray-900">{section.data.accessible ? '✅ Yes' : '❌ No'}</span>
                </div>
              </div>
            )}

            {/* Activity data cards */}
            {section.data && category === 'things_to_do' && (
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                {section.data.difficulty && <span className="px-2 py-1 bg-gray-100 rounded-full">💪 {section.data.difficulty}</span>}
                {section.data.cost && <span className="px-2 py-1 bg-gray-100 rounded-full">💰 {section.data.cost}</span>}
              </div>
            )}
          </section>
        ))}

        {/* CTA */}
        <div className="my-12 p-8 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Ready to explore?
          </h2>
          <p className="text-gray-600 mb-6">
            Check out our curated itineraries for this destination.
          </p>
          <a
            href={`/explore/${page.circuit}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
          >
            View Itineraries →
          </a>
        </div>

        {/* FAQs */}
        <FaqAccordion faqs={page.faq} />

        {/* Internal Links */}
        <WeightedLinkGrid links={page.internal_links} title="Related Guides" />
      </div>
    </article>
  );
}
