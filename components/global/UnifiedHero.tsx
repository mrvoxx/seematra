'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';

const HeroCanvas = dynamic(() => import('@/components/global/HeroCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black/20 dark:bg-black/40 animate-pulse" />,
});

interface UnifiedHeroProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  backgroundImage: string;
  showCanvas?: boolean;
  children?: React.ReactNode;
}

export default function UnifiedHero({
  title,
  eyebrow,
  subtitle,
  backgroundImage,
  showCanvas = true,
  children,
}: UnifiedHeroProps) {
  return (
    <section className="relative min-h-[60vh] lg:min-h-[70vh] w-full overflow-hidden flex flex-col justify-center py-16 isolate">
      {/* Layer 1: Base Background Image */}
      <div className="absolute inset-0 z-[-2]">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover"
          priority
          fetchPriority="high"
        />
      </div>

      {/* Layer 2: Interactive Particles (Canvas) */}
      {showCanvas && (
        <div className="absolute inset-0 z-[-1] pointer-events-none w-full h-full">
          <HeroCanvas />
        </div>
      )}

      {/* Layer 3: Overlays for Depth & Readability */}
      <div className="absolute inset-0 z-[-1] pointer-events-none w-full h-full">
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 transition-colors" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-surface dark:via-black/20 dark:to-surface-dark" />
      </div>

      {/* ─── Standard Tailwind Entry ─── */}
      <div className="container relative z-10 mx-auto px-4 text-center">
        {eyebrow && (
          <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-poppins font-semibold uppercase tracking-[0.2em] text-white/70 mb-3 animate-fade-up">
            <span className="w-4 h-px bg-white/40 inline-block"></span>
            {eyebrow}
            <span className="w-4 h-px bg-white/40 inline-block"></span>
          </p>
        )}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-boldonse font-normal mb-3 tracking-wide leading-snug sm:leading-normal drop-shadow-sm text-white animate-fade-up">
          {title}
        </h1>

        {subtitle && (
          <p
            className="text-sm sm:text-base md:text-lg lg:text-xl font-edu text-white/95 max-w-2xl mx-auto drop-shadow-md leading-loose mb-8 animate-fade-up"
            style={{ animationDelay: '100ms', animationFillMode: 'both', fontOpticalSizing: 'auto', fontWeight: 500 }}
          >
            {subtitle}
          </p>
        )}

        {children && (
          <div className="mt-4 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
