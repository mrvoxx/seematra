import { Metadata } from 'next';
import Image from 'next/image';
import { api } from '@/lib/services/api';
import { IMapPin } from '@/types';
import MapClient from './MapClient';

export const metadata: Metadata = {
  title: 'Interactive Travel Map | Seematra',
  description: 'Explore Uttarakhand destinations on our interactive travel map. See pins for all our adventure, spiritual, and luxury tour packages.',
};

export const revalidate = 3600; // SSG

export default async function MapPage() {
  const pins = await api.get('/map/pins').catch(() => []) as IMapPin[];

  return (
    <div className="w-full">
      {/* ─── Hero Section ─── */}
      <section className="relative h-[50vh] lg:h-screen w-full overflow-hidden flex items-center justify-center pt-16 isolate">
        <div className="absolute inset-0 z-[-2]">
          <Image src="/map.jpg" alt="Uttarakhand Map" fill className="object-cover" priority />
        </div>
        <div className="absolute inset-0 z-[-1] bg-black/50" />
        <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-transparent via-black/20 to-surface dark:to-surface-dark" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-outfit font-extrabold mb-4 text-white drop-shadow-sm">
            Explore <span className="text-primary">Uttarakhand</span>
          </h1>
          <p className="text-base md:text-lg font-inter text-white/85 max-w-2xl mx-auto drop-shadow-sm">
            Navigate through our curated destinations. Click on any pin to view the package details and pricing.
          </p>
        </div>
      </section>

      {/* ─── Map ─── */}
      <div className="container mx-auto px-4 lg:px-8 py-12 animate-fade-up">
        <MapClient pins={pins} />
      </div>
    </div>
  );
}
