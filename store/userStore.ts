import { create } from 'zustand';

interface UserState {
  favorites: {
    itineraries: any[];  // can be populated objects or IDs
    blogs: any[];
  };
  preferences: {
    theme: string;
    language: string;
  };
  setUserData: (data: any) => void;
  toggleFavorite: (type: 'itineraries' | 'blogs', id: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  favorites: { itineraries: [], blogs: [] },
  preferences: { theme: 'light', language: 'english' },
  setUserData: (data) => set({
    favorites: {
      itineraries: data.favoriteItineraries || [],
      blogs: data.favoriteBlogs || []
    },
    preferences: data.preferences || { theme: 'light', language: 'english' }
  }),
  toggleFavorite: (type, id) => set((state) => {
    const list: any[] = state.favorites[type];
    const isFav = list.some((i) => {
      const itemId = typeof i === 'object' && i !== null ? i._id?.toString() : i?.toString();
      return itemId === id;
    });
    return {
      favorites: {
        ...state.favorites,
        [type]: isFav
          ? list.filter((i) => {
              const itemId = typeof i === 'object' && i !== null ? i._id?.toString() : i?.toString();
              return itemId !== id;
            })
          : [...list, id],
      }
    };
  })
}));

