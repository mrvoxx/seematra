import { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import PseoPage from '@/models/PseoPage';
import { IBlog } from '@/types';
import BlogExplorer from './BlogExplorer';
import UnifiedHero from '@/components/global/UnifiedHero';

export const metadata: Metadata = {
  title: 'Travel Guides & Stories | Seematra',
  description: 'Read our expert travel guides, itineraries, and stories about exploring Uttarakhand safely and beautifully.',
};

export const revalidate = 1800; // ISR 30 mins

// Page-type to thumbnail gradient mapping for pSEO cards
const PSEO_THUMBNAILS: Record<string, string> = {
  circuit_hub: 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136948/seematra/backgrounds/blog.jpg',
  destination_guide: 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136948/seematra/backgrounds/blog.jpg',
  intent: 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136948/seematra/backgrounds/blog.jpg',
  comparison: 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136948/seematra/backgrounds/blog.jpg',
  seasonal: 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136948/seematra/backgrounds/blog.jpg',
  faq_hub: 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136948/seematra/backgrounds/blog.jpg',
  nearby_places: 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136948/seematra/backgrounds/blog.jpg',
};

// Map pSEO page_type to user-friendly labels
const TYPE_LABELS: Record<string, string> = {
  circuit_hub: 'Circuit Guide',
  destination_guide: 'Destination Guide',
  intent: 'Travel Guide',
  comparison: 'Comparison',
  seasonal: 'Seasonal Guide',
  faq_hub: 'FAQ Hub',
  nearby_places: 'Nearby Places',
};

function pseoToBlog(p: any): IBlog {
  const overview = typeof p.content?.overview === 'string'
    ? p.content.overview
    : p.seo?.meta_description || p.title;

  return {
    _id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    content: overview,
    thumbnail: PSEO_THUMBNAILS[p.page_type] || PSEO_THUMBNAILS.intent,
    tags: [
      TYPE_LABELS[p.page_type] || 'Travel Guide',
      ...(p.entity_tags?.slice(0, 2).map((e: any) => e.name) || []),
    ],
    author: 'Seematra Team',
    isRecommended: p.page_type === 'circuit_hub' || p.page_type === 'destination_guide',
    publishedAt: p.generated_at?.toISOString?.() || p.generated_at || new Date().toISOString(),
    createdAt: p.generated_at?.toISOString?.() || p.generated_at || new Date().toISOString(),
    // pSEO integration fields
    source: 'pseo',
    href: `/explore/${p.slug}`,
    pageType: p.page_type,
    circuit: p.circuit,
  };
}

export default async function BlogsPage() {
  await connectDB();

  // Fetch regular blogs
  const rawBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(20).lean() as any[];
  const blogs: IBlog[] = rawBlogs.map((b: any) => ({
    ...b,
    _id: b._id.toString(),
    createdAt: b.createdAt?.toISOString(),
    publishedAt: b.publishedAt?.toISOString(),
    source: 'blog' as const,
  }));

  // Fetch pSEO pages (published only, limited for the listing)
  const rawPseo = await PseoPage.find({ status: 'published' })
    .sort({ generated_at: -1 })
    .limit(50)
    .select('title slug page_type circuit seo content.overview entity_tags generated_at')
    .lean() as any[];
  const pseoBlogs: IBlog[] = rawPseo.map(pseoToBlog);

  // Merge and sort by date (newest first)
  const allContent = [...blogs, ...pseoBlogs].sort(
    (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
  );

  return (
    <div className="w-full">
      <UnifiedHero 
        title="Travel Guides & Stories"
        subtitle="Read stories, tips, and insights from our community."
        backgroundImage="https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136948/seematra/backgrounds/blog.jpg"
        showCanvas={true}
      />

      {/* ─── Blog Explorer Grid ─── */}
      <BlogExplorer initialBlogs={allContent} />
    </div>
  );
}
