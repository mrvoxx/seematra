import { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { IBlog } from '@/types';
import BlogExplorer from './BlogExplorer';
import UnifiedHero from '@/components/global/UnifiedHero';

export const metadata: Metadata = {
  title: 'Travel Guides & Stories | Seematra',
  description: 'Read our expert travel guides, itineraries, and stories about exploring Uttarakhand safely and beautifully.',
};

export const revalidate = 1800; // ISR 30 mins

export default async function BlogsPage() {
  await connectDB();
  const rawBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(20).lean() as any[];
  const blogs = rawBlogs.map((b: any) => ({
    ...b,
    _id: b._id.toString(),
    createdAt: b.createdAt?.toISOString(),
    publishedAt: b.publishedAt?.toISOString()
  })) as IBlog[];

  return (
    <div className="w-full">
      <UnifiedHero 
        title="Travel Guides & Stories"
        subtitle="Read stories, tips, and insights from our community."
        backgroundImage="https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136948/seematra/backgrounds/blog.jpg"
        showCanvas={true}
      />

      {/* ─── Blog Explorer Grid ─── */}
      <BlogExplorer initialBlogs={blogs} />
    </div>
  );
}
