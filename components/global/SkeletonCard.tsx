'use client';

// ─── Itinerary Card Skeleton ─────────────────────────────────────────────────
export function ItineraryCardSkeleton() {
  return (
    <div className="card flex flex-col h-full overflow-hidden">
      {/* Thumbnail shimmer */}
      <div className="relative h-48 lg:h-56 w-full bg-brand-border dark:bg-brand-border-dark animate-pulse" />

      <div className="p-4 lg:p-6 flex flex-col flex-1 gap-3">
        {/* Badges */}
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-brand-border dark:bg-brand-border-dark animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-brand-border dark:bg-brand-border-dark animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
          <div className="h-5 w-1/2 rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
        </div>

        {/* Excerpt */}
        <div className="space-y-2 flex-1">
          <div className="h-3.5 w-full rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
          <div className="h-3.5 w-5/6 rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-border dark:border-brand-border-dark">
          <div className="space-y-1">
            <div className="h-3 w-20 rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
            <div className="h-7 w-24 rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-border dark:bg-brand-border-dark animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Blog Card Skeleton ──────────────────────────────────────────────────────
export function BlogCardSkeleton() {
  return (
    <article className="card flex flex-col h-full overflow-hidden">
      {/* Thumbnail shimmer */}
      <div className="relative h-40 md:h-48 w-full bg-brand-border dark:bg-brand-border-dark animate-pulse" />

      <div className="p-4 md:p-6 flex flex-col flex-1 gap-3">
        {/* Meta */}
        <div className="flex gap-4">
          <div className="h-4 w-24 rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
          <div className="h-4 w-20 rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-full rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
          <div className="h-5 w-4/5 rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
        </div>

        {/* Excerpt */}
        <div className="space-y-2 flex-1">
          <div className="h-3.5 w-full rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
          <div className="h-3.5 w-full rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
          <div className="h-3.5 w-2/3 rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
        </div>

        {/* CTA */}
        <div className="h-4 w-28 rounded bg-brand-border dark:bg-brand-border-dark animate-pulse" />
      </div>
    </article>
  );
}

// ─── Swiper-aware skeleton row ────────────────────────────────────────────────
export function ItinerarySwiperSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ItineraryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BlogSwiperSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}
