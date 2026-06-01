'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin, ArrowRight, Clock, IndianRupee,
  ChevronLeft, ChevronRight, BookOpen, Loader2
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

interface Props {
  itineraryId: string;
}

export default function ItineraryEmbedCard({ itineraryId }: Props) {
  const [data, setData] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!itineraryId) return;
    fetch(`/api/itineraries/${itineraryId}`)
      .then(r => r.json())
      .then(d => {
        // API may return the itinerary directly or nested
        const it = d.itinerary || d;
        if (it._id) setData(it);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [itineraryId]);

  const scrollDays = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
  };

  const selectDay = (idx: number) => {
    setActiveDay(idx);
    // scroll to keep selected day visible
    if (scrollRef.current) {
      const card = scrollRef.current.children[idx] as HTMLElement;
      card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  if (loading) {
    return (
      <div className="my-10 flex items-center justify-center gap-3 py-12 rounded-2xl border border-brand-border dark:border-brand-border-dark bg-surface dark:bg-surface-dark">
        <Loader2 size={18} className="animate-spin text-primary" />
        <span className="text-sm font-inter text-brand-text/50">Loading itinerary…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="my-10 py-8 px-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 text-center">
        <p className="text-sm font-inter text-red-600 dark:text-red-400">Could not load itinerary embed.</p>
      </div>
    );
  }

  const roadmap = data.roadmap ?? [];
  const activePoint = roadmap[activeDay];

  return (
    <div className="my-12 rounded-2xl overflow-hidden border border-brand-border dark:border-brand-border-dark shadow-xl bg-brand-card dark:bg-brand-card-dark not-prose">

      {/* ── Header strip ── */}
      <div className="relative h-44 overflow-hidden">
        {/* Background image (active day or thumbnail) */}
        <img
          key={activePoint?.image || data.thumbnail}
          src={activePoint?.image || data.thumbnail}
          alt={activePoint?.locationName || data.title}
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Title + meta */}
        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={12} className="text-secondary" />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider font-outfit">
                Featured Itinerary
              </span>
            </div>
            <h3 className="text-white font-outfit font-extrabold text-lg leading-tight line-clamp-2">
              {data.title}
            </h3>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-white/75 text-xs font-inter">
                <Clock size={11} /> {data.duration}
              </span>
              <span className="flex items-center gap-1 text-white/75 text-xs font-inter">
                <IndianRupee size={11} /> from ₹{data.price?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <Link
            href={`/itineraries/${data._id}`}
            className="shrink-0 flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all duration-200"
          >
            <BookOpen size={12} /> Book Now <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* ── Active Day Detail ── */}
      {activePoint && (
        <div className="px-5 py-4 border-b border-brand-border dark:border-brand-border-dark bg-surface/50 dark:bg-surface-dark/50">
          <p className="text-[10px] font-bold font-outfit uppercase tracking-wider text-primary mb-1">
            Day {activePoint.day} — {activePoint.locationName}
          </p>
          <p className="text-xs font-inter text-brand-text/70 dark:text-brand-text-dark/70 line-clamp-2 leading-relaxed">
            {activePoint.overview}
          </p>
        </div>
      )}

      {/* ── Scrollable Day Roadmap ── */}
      {roadmap.length > 0 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold font-outfit text-brand-text/60 dark:text-brand-text-dark/60 uppercase tracking-wider">
              Day-by-Day Roadmap
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollDays('left')}
                className="w-7 h-7 rounded-full border border-brand-border dark:border-brand-border-dark flex items-center justify-center text-brand-text/50 hover:text-primary hover:border-primary transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => scrollDays('right')}
                className="w-7 h-7 rounded-full border border-brand-border dark:border-brand-border-dark flex items-center justify-center text-brand-text/50 hover:text-primary hover:border-primary transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Scrollable strip */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {roadmap.map((point, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectDay(idx)}
                className={`shrink-0 w-40 rounded-xl overflow-hidden border-2 transition-all duration-200 text-left ${
                  activeDay === idx
                    ? 'border-primary shadow-lg shadow-primary/20 scale-[1.03]'
                    : 'border-transparent hover:border-primary/40 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={point.image}
                    alt={point.locationName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Day badge */}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-outfit">
                    Day {point.day}
                  </div>
                  {activeDay === idx && (
                    <div className="absolute inset-0 ring-2 ring-primary ring-inset rounded-xl" />
                  )}
                </div>
                <div className="px-2.5 py-2 bg-surface dark:bg-surface-dark">
                  <p className={`text-[11px] font-bold font-outfit truncate ${activeDay === idx ? 'text-primary' : 'text-brand-text dark:text-brand-text-dark'}`}>
                    {point.locationName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer CTA ── */}
      <div className="px-5 pb-5 flex items-center justify-between gap-4 border-t border-brand-border dark:border-brand-border-dark pt-4">
        <p className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 font-inter">
          {roadmap.length} days · Includes transport, hotel & guide
        </p>
        <Link
          href={`/itineraries/${data._id}`}
          className="flex items-center gap-2 text-sm font-bold font-outfit text-primary hover:text-primary/80 transition-colors"
        >
          View Full Itinerary <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
