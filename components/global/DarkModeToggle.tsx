// components/global/DarkModeToggle.tsx
'use client';

import { useUiStore } from '@/store/uiStore';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { isDarkMode, toggleDarkMode } = useUiStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-8 h-8" />; // hydration placeholder

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark text-brand-text dark:text-brand-text-dark transition-all hover:scale-110"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
