// components/global/GenreFilter.tsx
'use client';

import { useItineraryStore } from '@/store/itineraryStore';
import { Search, MapPin, IndianRupee } from 'lucide-react';

const GENRES = ['All', 'Adventure', 'Spiritual', 'Wildlife', 'Family', 'Luxury', 'Budget'];
const LOCATIONS = ['All', 'Rishikesh', 'Kedarnath', 'Chopta', 'Mussoorie', 'Nainital', 'Auli', 'Haridwar', 'Dehradun'];
const BUDGETS = [
  { label: 'Any Budget', value: null },
  { label: 'Under ₹5,000', value: 5000 },
  { label: 'Under ₹10,000', value: 10000 },
  { label: 'Under ₹20,000', value: 20000 },
  { label: 'Under ₹50,000', value: 50000 },
];

export default function GenreFilter() {
  const { 
    activeGenre, setGenre, 
    searchQuery, setSearch,
    activeLocation, setLocation,
    maxBudget, setBudget
  } = useItineraryStore();

  return (
    <div className="flex flex-col xl:flex-row gap-4 items-center justify-between mb-8 p-4 bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-xl">
      <div className="flex overflow-x-auto no-scrollbar gap-2 w-full xl:w-auto pb-2 xl:pb-0">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setGenre(genre)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full font-outfit text-xs transition-all duration-300 ${
              activeGenre === genre 
                ? 'bg-primary text-surface shadow-md transform scale-105' 
                : 'bg-brand-card dark:bg-brand-card-dark text-brand-text dark:text-brand-text-dark hover:bg-primary/10 hover:text-primary border border-brand-border dark:border-brand-border-dark'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
      
      <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:w-auto">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/50 pointer-events-none" />
          <select 
            value={activeLocation} 
            onChange={(e) => setLocation(e.target.value)}
            className="input-field py-2 pl-9 pr-8 text-sm w-full sm:w-[140px] appearance-none bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg cursor-pointer"
          >
            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>)}
          </select>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/50 pointer-events-none" />
          <select 
            value={maxBudget || ''} 
            onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : null)}
            className="input-field py-2 pl-9 pr-8 text-sm w-full sm:w-[150px] appearance-none bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg cursor-pointer"
          >
            {BUDGETS.map(b => <option key={b.label} value={b.value || ''}>{b.label}</option>)}
          </select>
        </div>

        <div className="relative w-full sm:w-56">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tags, places..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm w-full bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
