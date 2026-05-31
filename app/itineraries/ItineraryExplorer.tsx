'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useItineraryStore } from '@/store/itineraryStore';
import ItineraryCard from '@/components/global/ItineraryCard';
import GenreFilter from '@/components/global/GenreFilter';
import UnifiedHero from '@/components/global/UnifiedHero';
import { IItinerary } from '@/types';
import { RefreshCw, AlertCircle, Package } from 'lucide-react';

export default function ItineraryExplorer() {
  const searchParams = useSearchParams();
  const genreParam = searchParams.get('genre');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filtered, setItineraries, setGenre } = useItineraryStore();
  // Track if we've already applied the URL genre param to avoid infinite loops
  const genreApplied = useRef(false);

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      let res: Response;
      try {
        res = await fetch('/api/itineraries?limit=50', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const raw = await res.text();
      let json: any;
      try { json = JSON.parse(raw); } catch { throw new Error('Invalid JSON from server'); }

      // API returns { success: true, data: { data: [...], total, page } }
      const outer = json?.data;
      const items: IItinerary[] = Array.isArray(outer)
        ? outer
        : Array.isArray(outer?.data)
          ? outer.data
          : [];

      // Apply URL genre param AFTER data is loaded — avoids filtering against empty array
      if (genreParam && !genreApplied.current) {
        genreApplied.current = true;
        setItineraries(items);          // load all first
        setGenre(genreParam);           // then filter — both state + filtered update atomically
      } else {
        setItineraries(items);
      }

    } catch (err: any) {
      const msg = err.name === 'AbortError'
        ? 'Request timed out. Check your network.'
        : err.message || 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setItineraries, setGenre, genreParam]);

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  return (
    <div className="w-full">
      <UnifiedHero
        title="Discover Experiences"
        subtitle="Handpicked weekend getaways and Himalayan expeditions"
        backgroundImage="https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136951/seematra/backgrounds/itineraries.jpg"
        showCanvas={false}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 overflow-x-hidden">
        <div className="mb-8">
          <GenreFilter />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pb-20">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark overflow-hidden animate-pulse">
                <div className="h-52 bg-brand-border/40 dark:bg-brand-border-dark/40" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 bg-brand-border/40 dark:bg-brand-border-dark/40 rounded w-3/4" />
                  <div className="h-3 bg-brand-border/30 dark:bg-brand-border-dark/30 rounded w-1/2" />
                  <div className="h-3 bg-brand-border/30 dark:bg-brand-border-dark/30 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 flex flex-col items-center gap-4 px-4">
            <AlertCircle size={40} className="text-red-500" />
            <p className="text-red-600 font-bold font-inter text-base">{error}</p>
            <button
              onClick={fetchItineraries}
              className="btn-primary flex items-center gap-2 mt-2"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pb-20">
            {filtered.map((it) => (
              <ItineraryCard key={it._id} itinerary={it} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface dark:bg-surface-dark rounded-xl border border-brand-border dark:border-brand-border-dark flex flex-col items-center gap-4">
            <Package size={40} className="opacity-30" />
            <p className="text-brand-text/50 dark:text-brand-text-dark/50 font-inter">
              No experiences found for these filters.
            </p>
            <button
              onClick={() => {
                useItineraryStore.getState().setGenre('All');
                useItineraryStore.getState().setLocation('All');
                useItineraryStore.getState().setBudget(null);
                useItineraryStore.getState().setSearch('');
              }}
              className="btn-outline text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
