import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Itinerary from '@/models/Itinerary';
import { IBlog, IItinerary } from '@/types';
import { blogJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import { Calendar, User, BookOpen, ArrowRight, Clock, ChevronRight } from 'lucide-react';
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

  const jsonLdArticle   = blogJsonLd(blog, `${process.env.NEXT_PUBLIC_APP_URL}/blogs/${blog.slug}`);
  const jsonLdBreadcrumb = breadcrumbJsonLd([
    { name: 'Home',           url: process.env.NEXT_PUBLIC_APP_URL ?? '/' },
    { name: 'Blogs & Guides', url: `${process.env.NEXT_PUBLIC_APP_URL}/blogs` },
    { name: blog.title,       url: `${process.env.NEXT_PUBLIC_APP_URL}/blogs/${blog.slug}` },
  ]);

  return (
    <>
      {/* ── Structured Data ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      {/* ══════════════════════════════════════════════════════════════
          CINEMATIC HERO — full viewport width, tall, dark-bottom
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        {/* Background photo */}
        <img
          src={blog.thumbnail}
          alt={blog.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Four-stop gradient: barely dark top → open mid → dark bottom */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.2) 100%)' }}
        />

        {/* ── Breadcrumb trail (top-left) ── */}
        <div className="absolute top-5 left-4 sm:left-8 md:left-14 flex items-center gap-1.5 text-white/60 text-xs font-inter">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/blogs" className="hover:text-white transition-colors">Guides</Link>
          <ChevronRight size={12} />
          <span className="text-white/40 line-clamp-1 max-w-[160px]">{blog.title}</span>
        </div>

        {/* ── Title block — pinned to hero bottom ── */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 md:px-14 pb-10 md:pb-14">
          {/* Tag pills */}
          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map(tag => (
                <span key={tag}
                  className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Main title — always white with shadow */}
          <h1
            className="text-2xl sm:text-3xl md:text-[2.6rem] lg:text-5xl font-outfit font-extrabold text-white leading-[1.15] max-w-4xl"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}
          >
            {blog.title}
          </h1>

          {/* Author / date row */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-white/65 text-xs font-inter">
            <span className="flex items-center gap-1.5">
              <User size={12} />
              {blog.author}
            </span>
            <span className="w-px h-3 bg-white/30 hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              <time dateTime={blog.publishedAt}>
                {format(new Date(blog.publishedAt), 'MMMM d, yyyy')}
              </time>
            </span>
            {linkedItinerary && (
              <>
                <span className="w-px h-3 bg-white/30 hidden sm:block" />
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {linkedItinerary.duration}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE STICKY CTA BAR (when linked itinerary exists)
      ══════════════════════════════════════════════════════════════ */}
      {linkedItinerary && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center gap-3 px-4 py-3
          bg-white/95 dark:bg-brand-card-dark/95 backdrop-blur-md
          border-t border-brand-border dark:border-brand-border-dark
          shadow-[0_-6px_30px_rgba(0,0,0,0.14)]">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-outfit font-bold text-brand-text dark:text-brand-text-dark line-clamp-1">
              {linkedItinerary.title}
            </p>
            <p className="text-[11px] text-brand-text/50 dark:text-brand-text-dark/50">
              {linkedItinerary.duration}
              {' · '}
              <span className="font-bold text-primary">₹{linkedItinerary.price?.toLocaleString('en-IN')}</span>
            </p>
          </div>
          <Link
            href={`/itineraries/${linkedItinerary._id}`}
            style={{ backgroundColor: 'var(--color-primary-dyn)', color: '#fff' }}
            className="shrink-0 flex items-center gap-1.5 text-xs font-outfit font-bold px-4 py-2.5 rounded-xl shadow-lg hover:opacity-90 transition-all"
          >
            <BookOpen size={13} /> Book Now
          </Link>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          DESKTOP FLOATING BOOK-NOW CARD
          Removed: Overlapped the sidebar on smaller screens. 
          The sidebar already contains a CTA banner.
      ══════════════════════════════════════════════════════════════ */}

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          • px scales: 16px mobile → 56px desktop → 80px 2xl
          • pb-24 lg:pb-12 clears the mobile sticky CTA
      ══════════════════════════════════════════════════════════════ */}
      <div className="w-full px-4 sm:px-8 md:px-10 lg:px-14 xl:px-20 2xl:px-24 pt-10 pb-28 lg:pb-16">

        {/* ── 2-column grid: 70% article + 30% sidebar ── */}
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">

          {/* ════════ LEFT COLUMN — ARTICLE ════════ */}
          <article className="flex-1 min-w-0">

            {/* HTML blog content */}
            {blog.content && (
              <BlogContent
                html={blog.content}
                className="blog-article-content w-full font-inter text-[0.975rem] md:text-base leading-[1.9] text-brand-text/85 dark:text-brand-text-dark/85"
              />
            )}

            {/* Legacy section blocks */}
            {blog.sections && blog.sections.length > 0 && (
              <div className="mt-14 space-y-14">
                {blog.sections.map((section, idx) => (
                  <section key={idx} className="space-y-5">
                    {section.header && (
                      <h2 className="text-xl md:text-2xl font-outfit font-bold text-brand-text dark:text-brand-text-dark pb-2 border-b border-brand-border dark:border-brand-border-dark">
                        {section.header}
                      </h2>
                    )}
                    {section.image && (
                      <img
                        src={section.image}
                        alt={section.header || `Section ${idx + 1}`}
                        className="w-full rounded-2xl object-cover max-h-[500px]"
                      />
                    )}
                    {section.paragraph && (
                      <p className="font-inter text-brand-text/80 dark:text-brand-text-dark/80 leading-[1.9] text-base whitespace-pre-wrap">
                        {section.paragraph}
                      </p>
                    )}
                  </section>
                ))}
              </div>
            )}

            {/* FAQ accordion */}
            {blog.faqs && blog.faqs.length > 0 && (
              <div className="mt-16 pt-12 border-t border-brand-border dark:border-brand-border-dark">
                <h2 className="text-xl md:text-2xl font-outfit font-bold text-brand-text dark:text-brand-text-dark mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-2.5">
                  {blog.faqs.map((faq, idx) => (
                    <details key={idx}
                      className="group border border-brand-border dark:border-brand-border-dark rounded-xl overflow-hidden bg-brand-card dark:bg-brand-card-dark"
                    >
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-outfit font-semibold text-sm md:text-base text-brand-text dark:text-brand-text-dark select-none list-none">
                        <span>{faq.question}</span>
                        <span className="text-primary ml-3 shrink-0 transform group-open:rotate-180 transition-transform duration-300">▾</span>
                      </summary>
                      <div className="px-5 pb-5 text-brand-text/75 dark:text-brand-text-dark/75 font-inter text-sm leading-relaxed whitespace-pre-wrap border-t border-brand-border dark:border-brand-border-dark pt-3">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

          </article>

          {/* ════════ RIGHT COLUMN — SIDEBAR ════════ */}
          <aside className="w-full lg:w-[280px] xl:w-[300px] 2xl:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-8">

              {/* Social video (if present) */}
              {blog.videoUrl && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40 dark:text-brand-text-dark/40 mb-3 pl-0.5">
                    Watch
                  </p>
                  <SocialVideoEmbed url={blog.videoUrl} />
                </div>
              )}

              {/* Recommendations */}
              <SidebarRecommendations currentBlogId={blog._id} />

            </div>
          </aside>

        </div>

        {/* ── Itinerary Roadmap (full width, below 2-col) ── */}
        {linkedItinerary && linkedItinerary.roadmap.length > 0 && (
          <div className="mt-20 pt-14 border-t border-brand-border dark:border-brand-border-dark">
            <TravelRoadmap
              roadmap={linkedItinerary.roadmap}
              itineraryTitle={linkedItinerary.title}
            />
            {/* CTA banner below roadmap */}
            <div className="mt-14 rounded-2xl overflow-hidden relative">
              {linkedItinerary.thumbnail && (
                <img
                  src={linkedItinerary.thumbnail}
                  alt={linkedItinerary.title}
                  className="w-full h-52 md:h-64 object-cover"
                />
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 100%)' }} />
              <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-14">
                <p className="text-white/60 text-xs font-inter mb-2 uppercase tracking-widest">Featured Journey</p>
                <h3 className="text-white font-outfit font-extrabold text-xl md:text-2xl mb-1 max-w-lg leading-snug">
                  {linkedItinerary.title}
                </h3>
                <p className="text-white/70 text-sm font-inter mb-5">
                  {linkedItinerary.duration} · Starting from{' '}
                  <span className="text-white font-bold">₹{linkedItinerary.price?.toLocaleString('en-IN')}</span>
                </p>
                <Link
                  href={`/itineraries/${linkedItinerary._id}`}
                  style={{ backgroundColor: 'var(--color-primary-dyn)', color: '#fff' }}
                  className="inline-flex items-center gap-2.5 font-outfit font-bold text-sm md:text-base px-7 py-3.5 rounded-xl shadow-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <BookOpen size={17} />
                  Book This Itinerary
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
