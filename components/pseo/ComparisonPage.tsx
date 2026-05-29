// components/pseo/ComparisonPage.tsx — Side-by-side destination comparison
import Link from 'next/link';
import Breadcrumbs from './Breadcrumbs';
import FaqAccordion from './FaqAccordion';
import WeightedLinkGrid from './WeightedLinkGrid';

interface ComparisonPageProps {
  data: Record<string, unknown>;
  related: Record<string, unknown>[];
}

export default function ComparisonPage({ data, related }: ComparisonPageProps) {
  const page = data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const content = page.content;

  return (
    <article className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <Breadcrumbs
            items={[{ label: page.title.split('—')[0]?.trim() || 'Compare', href: `/explore/${page.slug}` }]}
          />
          <h1 className="text-2xl md:text-3xl font-outfit font-bold leading-tight mb-3">
            {page.title}
          </h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* VS Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[content.destination_a, content.destination_b].map((dest: any) => (
            <Link
              key={dest.slug}
              href={`/explore/destination/${dest.slug}-travel-guide`}
              className="group block p-6 rounded-2xl border-2 border-gray-200 hover:border-teal-400 transition-all bg-gradient-to-br from-white to-gray-50"
            >
              <div className="h-32 bg-gradient-to-br from-teal-100 to-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-5xl">🏔️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-teal-700">{dest.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{dest.tagline}</p>
              <span className="text-xs mt-2 inline-block px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">
                {dest.circuit.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </span>
            </Link>
          ))}
        </div>

        {/* Comparison Table */}
        {content.comparison_table?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-outfit font-bold text-gray-900 mb-6">📊 Side-by-Side Comparison</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 font-semibold text-gray-700 border-b">Category</th>
                    <th className="text-left px-5 py-3 font-semibold text-teal-700 border-b">{content.destination_a.name}</th>
                    <th className="text-left px-5 py-3 font-semibold text-purple-700 border-b">{content.destination_b.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {content.comparison_table.map((row: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-5 py-3 font-medium text-gray-800 border-b border-gray-100">{row.category}</td>
                      <td className="px-5 py-3 text-gray-600 border-b border-gray-100">{row.destination_a}</td>
                      <td className="px-5 py-3 text-gray-600 border-b border-gray-100">{row.destination_b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Verdict */}
        <section className="mb-12 p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-200">
          <h2 className="text-base font-outfit font-bold text-gray-900 mb-3">🏆 Verdict</h2>
          <p className="text-gray-700 leading-relaxed">{content.verdict}</p>
        </section>

        {/* Persona Recommendations */}
        {content.persona_recommendations?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-base font-outfit font-bold text-gray-900 mb-4">👤 Who Should Pick Which?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.persona_recommendations.map((rec: any) => (
                <div key={rec.persona} className="p-4 rounded-xl border border-gray-200 bg-gray-50/30">
                  <span className="text-xs font-bold text-teal-600 uppercase">{rec.persona}</span>
                  <p className="mt-1 text-sm text-gray-700">{rec.recommendation}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <FaqAccordion faqs={page.faq} />
        <WeightedLinkGrid links={page.internal_links} title="Explore Both Destinations" />
      </div>
    </article>
  );
}
