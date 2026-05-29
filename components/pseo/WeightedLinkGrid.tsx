// components/pseo/WeightedLinkGrid.tsx — Renders internal links ordered by weight
import Link from 'next/link';

interface WeightedLink {
  slug: string;
  title: string;
  weight: string;
  relationship: string;
}

interface WeightedLinkGridProps {
  links: WeightedLink[];
  title?: string;
  maxDisplay?: number;
}

const WEIGHT_STYLES: Record<string, string> = {
  high: 'border-teal-200 bg-teal-50/50 hover:border-teal-400',
  medium: 'border-gray-200 bg-white hover:border-teal-300',
  low: 'border-gray-100 bg-gray-50/50 hover:border-gray-300',
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  parent: '↑ Parent',
  child: '↓ Related',
  sibling: '↔ Similar',
  cross: '⟶ Also see',
};

export default function WeightedLinkGrid({ links, title = 'Related Pages', maxDisplay = 9 }: WeightedLinkGridProps) {
  if (!links?.length) return null;

  const displayLinks = links.slice(0, maxDisplay);

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayLinks.map((link) => (
          <Link
            key={link.slug}
            href={`/explore/${link.slug}`}
            className={`group block p-4 rounded-xl border-2 transition-all duration-200 ${WEIGHT_STYLES[link.weight] || WEIGHT_STYLES.medium}`}
          >
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {RELATIONSHIP_LABELS[link.relationship] || link.relationship}
            </span>
            <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-2">
              {link.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
