// store/uiStore.ts
import { create } from 'zustand';

interface UiState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
      }
      return { isDarkMode: next };
    }),
  setDarkMode: (val) =>
    set(() => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', val);
      }
      return { isDarkMode: val };
    }),
}));
