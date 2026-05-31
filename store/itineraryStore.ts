import { create } from 'zustand';
import { IItinerary } from '@/types';

interface ItineraryState {
  itineraries: IItinerary[];
  filtered: IItinerary[];
  activeGenre: string;
  searchQuery: string;
  maxBudget: number | null;
  activeLocation: string;
  setItineraries: (data: IItinerary[]) => void;
  setGenre: (genre: string) => void;
  setSearch: (query: string) => void;
  setBudget: (budget: number | null) => void;
  setLocation: (location: string) => void;
  filterData: () => void;
}

function applyFilters(
  itineraries: IItinerary[],
  activeGenre: string,
  searchQuery: string,
  maxBudget: number | null,
  activeLocation: string,
): IItinerary[] {
  let result = [...itineraries];

  if (activeGenre && activeGenre !== 'All') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result = result.filter(it => it.genres.includes(activeGenre as any));
  }

  if (activeLocation && activeLocation !== 'All') {
    const loc = activeLocation.toLowerCase();
    result = result.filter(it =>
      it.roadmap?.some(r => r.locationName.toLowerCase().includes(loc)) ||
      it.title.toLowerCase().includes(loc)
    );
  }

  if (maxBudget !== null) {
    result = result.filter(it => it.price <= maxBudget);
  }

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    result = result.filter(it =>
      it.title.toLowerCase().includes(q) ||
      it.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  return result;
}

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  itineraries: [],
  filtered: [],
  activeGenre: 'All',
  searchQuery: '',
  maxBudget: null,
  activeLocation: 'All',

  setItineraries: (data) => {
    const { activeGenre, searchQuery, maxBudget, activeLocation } = get();
    const filtered = applyFilters(data, activeGenre, searchQuery, maxBudget, activeLocation);
    // Set both atomically so filtered is never empty when itineraries are loaded
    set({ itineraries: data, filtered });
  },

  setGenre: (genre) => {
    const { itineraries, searchQuery, maxBudget, activeLocation } = get();
    const filtered = applyFilters(itineraries, genre, searchQuery, maxBudget, activeLocation);
    set({ activeGenre: genre, filtered });
  },

  setSearch: (query) => {
    const { itineraries, activeGenre, maxBudget, activeLocation } = get();
    const filtered = applyFilters(itineraries, activeGenre, query, maxBudget, activeLocation);
    set({ searchQuery: query, filtered });
  },

  setBudget: (budget) => {
    const { itineraries, activeGenre, searchQuery, activeLocation } = get();
    const filtered = applyFilters(itineraries, activeGenre, searchQuery, budget, activeLocation);
    set({ maxBudget: budget, filtered });
  },

  setLocation: (location) => {
    const { itineraries, activeGenre, searchQuery, maxBudget } = get();
    const filtered = applyFilters(itineraries, activeGenre, searchQuery, maxBudget, location);
    set({ activeLocation: location, filtered });
  },

  filterData: () => {
    const { itineraries, activeGenre, searchQuery, maxBudget, activeLocation } = get();
    const filtered = applyFilters(itineraries, activeGenre, searchQuery, maxBudget, activeLocation);
    set({ filtered });
  },
}));
