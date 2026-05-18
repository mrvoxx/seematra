'use client';

/**
 * BlogSwiperCore — Browser-only Swiper implementation for blogs.
 * Only ever loaded via React.lazy() — never runs on the server.
 */

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { useState } from 'react';
import { IBlog } from '@/types';
import BlogCard from '@/components/global/BlogCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BlogSwiperCore({ blogs }: { blogs: IBlog[] }) {
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
        autoplay={{ delay: 6000, disableOnInteraction: true, pauseOnMouseEnter: true }}
        breakpoints={{
          480:  { slidesPerView: 1,   spaceBetween: 16 },
          640:  { slidesPerView: 2,   spaceBetween: 20 },
          1024: { slidesPerView: 3,   spaceBetween: 24 },
        }}
        className="w-full pb-12"
      >
        {blogs.map((b, i) => (
          <SwiperSlide key={b._id} className="h-auto">
            <BlogCard blog={b} index={i} />
          </SwiperSlide>
        ))}
      </Swiper>

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
