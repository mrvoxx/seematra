// lib/jsonld.ts
import type { IItinerary, IBlog } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

export function itineraryJsonLd(itinerary: IItinerary, url: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TouristTrip',
        name: itinerary.title,
        description: itinerary.description?.replace(/<[^>]*>/g, '').slice(0, 200),
        touristType: itinerary.genres?.join(', '),
        url,
        offers: {
          '@type': 'Offer',
          price: itinerary.price,
          priceCurrency: 'INR',
        },
        itinerary: {
          '@type': 'ItemList',
          itemListElement: itinerary.roadmap?.map((point, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `Day ${point.day}: ${point.locationName}`,
          })) ?? [],
        },
      },
      breadcrumbJsonLd([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Itineraries', url: `${BASE_URL}/itineraries` },
        { name: itinerary.title, url },
      ]),
    ],
  };
}

export function blogJsonLd(blog: IBlog, url: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: blog.title,
        description: typeof blog.content === 'string'
          ? blog.content.replace(/<[^>]*>/g, '').slice(0, 200)
          : '',
        image: blog.thumbnail,
        datePublished: blog.publishedAt,
        author: { '@type': 'Person', name: blog.author },
        url,
      },
      breadcrumbJsonLd([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Blogs', url: `${BASE_URL}/blogs` },
        { name: blog.title, url },
      ]),
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

