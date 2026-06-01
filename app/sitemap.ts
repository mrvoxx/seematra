import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import Blog from '@/models/Blog';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const [itineraries, blogs] = await Promise.all([
    Itinerary.find({ active: true }).select('_id updatedAt createdAt').lean(),
    Blog.find({}).select('slug publishedAt createdAt').lean(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/itineraries`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/blogs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/reviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const itineraryPages: MetadataRoute.Sitemap = itineraries.map((it: any) => ({
    url: `${BASE}/itineraries/${it._id.toString()}`,
    lastModified: it.updatedAt ?? it.createdAt ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = blogs.map((b: any) => ({
    url: `${BASE}/blogs/${b.slug}`,
    lastModified: b.publishedAt ?? b.createdAt ?? new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...itineraryPages, ...blogPages];
}
