'use client';

/**
 * ItinerarySwiperCore — The actual Swiper implementation.
 * This file is ONLY ever imported via React.lazy() from ItinerarySwiper.tsx,
 * meaning it is NEVER bundled into the server render. All Swiper DOM/window
 * access is guaranteed to happen post-hydration, in the browser only.
 */

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { useState } from 'react';
import { IItinerary } from '@/types';
import ItineraryCard from '@/components/global/ItineraryCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ItinerarySwiperCore({ itineraries }: { itineraries: IItinerary[] }) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="relative px-6 sm:px-3 md:px-0">
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={16}
        slidesPerView={1}
        navigation={{ prevEl, nextEl }}
        onBeforeInit={(swiper) => {
          // @ts-ignore
          swiper.params.navigation.prevEl = prevEl;
          // @ts-ignore
          swiper.params.navigation.nextEl = nextEl;
        }}
        autoplay={{ delay: 5000, disableOnInteraction: true, pauseOnMouseEnter: true }}
        breakpoints={{
          480:  { slidesPerView: 1,   spaceBetween: 16 },
          640:  { slidesPerView: 2,   spaceBetween: 20 },
          1024: { slidesPerView: 3,   spaceBetween: 24 },
        }}
        className="w-full pb-12"
      >
        {itineraries.map((it, i) => (
          <SwiperSlide key={it._id} className="h-auto">
            <ItineraryCard itinerary={it} priority={i === 0} index={i} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom nav buttons — refs wired to Swiper via state */}
      <button
        ref={(node) => setPrevEl(node)}
        aria-label="Previous"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-full flex items-center justify-center shadow-lg text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        ref={(node) => setNextEl(node)}
        aria-label="Next"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-full flex items-center justify-center shadow-lg text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed md:-right-4 lg:-right-6"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
