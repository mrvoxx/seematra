import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import { IItinerary } from '@/types';
import { generatePageMetadata } from '@/lib/seo';
import {
  generateTouristTripSchema,
  generateBreadcrumbSchema,
} from '@/lib/jsonld';
import ItineraryDetailClient from './ItineraryDetailClient';
import ItineraryCard from '@/components/global/ItineraryCard';
import Breadcrumb from '@/components/global/Breadcrumb';
import Link from 'next/link';

export const revalidate = 3600; // ISR

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  await connectDB();
  const data = await Itinerary.findById(params.id).lean() as any;
  
  if (!data) return { title: 'Not Found | Seematra' };
  
  return generatePageMetadata({
    title: `${data.title} – Best Tour Packages`,
    description: data.description?.replace(/<[^>]*>?/gm, '').substring(0, 155) || `Explore ${data.title} with Seematra.`,
    slug: `/itineraries/${data._id.toString()}`,
    image: data.thumbnail,
    keywords: data.tags || [],
  });
}

export default async function ItineraryPage(props: Props) {
  const params = await props.params;
  await connectDB();
  const rawItinerary = await Itinerary.findById(params.id).lean() as any;
  
  if (!rawItinerary) {
    notFound();
  }

  // Fetch Related Packages (same genre, exclude current)
  const relatedItineraries = await Itinerary.find({
    _id: { $ne: rawItinerary._id },
    genres: { $in: rawItinerary.genres || [] },
    active: true,
  })
    .limit(3)
    .lean() as any[];

  // Sanitize mongoose documents
  const itinerary = {
    ...rawItinerary,
    _id: rawItinerary._id.toString(),
    createdAt: rawItinerary.createdAt?.toISOString(),
    updatedAt: rawItinerary.updatedAt?.toISOString(),
  } as IItinerary;

  const related = relatedItineraries.map(it => ({
    ...it,
    _id: it._id.toString(),
    createdAt: it.createdAt?.toISOString(),
    updatedAt: it.updatedAt?.toISOString(),
  })) as IItinerary[];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Packages', href: '/itineraries' },
    { label: itinerary.title, href: `/itineraries/${itinerary._id}` },
  ];

  const jsonLdTrip = generateTouristTripSchema(itinerary);
  const jsonLdBreadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Packages', url: '/itineraries' },
    { name: itinerary.title, url: `/itineraries/${itinerary._id}` },
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
      
      <div className="container mx-auto px-4 lg:px-8 mt-2">
        <Breadcrumb crumbs={breadcrumbs} />
      </div>

      <ItineraryDetailClient itinerary={itinerary} />

      {related.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 pb-20 pt-10">
          <h2 className="text-3xl font-outfit font-bold mb-8 border-l-4 border-primary pl-4">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {related.map((it) => (
              <ItineraryCard key={it._id} itinerary={it} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
