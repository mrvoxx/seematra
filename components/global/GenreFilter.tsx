// components/global/GenreFilter.tsx
'use client';

import { useItineraryStore } from '@/store/itineraryStore';

const GENRES = ['All', 'Adventure', 'Spiritual', 'Wildlife', 'Family', 'Luxury', 'Budget'];

export default function GenreFilter() {
  const { activeGenre, setGenre, setSearch, searchQuery } = useItineraryStore();

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 p-4 bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-xl">
      <div className="flex overflow-x-auto no-scrollbar gap-2 w-full md:w-auto pb-2 md:pb-0">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setGenre(genre)}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-outfit text-sm transition-all duration-300 ${
              activeGenre === genre 
                ? 'bg-primary text-surface shadow-md transform scale-105' 
                : 'bg-brand-card dark:bg-brand-card-dark text-brand-text dark:text-brand-text-dark hover:bg-primary/10 hover:text-primary border border-brand-border dark:border-brand-border-dark'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
      
      <div className="w-full md:w-64">
        <input
          type="text"
          placeholder="Search destinations, tags..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>
    </div>
  );
}
