import type { IItinerary, IBlog } from '@/types';
import { stripHtml } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Seematra',
    url: BASE_URL,
    logo: 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1780223863/seematra/brand/logo.png',
    description: 'Premium Uttarakhand tour packages and travel itineraries by local Himalayan experts.',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Uttarakhand',
      addressCountry: 'IN',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Uttarakhand, India',
    },
    sameAs: [
      'https://www.facebook.com/seematra',
      'https://www.instagram.com/seematra6?igsh=MTB4eGJlYTU5N2RkeA==',
      'https://www.youtube.com/@seematratravel',
    ],
  };
}

export function generateTouristTripSchema(itinerary: IItinerary) {
  const url = `${BASE_URL}/itineraries/${itinerary._id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: itinerary.title,
    description: stripHtml(itinerary.description || '').slice(0, 250),
    touristType: itinerary.genres?.join(', '),
    url,
    provider: {
      '@type': 'TravelAgency',
      name: 'Seematra',
    },
    duration: itinerary.duration || 'P1D',
    offers: {
      '@type': 'Offer',
      price: itinerary.price || 0,
      priceCurrency: 'INR',
    },
    itinerary: {
      '@type': 'ItemList',
      itemListElement: itinerary.roadmap?.map((point, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `Day ${point.day}: ${point.locationName}`,
        description: point.overview ? stripHtml(point.overview).slice(0, 200) : undefined,
      })) ?? [],
    },
  };
}

export function generateArticleSchema(post: IBlog) {
  const url = `${BASE_URL}/blogs/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: stripHtml(post.content || '').slice(0, 250),
    image: post.thumbnail,
    datePublished: post.publishedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author || 'Seematra',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Seematra',
      logo: {
        '@type': 'ImageObject',
        url: 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1780223863/seematra/brand/logo.png',
      },
    },
    url,
  };
}

export function generateBreadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(faq.answer),
      },
    })),
  };
}
