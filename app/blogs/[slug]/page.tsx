import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Itinerary from '@/models/Itinerary';
import { IBlog, IItinerary } from '@/types';
import { blogJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import { Calendar, User, BookOpen, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import TravelRoadmap from '@/components/global/TravelRoadmap';
import Link from 'next/link';
import SocialVideoEmbed from '@/components/global/SocialVideoEmbed';
import SidebarRecommendations from '@/components/global/SidebarRecommendations';
import BlogContent from '@/components/blog/BlogContent';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  await connectDB();
  const data = await Blog.findOne({ slug: params.slug }).lean() as any;
  if (!data) return { title: 'Not Found | Seematra' };

  const description = (data.content || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  return {
    title: `${data.title} – Seematra Uttarakhand Travel Guides`,
    description,
    keywords: ['Uttarakhand travel', 'Uttarakhand itinerary', ...(data.tags ?? []), 'Seematra', 'Himalayan journey'],
    openGraph: {
      title: data.title,
      description,
      images: [{ url: data.thumbnail, width: 1200, height: 630, alt: data.title }],
      type: 'article',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description,
      images: [data.thumbnail],
    },
  };
}

export default async function BlogDetailPage(props: Props) {
  const params = await props.params;
  await connectDB();

  const rawBlog = await Blog.findOne({ slug: params.slug }).lean() as any;
  if (!rawBlog) notFound();

  // Fetch linked itinerary if present
  let linkedItinerary: IItinerary | null = null;
  if (rawBlog.relatedItinerary) {
    const rawIt = await Itinerary.findById(rawBlog.relatedItinerary).lean() as any;
    if (rawIt) {
      linkedItinerary = {
        ...rawIt,
        _id: rawIt._id.toString(),
        createdAt: rawIt.createdAt?.toISOString(),
        updatedAt: rawIt.updatedAt?.toISOString(),
        roadmap: (rawIt.roadmap ?? []).map((r: any) => ({ ...r })),
        tags: rawIt.tags ?? [],
        genres: rawIt.genres ?? [],
        vehicles: rawIt.vehicles ?? [],
      } as IItinerary;
    }
  }

  const blog = {
    ...rawBlog,
    _id: rawBlog._id.toString(),
    createdAt: rawBlog.createdAt?.toISOString(),
    publishedAt: rawBlog.publishedAt?.toISOString() ?? rawBlog.createdAt?.toISOString(),
    tags: rawBlog.tags ?? [],
  } as IBlog;

  const jsonLdArticle = blogJsonLd(blog, `${process.env.NEXT_PUBLIC_APP_URL}/blogs/${blog.slug}`);
  const jsonLdBreadcrumb = breadcrumbJsonLd([
    { name: 'Home', url: process.env.NEXT_PUBLIC_APP_URL ?? '/' },
    { name: 'Blogs & Guides', url: `${process.env.NEXT_PUBLIC_APP_URL}/blogs` },
    { name: blog.title, url: `${process.env.NEXT_PUBLIC_APP_URL}/blogs/${blog.slug}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      {/* ─── Hero Image ─── */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-surface dark:to-surface-dark" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pb-8">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {blog.tags.map(tag => (
              <span key={tag} className="badge-primary backdrop-blur-sm">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-outfit font-extrabold text-white drop-shadow-lg max-w-5xl leading-tight">
            {blog.title}
          </h1>
          <div className="flex items-center gap-6 mt-4 text-white/80 text-sm font-inter">
            <span className="flex items-center gap-1.5"><User size={14} /> {blog.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              <time dateTime={blog.publishedAt}>{format(new Date(blog.publishedAt), 'MMMM d, yyyy')}</time>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Floating Book Now (fixed, right side) ─── */}
      {linkedItinerary && (
        <div className="fixed right-4 md:right-8 bottom-8 z-50 flex flex-col items-end gap-3">
          <div className="hidden md:flex flex-col items-end gap-1 bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark shadow-xl rounded-2xl p-4 max-w-[220px]">
            {linkedItinerary.thumbnail && (
              <img src={linkedItinerary.thumbnail} alt={linkedItinerary.title} className="w-full h-24 object-cover rounded-xl mb-2" />
            )}
            <p className="text-xs font-outfit font-bold text-brand-text dark:text-brand-text-dark line-clamp-2 text-right">{linkedItinerary.title}</p>
            <p className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 text-right">
              {linkedItinerary.duration} · <span className="text-primary font-bold">₹{linkedItinerary.price?.toLocaleString('en-IN')}</span>
            </p>
          </div>
          <Link
            href={`/itineraries/${linkedItinerary._id}`}
            className="flex items-center gap-2 bg-primary text-surface px-6 py-3.5 rounded-full font-outfit font-bold shadow-xl shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all duration-200 text-sm"
          >
            <BookOpen size={16} />
            Book Now
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/*
        SHARED LAYOUT SHELL
        clamp(16px, 5vw, 80px) → 92-95% width on mobile, 75-85% on large desktop
        All inner sections share this same horizontal rhythm.
      */}
      <div
        className="w-full py-12 md:py-16"
        style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}
      >
        {/* ─── 2-column: Article + Sidebar ─── */}
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">

          {/* LEFT: Main article */}
          <article className="flex-1 min-w-0">

            {blog.content && (
              <BlogContent
                html={blog.content}
                className="blog-article-content w-full text-brand-text/85 dark:text-brand-text-dark/85 font-inter text-base md:text-[1.05rem] leading-[1.85]"
              />
            )}

            {blog.sections && blog.sections.length > 0 && (
              <div className="mt-14 space-y-16">
                {blog.sections.map((section, idx) => (
                  <section key={idx} className="space-y-6">
                    {section.header && (
                      <h2 className="text-2xl md:text-3xl font-outfit font-bold text-brand-text dark:text-brand-text-dark border-b-2 border-primary/20 pb-2">
                        {section.header}
                      </h2>
                    )}
                    {section.image && (
                      <img
                        src={section.image}
                        alt={section.header || `Section ${idx + 1}`}
                        className="w-full rounded-2xl object-cover max-h-[560px]"
                      />
                    )}
                    {section.paragraph && (
                      <p className="font-inter text-brand-text/80 dark:text-brand-text-dark/80 leading-[1.85] text-base md:text-lg whitespace-pre-wrap">
                        {section.paragraph}
                      </p>
                    )}
                  </section>
                ))}
              </div>
            )}

            {blog.faqs && blog.faqs.length > 0 && (
              <div className="mt-16 border-t-2 border-brand-border dark:border-brand-border-dark pt-12">
                <h2 className="text-2xl md:text-3xl font-outfit font-bold text-brand-text dark:text-brand-text-dark mb-8">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {blog.faqs.map((faq, idx) => (
                    <details key={idx} className="group bg-surface/50 dark:bg-surface-dark/50 border border-brand-border dark:border-brand-border-dark rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between p-5 cursor-pointer font-outfit font-bold text-base md:text-lg text-brand-text dark:text-brand-text-dark select-none">
                        {faq.question}
                        <span className="text-primary transform group-open:rotate-180 transition-transform duration-300 shrink-0 ml-3">▼</span>
                      </summary>
                      <div className="px-5 pb-5 text-brand-text/80 dark:text-brand-text-dark/80 font-inter leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

          </article>

          {/* RIGHT: Sticky Sidebar */}
          <aside className="w-full lg:w-[300px] xl:w-[340px] 2xl:w-[380px] shrink-0">
            <div className="sticky top-28 space-y-10">
              {blog.videoUrl && (
                <div className="animate-fade-left">
                  <h3 className="font-outfit font-bold text-xl mb-4 border-l-4 border-primary pl-3">Watch Experience</h3>
                  <SocialVideoEmbed url={blog.videoUrl} />
                </div>
              )}
              <SidebarRecommendations currentBlogId={blog._id} />
            </div>
          </aside>

        </div>

        {/* Roadmap — same shell, below 2-col */}
        {linkedItinerary && linkedItinerary.roadmap.length > 0 && (
          <div className="mt-16 border-t-2 border-brand-border dark:border-brand-border-dark pt-12">
            <TravelRoadmap
              roadmap={linkedItinerary.roadmap}
              itineraryTitle={linkedItinerary.title}
            />
            <div className="text-center mt-16">
              <p className="text-brand-text/60 dark:text-brand-text-dark/60 font-inter mb-4">Ready to experience this journey?</p>
              <Link
                href={`/itineraries/${linkedItinerary._id}`}
                className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-3"
              >
                <BookOpen size={20} />
                Book This Itinerary · ₹{linkedItinerary.price?.toLocaleString('en-IN')}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
