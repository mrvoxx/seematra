import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';
const DEFAULT_IMAGE = 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136945/seematra/backgrounds/uttrakhand.jpg';

export interface SEOConfig {
  title: string;
  description: string;
  slug: string; // e.g. "/itineraries/kedarnath-tour"
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article';
}

function buildMetadata(config: SEOConfig): Metadata {
  const url = `${BASE_URL}${config.slug}`;
  const image = config.image || DEFAULT_IMAGE;
  const pageTitle = `${config.title} | Seematra`;

  return {
    title: pageTitle,
    description: config.description,
    keywords: config.keywords || [],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: pageTitle,
      description: config.description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      type: config.type || 'website',
      siteName: 'Seematra',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: config.description,
      images: [image],
      creator: '@seematra',
    },
  };
}

export function generatePageMetadata(config: Omit<SEOConfig, 'type'>): Metadata {
  return buildMetadata({ ...config, type: 'website' });
}

export function generateArticleMetadata(config: Omit<SEOConfig, 'type'>): Metadata {
  return buildMetadata({ ...config, type: 'article' });
}
