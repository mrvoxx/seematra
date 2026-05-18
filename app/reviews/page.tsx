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
        subtitle="Real stories and experiences from our travelers"
        backgroundImage="https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136949/seematra/backgrounds/about.jpg"
        showCanvas={false}
      />
      <ReviewsClient />
    </div>
  );
}
