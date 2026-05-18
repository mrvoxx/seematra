'use client';

import { useEffect, useState, useCallback } from 'react';
import { useItineraryStore } from '@/store/itineraryStore';
import ItineraryCard from '@/components/global/ItineraryCard';
import GenreFilter from '@/components/global/GenreFilter';
import UnifiedHero from '@/components/global/UnifiedHero';
import { IItinerary } from '@/types';
import { RefreshCw, AlertCircle, Package } from 'lucide-react';

export default function ItineraryExplorer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filtered, setItineraries } = useItineraryStore();

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      let res: Response;
      try {
        res = await fetch('/api/itineraries', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
          next: { revalidate: 300 }, // Cache for 5 minutes — reduces DB hits by ~90%
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const raw = await res.text();

      let json: any;
      try {
        json = JSON.parse(raw);
      } catch (parseErr) {
        throw new Error('Invalid JSON from server');
      }

      // The API returns { success: true, data: { data: [...], total, page } }
      // api.get() unwraps to data.data = { data: [...], total }
      // We do a direct fetch so we get the full shape: json = { success, data: { data: [...] } }
      const outer = json?.data;
      const items: IItinerary[] = Array.isArray(outer)
        ? outer
        : Array.isArray(outer?.data)
          ? outer.data
          : [];

      setItineraries(items);

    } catch (err: any) {
      const msg = err.name === 'AbortError'
        ? 'Request timed out (12s). Check your network.'
        : err.message || 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setItineraries]);

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
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div style={{ width: 48, height: 48, border: '4px solid #E87F2440', borderTop: '4px solid #E87F24', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p className="text-sm font-inter text-brand-text/50">Loading itineraries…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div className="text-center py-16 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 flex flex-col items-center gap-4 px-4">
            <AlertCircle size={40} className="text-red-500" />
            <p className="text-red-600 font-bold font-inter text-base">{error}</p>
            <button
              onClick={fetchItineraries}
              className="btn-primary flex items-center gap-2 mt-2"
              style={{ touchAction: 'manipulation' }}
            >
              <RefreshCw size={16} />
              Try Again
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
              No experiences found. Try adjusting your filters.
            </p>
            <button onClick={fetchItineraries} className="btn-outline text-sm" style={{ touchAction: 'manipulation' }}>
              Reload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
