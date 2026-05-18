'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { api } from '@/lib/services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Props {
  itemId: string;
  itemType: 'itinerary' | 'blog';
  className?: string;
}

export default function FavoriteButton({ itemId, itemType, className = '' }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { favorites, toggleFavorite } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const isFav = itemType === 'itinerary' 
    ? favorites.itineraries.some(i => (i as any)._id === itemId || i === itemId)
    : favorites.blogs.some(i => (i as any)._id === itemId || i === itemId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error('Please login to save favorites');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    // Optimistic UI update
    toggleFavorite(itemType === 'itinerary' ? 'itineraries' : 'blogs', itemId);

    try {
      const res = await api.post('/user/favorites', { itemId, itemType });
      if (!res.success && res.error) {
        throw new Error(res.error);
      }
      toast.success(res.isFavorite ? 'Saved to favorites' : 'Removed from favorites');
    } catch (error: any) {
      // Revert if failed
      toggleFavorite(itemType === 'itinerary' ? 'itineraries' : 'blogs', itemId);
      toast.error('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`absolute top-4 left-4 z-30 p-2 rounded-full bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md shadow-md border border-brand-border/30 transition-transform hover:scale-110 active:scale-95 ${className}`}
      aria-label="Toggle Favorite"
    >
      <Heart 
        size={18} 
        fill={isFav ? '#FF4B4B' : 'none'} 
        color={isFav ? '#FF4B4B' : 'currentColor'} 
        className={`transition-colors ${isFav ? 'animate-pulse-subtle' : ''}`}
      />
    </button>
  );
}
