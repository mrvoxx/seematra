// components/global/GenreFilter.tsx
'use client';

import { useItineraryStore } from '@/store/itineraryStore';
import { Search, MapPin, IndianRupee, SlidersHorizontal } from 'lucide-react';

const GENRES = [
  { label: 'All', emoji: '🗺️' },
  { label: 'Adventure', emoji: '🧗' },
  { label: 'Spiritual', emoji: '🕉️' },
  { label: 'Wildlife', emoji: '🦅' },
  { label: 'Family', emoji: '👨‍👩‍👧' },
  { label: 'Couple', emoji: '💑' },
  { label: 'Luxury', emoji: '✨' },
  { label: 'Trekking', emoji: '🥾' },
  { label: 'Solo', emoji: '🧍' },
];

const LOCATIONS = ['All', 'Rishikesh', 'Kedarnath', 'Chopta', 'Mussoorie', 'Nainital', 'Auli', 'Haridwar', 'Dehradun'];

const BUDGET_MAX = 100000;
const BUDGET_STEPS = [0, 5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000];

function formatBudget(val: number): string {
  if (val >= 100000) return 'Any';
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val}`;
}

export default function GenreFilter() {
  const {
    activeGenre, setGenre,
    searchQuery, setSearch,
    activeLocation, setLocation,
    maxBudget, setBudget,
  } = useItineraryStore();

  const sliderValue = maxBudget ?? BUDGET_MAX;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBudget(val >= BUDGET_MAX ? null : val);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-2xl shadow-sm">

      {/* ── Genre pill row ── */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
        {GENRES.map(({ label, emoji }) => (
          <button
            key={label}
            onClick={() => setGenre(label)}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full font-outfit font-semibold text-xs transition-all duration-200 shrink-0 ${
              activeGenre === label
                ? 'bg-primary text-white shadow-md scale-105'
                : 'bg-surface dark:bg-surface-dark text-brand-text/70 dark:text-brand-text-dark/70 hover:bg-primary/10 hover:text-primary border border-brand-border dark:border-brand-border-dark'
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">

        {/* Location dropdown */}
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 pointer-events-none" />
          <select
            value={activeLocation}
            onChange={(e) => setLocation(e.target.value)}
            className="input-field py-2 pl-8 pr-8 text-sm w-full sm:w-[145px] appearance-none cursor-pointer"
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc === 'All' ? '📍 All Locations' : loc}</option>
            ))}
          </select>
        </div>

        {/* Budget slider */}
        <div className="flex-1 sm:min-w-[220px] sm:max-w-[300px]">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <span className="flex items-center gap-1 text-xs font-bold text-brand-text/60 dark:text-brand-text-dark/60">
              <SlidersHorizontal size={12} />
              Max Budget
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${maxBudget ? 'bg-primary/10 text-primary' : 'text-brand-text/40 dark:text-brand-text-dark/40'}`}>
              {maxBudget ? `up to ${formatBudget(maxBudget)}` : 'Any Budget'}
            </span>
          </div>
          <input
            type="range"
            min={BUDGET_STEPS[0]}
            max={BUDGET_MAX}
            step={1000}
            value={sliderValue}
            onChange={handleSlider}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-brand-border dark:bg-brand-border-dark"
            style={{
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(sliderValue / BUDGET_MAX) * 100}%, var(--border-dyn) ${(sliderValue / BUDGET_MAX) * 100}%, var(--border-dyn) 100%)`
            }}
          />
          <div className="flex justify-between text-[10px] text-brand-text/30 dark:text-brand-text-dark/30 mt-0.5 px-0.5">
            <span>₹0</span>
            <span>₹1L+</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:min-w-[180px] sm:max-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search trips, places…"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-8 py-2 text-sm w-full"
          />
        </div>
      </div>

      {/* Active filter summary */}
      {(activeGenre !== 'All' || activeLocation !== 'All' || maxBudget || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-brand-border/50 dark:border-brand-border-dark/50">
          <span className="text-[11px] text-brand-text/40 font-inter">Active filters:</span>
          {activeGenre !== 'All' && (
            <span className="text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              {activeGenre}
              <button onClick={() => setGenre('All')} className="ml-0.5 hover:opacity-70">×</button>
            </span>
          )}
          {activeLocation !== 'All' && (
            <span className="text-[11px] bg-secondary/10 text-secondary dark:text-secondary font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              {activeLocation}
              <button onClick={() => setLocation('All')} className="ml-0.5 hover:opacity-70">×</button>
            </span>
          )}
          {maxBudget && (
            <span className="text-[11px] bg-accent/10 text-accent-dark dark:text-accent font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              Up to {formatBudget(maxBudget)}
              <button onClick={() => setBudget(null)} className="ml-0.5 hover:opacity-70">×</button>
            </span>
          )}
          {searchQuery && (
            <span className="text-[11px] bg-green-500/10 text-green-700 dark:text-green-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              "{searchQuery}"
              <button onClick={() => setSearch('')} className="ml-0.5 hover:opacity-70">×</button>
            </span>
          )}
          <button
            onClick={() => { setGenre('All'); setLocation('All'); setBudget(null); setSearch(''); }}
            className="text-[11px] text-red-400 hover:text-red-600 font-bold ml-auto"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
