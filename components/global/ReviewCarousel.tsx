// components/global/ReviewCarousel.tsx
'use client';

import Image from 'next/image';
import { Star, CheckCircle } from 'lucide-react';

export interface CarouselReview {
  _id: string;
  name: string;
  location?: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  avatar?: string | null;
  isVerified?: boolean;
  itineraryTitle?: string | null;
}

interface Props {
  reviews: CarouselReview[];
  direction?: 'left' | 'right';
  speed?: 'normal' | 'slow' | 'fast';
}



export default function ReviewCarousel({ reviews, direction = 'left', speed = 'normal' }: Props) {
  if (!reviews || reviews.length === 0) return null;

  // Duplicate enough times for seamless infinite scroll even on ultra-wide screens
  const items = [...reviews, ...reviews, ...reviews, ...reviews];

  const speedClass = {
    normal: direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right',
    slow:   direction === 'left' ? 'animate-scroll-left-slow' : 'animate-scroll-right-slow',
    fast:   direction === 'left' ? 'animate-scroll-left-fast' : 'animate-scroll-right-fast',
  }[speed];

  return (
    <div
      className="w-full overflow-hidden relative py-4"
      style={{
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        maskImage:       'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div className={`carousel-track ${speedClass}`}>
        {items.map((review, i) => {
          const hasPhoto = review.images && review.images[0];
          const hasAvatar = review.avatar;

          return (
            <div
              key={`${review._id}-${i}`}
              className="w-[260px] md:w-[320px] shrink-0 card p-0 cursor-pointer hover:-translate-y-2 transition-transform duration-300 flex flex-col overflow-hidden"
            >
              {/* Top Image Section */}
              <div className="relative h-48 w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden shrink-0">
                {hasPhoto ? (
                  <Image
                    src={review.images[0]}
                    alt={`${review.name}'s trip`}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-3xl block mb-2">❤️</span>
                    <span className="font-outfit font-bold text-primary/80">I love Seematra</span>
                  </div>
                )}
                
                {/* Verified Tag (Top Right) */}
                {review.isVerified && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle size={10} strokeWidth={3} />
                    Verified
                  </div>
                )}

                {/* Itinerary Title Tag (Bottom Left) */}
                {review.itineraryTitle && hasPhoto && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                    <span className="text-xs font-inter font-bold text-white line-clamp-1">
                      {review.itineraryTitle}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Content Section */}
              <div className="p-4 flex flex-col flex-1">
                
                {/* User Info (Name & Avatar) */}
                <div className="flex items-center gap-2 mb-2">
                  {hasAvatar ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-brand-border">
                      <Image src={review.avatar!} alt={review.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary border border-primary/20">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-outfit font-semibold text-sm text-brand-text dark:text-brand-text-dark truncate leading-tight">
                      {review.name}
                    </h3>
                    {review.location && (
                      <p className="text-[10px] text-brand-text/50 dark:text-brand-text-dark/50 font-inter truncate">{review.location}</p>
                    )}
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      fill={s <= review.rating ? '#F59E0B' : 'none'}
                      className={s <= review.rating ? 'text-amber-400' : 'text-brand-border dark:text-brand-border-dark'}
                    />
                  ))}
                </div>
                
                {/* Comment */}
                <p className="text-xs font-inter text-brand-text/75 dark:text-brand-text-dark/75 leading-relaxed line-clamp-3 mb-1 flex-1 italic">
                  "{review.comment}"
                </p>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
