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
      <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden">
        <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover scale-105" />
        {/* Dark gradient — heavier at bottom so white title is always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        {/* Title block at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 md:px-14 pb-8 md:pb-12">
          <div className="flex flex-wrap gap-2 mb-3">
            {blog.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md bg-white/15 border border-white/20 text-white">{tag}</span>
            ))}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-outfit font-extrabold text-white leading-tight max-w-4xl" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}>
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-white/70 text-xs font-inter">
            <span className="flex items-center gap-1.5"><User size={12} /> {blog.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              <time dateTime={blog.publishedAt}>{format(new Date(blog.publishedAt), 'MMMM d, yyyy')}</time>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Floating Book Now — desktop only, fixed bottom-right ─── */}
      {linkedItinerary && (
        <>
          {/* Desktop sticky card */}
          <div className="hidden lg:flex fixed right-6 bottom-8 z-50 flex-col items-end gap-2">
            <div className="flex flex-col bg-white dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark shadow-2xl rounded-2xl overflow-hidden w-[200px]">
              {linkedItinerary.thumbnail && (
                <img src={linkedItinerary.thumbnail} alt={linkedItinerary.title} className="w-full h-24 object-cover" />
              )}
              <div className="p-3">
                <p className="text-xs font-outfit font-bold text-brand-text dark:text-brand-text-dark line-clamp-2 mb-1">{linkedItinerary.title}</p>
                <p className="text-[11px] text-brand-text/50 dark:text-brand-text-dark/50">
                  {linkedItinerary.duration} · <span className="text-primary font-bold">₹{linkedItinerary.price?.toLocaleString('en-IN')}</span>
                </p>
              </div>
            </div>
            <Link
              href={`/itineraries/${linkedItinerary._id}`}
              className="flex items-center gap-2 bg-primary text-white font-outfit font-bold text-sm px-5 py-3 rounded-xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105 active:scale-95 transition-all duration-200 w-full justify-center"
            >
              <BookOpen size={15} /> Book This Trip <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile sticky bottom bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-brand-card-dark border-t border-brand-border dark:border-brand-border-dark px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-outfit font-bold text-brand-text dark:text-brand-text-dark line-clamp-1">{linkedItinerary.title}</p>
              <p className="text-[11px] text-brand-text/50">{linkedItinerary.duration} · <span className="text-primary font-bold">₹{linkedItinerary.price?.toLocaleString('en-IN')}</span></p>
            </div>
            <Link
              href={`/itineraries/${linkedItinerary._id}`}
              className="shrink-0 flex items-center gap-1.5 bg-primary text-white font-outfit font-bold text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
            >
              <BookOpen size={13} /> Book Now
            </Link>
          </div>
        </>
      )}

      {/*
        SHARED LAYOUT SHELL
        clamp(16px, 5vw, 80px) → 92-95% width on mobile, 75-85% on large desktop
        All inner sections share this same horizontal rhythm.
      */}
      {/* Add bottom padding on mobile to clear the sticky CTA bar */}
      <div className="w-full py-10 md:py-16 px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-28 pb-24 lg:pb-16">
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
