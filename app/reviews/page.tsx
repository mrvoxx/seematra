import type { Metadata } from 'next';
import UnifiedHero from '@/components/global/UnifiedHero';
import ReviewsClient from './ReviewsClient';

export const metadata: Metadata = {
  title: 'Traveler Reviews | Seematra',
  description: 'Read real reviews and trip photos from Seematra travelers who explored Uttarakhand with us. Verified experiences from every journey.',
};

export default function ReviewsPage() {
  return (
    <div className="w-full">
      <UnifiedHero
        title="Wanderers' Tales"
        eyebrow="Seematra"
        subtitle="Real stories from real travelers. Every review is verified."
        backgroundImage="/about.jpg"
        showCanvas={false}
      />
      <ReviewsClient />
    </div>
  );
}
