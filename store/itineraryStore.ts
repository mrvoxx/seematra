// store/itineraryStore.ts
import { create } from 'zustand';
import { IItinerary } from '@/types';

interface ItineraryState {
  itineraries: IItinerary[];
  filtered: IItinerary[];
  activeGenre: string;
  searchQuery: string;
  setItineraries: (data: IItinerary[]) => void;
  setGenre: (genre: string) => void;
  setSearch: (query: string) => void;
  filterData: () => void;
}

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  itineraries: [],
  filtered: [],
  activeGenre: 'All',
  searchQuery: '',
  setItineraries: (data) => set({ itineraries: data, filtered: data }),
  setGenre: (genre) => {
    set({ activeGenre: genre });
    get().filterData();
  },
  setSearch: (query) => {
    set({ searchQuery: query });
    get().filterData();
  },
  filterData: () => {
    const { itineraries, activeGenre, searchQuery } = get();
    let result = [...itineraries];

    if (activeGenre !== 'All') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result = result.filter(it => it.genres.includes(activeGenre as any));
    }
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(it => 
        it.title.toLowerCase().includes(q) || 
        it.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    set({ filtered: result });
  }
}));
