'use client';

/**
 * BlogSwiper — Mobile-safe, hydration-safe implementation.
 * Identical architectural pattern to ItinerarySwiper:
 * React.lazy ensures Swiper module code never executes during SSR.
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import { IBlog } from '@/types';

// ── Lazy import: Swiper NEVER imported on server ───────────────────────────
const BlogSwiperCore = lazy(() =>
  import('./BlogSwiperCore').then((m) => ({ default: m.default }))
);

// ── Skeleton: same markup on server AND during hydration ──────────────────
function BlogSwiperSkeleton() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <div className="h-48 md:h-60 bg-brand-border/30 dark:bg-brand-border-dark/30 w-full" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-brand-border/30 dark:bg-brand-border-dark/30 rounded w-3/4" />
            <div className="h-3 bg-brand-border/30 dark:bg-brand-border-dark/30 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlogSwiper({ blogs }: { blogs: IBlog[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!blogs || blogs.length === 0) return null;

  if (!mounted) return <BlogSwiperSkeleton />;

  return (
    <Suspense fallback={<BlogSwiperSkeleton />}>
      <BlogSwiperCore blogs={blogs} />
    </Suspense>
  );
}
