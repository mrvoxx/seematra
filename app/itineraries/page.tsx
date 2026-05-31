import { Metadata } from 'next';
import { Suspense } from 'react';
import ItineraryExplorer from './ItineraryExplorer';
import LoadingSpinner from '@/components/global/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Explore Itineraries | Seematra',
  description: 'Browse our curated catalog of Uttarakhand travel experiences across Adventure, Spiritual, Family, and Luxury genres.',
  alternates: { canonical: 'https://seematra.com/itineraries' },
};

export default function ItinerariesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] pt-32">
        <LoadingSpinner />
      </div>
    }>
      <ItineraryExplorer />
    </Suspense>
  );
}


