'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IItinerary } from '@/types';
import { Clock, MapPin, Navigation } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { motion, Variants } from 'framer-motion';

interface Props {
  itinerary: IItinerary;
  priority?: boolean;
  index?: number;
}

// Shared fade-up variant used by all cards
export const cardVariant: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ItineraryCard({ itinerary, priority = false, index = 0 }: Props) {
  return (
    <motion.div
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      custom={index}
      viewport={{ once: true, margin: '-60px' }}
      className="card group flex flex-col h-full overflow-hidden relative"
    >
      {/* Thumbnail Container */}
      <div className="relative h-56 lg:h-72 w-full shrink-0 overflow-hidden">
        <FavoriteButton itemId={itinerary._id as string} itemType="itinerary" />
        {itinerary.isRecommended && (
          <div className="absolute bottom-3 left-3 lg:bottom-4 lg:left-4 z-20 flex items-center gap-1.5 bg-accent/90 dark:bg-accent-dark/90 backdrop-blur-md text-white font-bold font-outfit text-[8px] lg:text-[10px] uppercase tracking-wider px-2 py-1 lg:px-3 lg:py-1.5 rounded-full shadow-xl border border-white/20 animate-pulse-subtle max-w-[45%] truncate">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping shrink-0" />
            <span className="truncate">Recommended</span>
          </div>
        )}

        {/* Discount Badge */}
        {itinerary.hasDiscount && (
          <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 z-20 bg-red-500/95 backdrop-blur-md text-white font-bold font-outfit text-[8px] lg:text-[10px] uppercase tracking-wider px-1.5 py-1 lg:px-3 lg:py-1.5 rounded-md shadow-lg transform -rotate-2 animate-pulse-subtle flex flex-col items-center border border-red-400 max-w-[50%]">
            <span className="flex items-center gap-0.5 lg:gap-1"><span className="text-yellow-300 text-[10px] lg:text-xs">🔥</span> 25% OFF</span>
            <span className="text-[6px] lg:text-[8px] font-medium opacity-90 tracking-widest mt-0.5 border-t border-white/20 pt-0.5 w-full text-center truncate">Limited Time</span>
          </div>
        )}
        <div className="absolute top-3 right-3 lg:top-4 lg:right-4 z-10 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-sm text-primary font-bold font-outfit text-xs lg:text-sm px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Clock size={12} className="lg:hidden" />
          <Clock size={14} className="hidden lg:block" />
          {itinerary.duration}
        </div>
        <Image
          src={itinerary.thumbnail}
          alt={itinerary.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={60}
          priority={priority}
          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-3 overflow-hidden h-6 md:h-auto">
          {(itinerary.genres ?? []).slice(0, 1).map((genre) => (
            <span key={genre} className="badge-primary whitespace-nowrap text-[10px] lg:text-xs px-2 py-0.5 lg:px-3 lg:py-1">
              {genre}
            </span>
          ))}
          {(itinerary.tags ?? []).slice(0, 2).map((tag) => (
            <span key={tag} className="badge-secondary flex items-center gap-1 whitespace-nowrap text-[10px] lg:text-xs px-2 py-0.5 lg:px-3 lg:py-1">
              <MapPin size={10} /> {tag}
            </span>
          ))}
        </div>

        <h3 className="text-sm lg:text-base font-outfit font-medium mb-2 text-brand-text dark:text-brand-text-dark group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] lg:min-h-[3rem]">
          {itinerary.title}
        </h3>

        <p className="text-xs lg:text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70 mb-4 lg:mb-6 line-clamp-2 flex-1">
          {itinerary.description.replace(/<[^>]*>?/gm, '')}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 lg:pt-4 border-t border-brand-border dark:border-brand-border-dark">
          <div className="flex flex-col">
            <span className="text-[10px] lg:text-xs font-inter text-brand-text/70 dark:text-brand-text-dark/70 uppercase tracking-wide">Starting from</span>
            <div className="flex items-baseline flex-wrap gap-x-1.5 lg:gap-x-2">
              <span className="text-lg lg:text-2xl font-outfit font-medium text-primary">
                ₹{itinerary.price.toLocaleString('en-IN')}
              </span>
              {itinerary.hasDiscount && (
                <div className="relative inline-block text-[10px] lg:text-xs font-inter text-brand-text/40 dark:text-brand-text-dark/40 font-medium group-hover:text-brand-text/60 transition-colors mt-0.5">
                  ₹{Math.ceil(itinerary.price * 1.33).toLocaleString('en-IN')}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="absolute -left-[5%] top-1/2 w-[110%] h-[1.5px] bg-red-500 origin-left -translate-y-1/2 rotate-[-6deg]"
                  />
                </div>
              )}
            </div>
          </div>
          <Link
            href={`/itineraries/${itinerary._id}`}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-surface transition-all transform group-hover:scale-110 before:absolute before:inset-0 before:z-10"
            aria-label="View Details"
          >
            <Navigation size={20} className="ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
