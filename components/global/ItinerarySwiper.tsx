'use client';

/**
 * ItinerarySwiper — Mobile-safe, hydration-safe implementation
 *
 * ROOT CAUSE OF HYDRATION MISMATCH:
 *   import { Swiper } from 'swiper/react' runs at module evaluation time on the
 *   server. Swiper internally reads window/document during module init in some
 *   bundler configurations. Even though we returned a spinner pre-mount, the
 *   module-level side-effects already diverged server vs client, corrupting
 *   React's fiber tree and breaking event delegation (hamburger stops working).
 *
 * FIX:
 *   Use React.lazy + Suspense so Swiper is NEVER even imported on the server.
 *   The lazy import only executes in the browser, after hydration is complete.
 */

import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { IItinerary } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ItineraryCard from '@/components/global/ItineraryCard';

// ── Lazy import: Swiper module code NEVER runs during SSR ──────────────────
const SwiperCore = lazy(() =>
  import('./ItinerarySwiperCore').then((m) => ({ default: m.default }))
);

// ── Skeleton shown on server AND during client hydration ──────────────────
function SwiperSkeleton() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <div className="h-56 lg:h-72 bg-brand-border/30 dark:bg-brand-border-dark/30 w-full" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-brand-border/30 dark:bg-brand-border-dark/30 rounded w-3/4" />
            <div className="h-3 bg-brand-border/30 dark:bg-brand-border-dark/30 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ItinerarySwiper({ itineraries }: { itineraries: IItinerary[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!itineraries || itineraries.length === 0) return null;

  // On the server and during hydration: render the skeleton.
  // This means server HTML === initial client HTML → zero hydration mismatch.
  if (!mounted) return <SwiperSkeleton />;

  return (
    <Suspense fallback={<SwiperSkeleton />}>
      <SwiperCore itineraries={itineraries} />
    </Suspense>
  );
}
