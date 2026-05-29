// components/pseo/Breadcrumbs.tsx — SEO-friendly breadcrumb navigation
import Link from 'next/link';
import JsonLd from './JsonLd';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';
  const allItems = [{ label: 'Home', href: '/' }, { label: 'Explore', href: '/explore' }, ...items];

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: `${BASE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <JsonLd data={schemaData} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          {allItems.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {i === allItems.length - 1 ? (
                <span className="font-medium text-teal-700 truncate max-w-[200px]">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-teal-600 transition-colors truncate max-w-[150px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
