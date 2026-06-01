import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  crumbs: BreadcrumbItem[];
}

export default function Breadcrumb({ crumbs }: BreadcrumbProps) {
  if (!crumbs || crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="w-full flex items-center text-xs sm:text-sm font-inter text-brand-text/60 dark:text-brand-text-dark/60 overflow-x-auto whitespace-nowrap py-3 hide-scrollbar">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={crumb.href} className="flex items-center gap-1.5 sm:gap-2">
              {isLast ? (
                <span
                  className="font-semibold text-brand-text dark:text-brand-text-dark max-w-[150px] sm:max-w-[200px] md:max-w-none truncate"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  {isFirst && <Home size={14} className="shrink-0 mb-[1px]" />}
                  <span>{crumb.label}</span>
                </Link>
              )}

              {!isLast && (
                <ChevronRight size={14} className="text-brand-text/30 dark:text-brand-text-dark/30 shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
