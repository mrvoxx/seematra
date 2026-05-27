import { Metadata } from 'next';
import Image from 'next/image';
import { IMapPin } from '@/types';
import MapClient from './MapClient';

import { connectDB } from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';

export const metadata: Metadata = {
  title: 'Interactive Travel Map | Seematra',
  description: 'Explore Uttarakhand destinations on our interactive travel map. See pins for all our adventure, spiritual, and luxury tour packages.',
};

export const revalidate = 3600; // SSG

export default async function MapPage() {
  await connectDB();
  const itineraries = await Itinerary.find({ active: true })
    .select('_id title thumbnail price mapCoords roadmap')
    .lean();

  const pins = itineraries
    .map((it: any) => {
      const coords = it.mapCoords
        ?? (it.roadmap?.length > 0
          ? it.roadmap[it.roadmap.length - 1].coords
          : null);

      if (!coords) return null;
      return {
        itineraryId: it._id.toString(),
        title: it.title,
        lat: coords.lat,
        lng: coords.lng,
        thumbnail: it.thumbnail,
        price: it.price,
      };
    })
    .filter(Boolean) as IMapPin[];

  return (
    <div className="w-full">
      {/* ─── Hero Section ─── */}
      <section className="relative h-[50vh] lg:h-screen w-full overflow-hidden flex items-center justify-center pt-16 isolate">
        <div className="absolute inset-0 z-[-2]">
          <Image src="/map.jpg" alt="Uttarakhand Map" fill className="object-cover" priority />
        </div>
        <div className="absolute inset-0 z-[-1] bg-black/50" />
        <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-transparent via-black/20 to-surface dark:to-surface-dark" />
        <div className="container relative z-10 mx-auto px-4 text-center mt-12">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-boldonse font-normal mb-4 text-white drop-shadow-sm">
            Explore <span className="text-primary">Uttarakhand</span>
          </h1>
          <p className="text-sm md:text-base font-inter text-white/85 max-w-2xl mx-auto drop-shadow-sm">
            Navigate through our curated destinations. Click on any pin to view the package details and pricing.
          </p>
          <div className="flex justify-center gap-4 sm:gap-6 mt-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10 shadow-xl">
              <span className="block text-xl sm:text-2xl font-boldonse text-primary">{itineraries.length}</span>
              <span className="text-xs sm:text-sm text-white/80 uppercase tracking-wider font-medium">Curated Trips</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10 shadow-xl hidden sm:block">
              <span className="block text-xl sm:text-2xl font-boldonse text-primary">100%</span>
              <span className="text-xs sm:text-sm text-white/80 uppercase tracking-wider font-medium">Local Experts</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10 shadow-xl hidden md:block">
              <span className="block text-xl sm:text-2xl font-boldonse text-primary">24/7</span>
              <span className="text-xs sm:text-sm text-white/80 uppercase tracking-wider font-medium">Support</span>
            </div>
          </div>
        </div>
      </section>
      {/* ─── Map ─── */}
      <div className="container mx-auto px-4 lg:px-8 py-12 animate-fade-up">
        <MapClient pins={pins} />
      </div>
    </div>
  );
}
