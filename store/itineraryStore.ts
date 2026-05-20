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

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  itineraries: [],
  filtered: [],
  activeGenre: 'All',
  searchQuery: '',
  maxBudget: null,
  activeLocation: 'All',
  setItineraries: (data) => {
    set({ itineraries: data });
    get().filterData();
  },
  setGenre: (genre) => {
    set({ activeGenre: genre });
    get().filterData();
  },
  setSearch: (query) => {
    set({ searchQuery: query });
    get().filterData();
  },
  setBudget: (budget) => {
    set({ maxBudget: budget });
    get().filterData();
  },
  setLocation: (location) => {
    set({ activeLocation: location });
    get().filterData();
  },
  filterData: () => {
    const { itineraries, activeGenre, searchQuery, maxBudget, activeLocation } = get();
    let result = [...itineraries];

    if (activeGenre !== 'All') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result = result.filter(it => it.genres.includes(activeGenre as any));
    }
    
    if (activeLocation !== 'All') {
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
    
    set({ filtered: result });
  }
}));

