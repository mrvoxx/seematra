'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin, ArrowRight, Clock, ChevronLeft, ChevronRight,
  BookOpen, Loader2, Star, CalendarDays,
} from 'lucide-react';

interface RoadmapPoint {
  day: number;
  locationName: string;
  image: string;
  overview: string;
}

interface ItineraryData {
  _id: string;
  title: string;
  duration: string;
  price: number;
  thumbnail: string;
  description: string;
  roadmap: RoadmapPoint[];
}

interface Props { itineraryId: string; }

export default function ItineraryEmbedCard({ itineraryId }: Props) {
  const [data, setData]           = useState<ItineraryData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const scrollRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!itineraryId) return;
    fetch(`/api/itineraries/${itineraryId}`)
      .then(r => r.json())
      .then(d => {
        const it = d.data || d;
        if (it?._id) setData(it); else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [itineraryId]);

  const scrollDays = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const selectDay = (idx: number) => {
    setActiveDay(idx);
    const el = scrollRef.current?.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="my-10 flex items-center justify-center gap-3 py-14 rounded-2xl border border-brand-border dark:border-brand-border-dark bg-surface dark:bg-surface-dark">
      <Loader2 size={18} className="animate-spin text-primary" />
      <span className="text-sm font-inter text-brand-text/50">Loading itinerary…</span>
    </div>
  );

  /* ── Error ── */
  if (error || !data) return (
    <div className="my-10 py-8 px-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 text-center">
      <p className="text-sm font-inter text-red-500">Could not load itinerary.</p>
    </div>
  );

  const roadmap    = data.roadmap ?? [];
  const active     = roadmap[activeDay];

  return (
    <div className="my-10 rounded-2xl overflow-hidden border border-brand-border dark:border-brand-border-dark shadow-2xl bg-white dark:bg-brand-card-dark not-prose">

      {/* ════════════════════════════════════════
          HERO STRIP — image always fills top
      ════════════════════════════════════════ */}
      <div className="relative w-full h-52 overflow-hidden">
        <img
          key={active?.image || data.thumbnail}
          src={active?.image || data.thumbnail}
          alt={active?.locationName || data.title}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
        />
        {/* Strong dark overlay so any image is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

        {/* Pill badge top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-1">
          <MapPin size={10} className="text-primary" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white font-outfit">
            Featured Itinerary
          </span>
        </div>

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title — always white */}
            <h3 className="text-white font-outfit font-extrabold text-base md:text-lg leading-snug line-clamp-2 mb-2"
              style={{ textShadow: '0 1px 12px rgba(0,0,0,0.8)' }}>
              {data.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-white/80 text-[11px] font-inter">
                <CalendarDays size={10} /> {data.duration}
              </span>
              <span className="flex items-center gap-1 text-white/80 text-[11px] font-inter">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                from <span className="font-bold text-white">₹{data.price?.toLocaleString('en-IN')}</span>
              </span>
            </div>
          </div>
          <Link
            href={`/itineraries/${data._id}`}
            className="shrink-0 flex items-center gap-1.5 bg-white text-primary text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all duration-200 whitespace-nowrap"
          >
            <BookOpen size={11} /> Book Now
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════
          ACTIVE DAY DETAIL STRIP
      ════════════════════════════════════════ */}
      {active && (
        <div className="flex items-start gap-3 px-4 py-3 bg-primary/8 dark:bg-primary/10 border-b border-brand-border dark:border-brand-border-dark">
          {/* Day pill */}
          <div className="shrink-0 flex flex-col items-center justify-center bg-primary rounded-xl px-2.5 py-1.5 min-w-[44px]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/80 font-outfit">Day</span>
            <span className="text-base font-extrabold leading-none text-white font-outfit">{active.day}</span>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-bold font-outfit text-brand-text dark:text-brand-text-dark leading-tight mb-0.5 truncate">
              {active.locationName}
            </p>
            <p className="text-xs font-inter text-brand-text/65 dark:text-brand-text-dark/65 line-clamp-2 leading-relaxed">
              {active.overview}
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SCROLLABLE DAY STRIP
      ════════════════════════════════════════ */}
      {roadmap.length > 0 && (
        <div className="px-4 pt-4 pb-3">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold font-outfit text-brand-text/50 dark:text-brand-text-dark/50 uppercase tracking-widest">
              Day-by-Day Roadmap
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollDays('left')}
                aria-label="Scroll left"
                className="w-6 h-6 rounded-full border border-brand-border dark:border-brand-border-dark flex items-center justify-center text-brand-text/40 hover:text-primary hover:border-primary transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => scrollDays('right')}
                aria-label="Scroll right"
                className="w-6 h-6 rounded-full border border-brand-border dark:border-brand-border-dark flex items-center justify-center text-brand-text/40 hover:text-primary hover:border-primary transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/*
            KEY FIX: py-1 gives breathing room so ring doesn't clip,
            no scale transform — selection shown via ring + shadow only.
          */}
          <div
            ref={scrollRef}
            className="flex gap-2.5 overflow-x-auto py-1 pr-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {roadmap.map((point, idx) => {
              const isActive = activeDay === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDay(idx)}
                  className={[
                    'shrink-0 w-[130px] rounded-xl text-left transition-all duration-200 overflow-hidden',
                    isActive
                      ? 'ring-2 ring-primary shadow-lg shadow-primary/25'
                      : 'ring-1 ring-brand-border dark:ring-brand-border-dark opacity-70 hover:opacity-100 hover:ring-primary/40',
                  ].join(' ')}
                >
                  {/* Image fills right to the top — no padding above */}
                  <div className="relative w-full h-[88px] overflow-hidden">
                    <img
                      src={point.image}
                      alt={point.locationName}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                    {/* Day badge */}
                    <div className={[
                      'absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-outfit',
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-black/55 backdrop-blur-sm text-white',
                    ].join(' ')}>
                      Day {point.day}
                    </div>
                  </div>
                  {/* Name label */}
                  <div className={[
                    'px-2 py-1.5',
                    isActive ? 'bg-primary' : 'bg-surface dark:bg-surface-dark',
                  ].join(' ')}>
                    <p className={[
                      'text-[11px] font-bold font-outfit truncate leading-tight',
                      isActive ? 'text-white' : 'text-brand-text dark:text-brand-text-dark',
                    ].join(' ')}>
                      {point.locationName}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          FOOTER CTA — explicit white text
      ════════════════════════════════════════ */}
      <div className="px-4 pb-4 pt-2">
        <Link
          href={`/itineraries/${data._id}`}
          style={{ backgroundColor: 'var(--color-primary-dyn)', color: '#ffffff' }}
          className="w-full flex items-center justify-center gap-2 font-outfit font-bold text-sm py-3 rounded-xl shadow-lg hover:opacity-90 hover:shadow-xl active:scale-[0.98] transition-all duration-200"
        >
          <BookOpen size={15} />
          View Full Itinerary · {roadmap.length} Days
          <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  );
}
