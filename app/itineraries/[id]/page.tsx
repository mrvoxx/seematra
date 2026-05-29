import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import { IItinerary } from '@/types';
import { itineraryJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import ItineraryDetailClient from './ItineraryDetailClient';

export const revalidate = 3600; // ISR

type Props = {
  params: Promise<{ id: string }>
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  await connectDB();
  const data = await Itinerary.findById(params.id).lean() as any;
  if (!data) return { title: 'Not Found | Seematra' };
  
  return {
    title: `${data.title} – Best Uttarakhand Tour Packages | Seematra`,
    description: data.description.substring(0, 160).replace(/<[^>]*>?/gm, ''),
    openGraph: {
      images: [data.thumbnail],
    }
  };
}

export default async function ItineraryPage(props: Props) {
  const params = await props.params;
  await connectDB();
  const rawItinerary = await Itinerary.findById(params.id).lean() as any;
  
  if (!rawItinerary) {
    notFound();
  }

  // Sanitize mongoose document for Client Component
  const itinerary = {
    ...rawItinerary,
    _id: rawItinerary._id.toString(),
    createdAt: rawItinerary.createdAt?.toISOString(),
    updatedAt: rawItinerary.updatedAt?.toISOString(),
  } as IItinerary;

  // Generate SEO json-ld
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';
  const pageUrl = `${BASE_URL}/itineraries/${itinerary._id}`;
  const jsonLdTrip = itineraryJsonLd(itinerary, pageUrl);
  const jsonLdBreadcrumb = breadcrumbJsonLd([
    { name: 'Home', url: BASE_URL },
    { name: 'Itineraries', url: `${BASE_URL}/itineraries` },
    { name: itinerary.title, url: pageUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdTrip) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <ItineraryDetailClient itinerary={itinerary} />
    </>
  );
}
