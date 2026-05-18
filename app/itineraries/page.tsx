import { Metadata } from 'next';
import ItineraryExplorer from './ItineraryExplorer';

export const metadata: Metadata = {
  title: 'Explore Itineraries | Seematra',
  description: 'Browse our curated catalog of Uttarakhand travel experiences across Adventure, Spiritual, Family, and Luxury genres.',
};

export default function ItinerariesPage() {
  return <ItineraryExplorer />;
}
