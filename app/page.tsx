import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import Blog from '@/models/Blog';
import Review from '@/models/Review';
import ItinerarySwiper from '@/components/global/ItinerarySwiper';
import BlogSwiper from '@/components/global/BlogSwiper';
import ReviewCarousel, { CarouselReview } from '@/components/global/ReviewCarousel';
import UnifiedHero from '@/components/global/UnifiedHero';
import ErrorBoundary from '@/components/global/ErrorBoundary';
import { ItinerarySwiperSkeleton, BlogSwiperSkeleton } from '@/components/global/SkeletonCard';
import { ShieldCheck, Compass, MapPin, CheckCircle, MessageCircle } from 'lucide-react';
import { IItinerary, IBlog } from '@/types';

export const revalidate = 3600;

export default async function Home() {
  await connectDB();

  const [rawItins, rawBlogs, rawReviews] = await Promise.all([
    Itinerary.find({ isRecommended: true, active: true }).limit(6).lean() as any,
    Blog.find({ isRecommended: true }).limit(4).lean() as any,
    Review.find({ isHidden: false })
      .populate('user', 'name avatar')
      .populate('itinerary', 'title')
      .sort({ isHighlighted: -1, createdAt: -1 })
      .limit(16)
      .lean() as any,
    Itinerary.find({ active: true, $or: [{ genres: 'Family' }, { tags: { $in: ['Family', 'Kids'] } }] }).limit(6).lean() as any,
    Itinerary.find({ active: true, $or: [{ genres: 'Romantic' }, { tags: { $in: ['Couple', 'Romantic'] } }] }).limit(6).lean() as any,
  ]);

  const recommendedItineraries = rawItins.map((it: any) => ({
    ...it,
    _id: it._id.toString(),
    createdAt: it.createdAt?.toISOString(),
    updatedAt: it.updatedAt?.toISOString(),
  })) as IItinerary[];

  const recentBlogs = rawBlogs.map((b: any) => ({
    ...b,
    _id: b._id.toString(),
    createdAt: b.createdAt?.toISOString(),
    publishedAt: b.publishedAt?.toISOString(),
  })) as IBlog[];

  const reviews: CarouselReview[] = rawReviews.length > 0
    ? rawReviews.map((r: any) => ({
        _id:            r._id.toString(),
        name:           r.user?.name ?? r.userName ?? 'Traveler',
        location:       r.userLocation ?? '',
        rating:         r.rating,
        title:          r.title,
        comment:        r.comment,
        images:         r.images ?? [],
        avatar:         r.user?.avatar ?? null,
        isVerified:     r.isVerified ?? true,
        itineraryTitle: r.itinerary?.title ?? null,
      }))
    : [
        { _id: 'd1', name: 'Rahul Sharma', location: 'Delhi', rating: 5, title: 'Life-changing trek!', comment: 'The Kedarnath trip was perfectly organised. Everything from transport to stay was top notch. Highly recommend Seematra.', images: [], isVerified: true, itineraryTitle: 'Kedarnath Yatra' },
        { _id: 'd2', name: 'Priya Desai', location: 'Mumbai', rating: 5, title: 'Best weekend ever!', comment: 'Auli skiing package was absolutely thrilling. The instructors were professional and the Himalayan views were breathtaking.', images: [], isVerified: true, itineraryTitle: 'Auli Ski Adventure' },
        { _id: 'd3', name: 'Amit Kumar', location: 'Bangalore', rating: 4, title: 'Stunning Valley trek', comment: 'Valley of Flowers exceeded every expectation. Guides were very knowledgeable about local flora. Would go again!', images: [], isVerified: true, itineraryTitle: null },
        { _id: 'd4', name: 'Neha Gupta', location: 'Pune', rating: 5, title: 'Perfect group trip!', comment: 'Rishikesh rafting and camping was the perfect weekend getaway. Booked for 6 friends, everything went smoothly.', images: [], isVerified: true, itineraryTitle: 'Rishikesh Adventure Camp' },
        { _id: 'd5', name: 'Sanjay Singh', location: 'Chandigarh', rating: 5, title: 'Spiritual & peaceful', comment: 'Char Dham tour conducted with utmost respect and comfort. Reasonable price, honest service. Thank you Seematra.', images: [], isVerified: true, itineraryTitle: 'Char Dham Yatra' },
        { _id: 'd6', name: 'Ananya Verma', location: 'Jaipur', rating: 5, title: 'Couple trip goals!', comment: 'Chopta trip with my partner was magical. Sunset views, clean stay, great food. Seematra planned everything perfectly.', images: [], isVerified: true, itineraryTitle: 'Chopta Chandrashila' },
        { _id: 'd7', name: 'Vikram Patel', location: 'Surat', rating: 4, title: 'Great family trip', comment: 'Nainital family package was excellent. Kids loved the lake, parents loved the cool weather. No hidden charges at all.', images: [], isVerified: true, itineraryTitle: 'Nainital Family Tour' },
        { _id: 'd8', name: 'Meera Nair', location: 'Kochi', rating: 5, title: 'Solo trekker approved!', comment: 'First solo Himalayan trek and Seematra made it completely stress-free. Local guide was knowledgeable and caring.', images: [], isVerified: true, itineraryTitle: null },
      ];

  const [rawFamilyItins, rawCoupleItins] = await Promise.all([
    Itinerary.find({ active: true, $or: [{ genres: 'Family' }, { tags: { $in: ['Family', 'Kids'] } }] }).limit(6).lean() as any,
    Itinerary.find({ active: true, $or: [{ genres: 'Romantic' }, { tags: { $in: ['Couple', 'Romantic'] } }] }).limit(6).lean() as any,
  ]);

  const familyItineraries = rawFamilyItins.map((it: any) => ({ ...it, _id: it._id.toString(), createdAt: it.createdAt?.toISOString(), updatedAt: it.updatedAt?.toISOString() })) as IItinerary[];
  const coupleItineraries = rawCoupleItins.map((it: any) => ({ ...it, _id: it._id.toString(), createdAt: it.createdAt?.toISOString(), updatedAt: it.updatedAt?.toISOString() })) as IItinerary[];

  return (
    <div className="bg-surface dark:bg-surface-dark min-h-screen">

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 1 — HOOK
          Hero with brand, price anchor, dual CTA
      ═══════════════════════════════════════════════════════════════ */}
      <UnifiedHero
        title="Discover the Soul of Uttarakhand"
        eyebrow="Seematra"
        subtitle="Weekend trips from ₹3,499 per person · Groups, Families & Couples"
        backgroundImage="https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136945/seematra/backgrounds/uttrakhand.jpg"
        showCanvas={true}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 flex-wrap">
          <Link href="/itineraries" className="btn-primary flex items-center justify-center text-center w-[85%] max-w-[260px] sm:w-auto text-sm sm:text-base py-2.5 sm:py-3">
            Find My Trip From ₹3,499
          </Link>

          <a
            href="https://wa.me/qr/IP26U77IWO5GO1?text=Hi,%20I'm%20interested%20in%20a%20group%20trip%20with%20Seematra.%20Can%20you%20share%20packages%20and%20pricing?"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center text-center gap-2 w-[85%] max-w-[260px] sm:w-auto px-4 py-2.5 sm:px-6 sm:py-[11px] rounded-full text-xs sm:text-sm font-poppins font-semibold tracking-wide transition-all duration-200 active:scale-95 shadow-lg"
            style={{
              background: 'rgba(37,211,102,0.18)',
              border: '1.5px solid rgba(37,211,102,0.55)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366', flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 00.611.611l6.053-1.466A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.001-1.366l-.36-.213-3.724.902.919-3.626-.234-.373A9.818 9.818 0 1112 21.818z"/>
            </svg>
            Plan on WhatsApp
          </a>
        </div>
      </UnifiedHero>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 2 — BROWSE
          Most booked trips — immediately after hero
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-inter font-semibold uppercase tracking-widest text-primary mb-1 block">Most Booked This Season</span>
              <h2 className="section-title">Weekend's Best Bets</h2>
            </div>
            <Link href="/itineraries" className="btn-secondary text-sm shrink-0 self-start sm:self-auto">View All Trips →</Link>
          </div>

          <ErrorBoundary label="Itineraries" compact>
            {recommendedItineraries.length > 0 ? (
              <ItinerarySwiper itineraries={recommendedItineraries} />
            ) : (
              <ItinerarySwiperSkeleton count={3} />
            )}
          </ErrorBoundary>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 3A — WHY SEEMATRA (Mixed Trust Section)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-primary/5 dark:bg-primary/10 border-y border-brand-border dark:border-brand-border-dark">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-xs font-inter font-semibold uppercase tracking-widest text-primary mb-1 block">The Seematra Difference</span>
            <h2 className="section-title">Why Travel With Us?</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">

            {/* 1. Reply in 15 Minutes */}
            <div className="card p-4 sm:p-5 md:p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-2 sm:mb-3 shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 00.611.611l6.053-1.466A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.001-1.366l-.36-.213-3.724.902.919-3.626-.234-.373A9.818 9.818 0 1112 21.818z"/>
                </svg>
              </div>
              <h3 className="font-outfit font-bold text-xs sm:text-base text-brand-text dark:text-brand-text-dark mb-1">WhatsApp Assistance</h3>
              <p className="hidden sm:block text-xs leading-relaxed font-inter text-brand-text/70 dark:text-brand-text-dark/70">
                No bots, no hold music. Real human assistance on WhatsApp, from planning your trip to the moment you return home safely.
              </p>
              <div className="mt-auto sm:mt-3 flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-inter font-bold text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" strokeWidth={2.5} /> Always Available
              </div>
            </div>

            {/* 2. Hand Curated Trails */}
            <div className="card p-4 sm:p-5 md:p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 sm:mb-3 shrink-0">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-outfit font-bold text-xs sm:text-base text-brand-text dark:text-brand-text-dark mb-1">Hand Curated Itineraries</h3>
              <p className="hidden sm:block text-xs leading-relaxed font-inter text-brand-text/70 dark:text-brand-text-dark/70">
                We don't sell every route — only the ones we've personally explored. Our itineraries ensure you experience the absolute best.
              </p>
              <div className="mt-auto sm:mt-3 flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-inter font-bold text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" strokeWidth={2.5} /> Expert Verified
              </div>
            </div>

            {/* 3. Secure Payments */}
            <div className="card p-4 sm:p-5 md:p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 sm:mb-3 shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-outfit font-bold text-xs sm:text-base text-brand-text dark:text-brand-text-dark mb-1">Secure Payments</h3>
              <p className="hidden sm:block text-xs leading-relaxed font-inter text-brand-text/70 dark:text-brand-text-dark/70">
                Book with confidence. We use bank-grade Razorpay encryption for all transactions, with no hidden charges or surprise fees.
              </p>
              <div className="mt-auto sm:mt-3 flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-inter font-bold text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" strokeWidth={2.5} /> Razorpay Secure
              </div>
            </div>

            {/* 4. Local Assistance */}
            <div className="card p-4 sm:p-5 md:p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 sm:mb-3 shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-outfit font-bold text-xs sm:text-base text-brand-text dark:text-brand-text-dark mb-1">Local Assistance</h3>
              <p className="hidden sm:block text-xs leading-relaxed font-inter text-brand-text/70 dark:text-brand-text-dark/70">
                Our operations team is based in Uttarakhand. If a road closes or weather turns bad, our local network ensures you stay safe.
              </p>
              <div className="mt-auto sm:mt-3 flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-inter font-bold text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" strokeWidth={2.5} /> Ground Support
              </div>
            </div>

            {/* 5. Quality Articles */}
            <div className="card p-4 sm:p-5 md:p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 sm:mb-3 shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="font-outfit font-bold text-xs sm:text-base text-brand-text dark:text-brand-text-dark mb-1">Quality Articles</h3>
              <p className="hidden sm:block text-xs leading-relaxed font-inter text-brand-text/70 dark:text-brand-text-dark/70">
                Read deep-dive guides into local culture, hidden spots, and preparation tips written by genuine mountain experts.
              </p>
              <div className="mt-auto sm:mt-3 flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-inter font-bold text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" strokeWidth={2.5} /> Expert Written
              </div>
            </div>

            {/* 6. Affordable Packages */}
            <div className="card p-4 sm:p-5 md:p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 sm:mb-3 shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-outfit font-bold text-xs sm:text-base text-brand-text dark:text-brand-text-dark mb-1">Affordable Packages</h3>
              <p className="hidden sm:block text-xs leading-relaxed font-inter text-brand-text/70 dark:text-brand-text-dark/70">
                Direct partnerships with homestays and transporters mean no middleman fees. You get the best experiences at honest prices.
              </p>
              <div className="mt-auto sm:mt-3 flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-inter font-bold text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" strokeWidth={2.5} /> Group Rates
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 3B — WANDERERS' TALES
          Real reviews from DB — with photos if available
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center mb-10">
          <span className="text-xs font-inter font-semibold uppercase tracking-widest text-primary mb-1 block">Verified Travelers</span>
          <h2 className="section-title mb-3">Wanderers' Tales</h2>
          <p className="section-subtitle">Real trips. Real people. Real reviews.</p>
        </div>

        {reviews.length > 0 ? (
          <div className="flex flex-col gap-5">
            <ReviewCarousel reviews={reviews.slice(0, 8)} direction="left" speed="normal" />
            {reviews.length > 4 && (
              <ReviewCarousel reviews={reviews.slice(4)} direction="right" speed="slow" />
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-brand-text/40 dark:text-brand-text-dark/40 font-inter text-sm">Reviews coming soon — be the first to share your story!</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/reviews" className="btn-secondary text-sm">Read All Reviews →</Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 4 — FAMILY & COUPLE PACKAGES
          Carousel-based browseable itineraries
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-primary/5 via-surface to-secondary/5 dark:from-primary/10 dark:via-surface-dark dark:to-secondary/10 border-y border-brand-border dark:border-brand-border-dark">
        <div className="container mx-auto px-4 lg:px-8">

          {/* Urgency banner */}
          <div className="mb-12 rounded-2xl bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-400/30 p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl">🏔</span>
              <div>
                <p className="text-sm font-outfit font-bold text-brand-text dark:text-brand-text-dark">Slots filling up fast</p>
                <p className="text-xs font-inter text-brand-text/60 dark:text-brand-text-dark/60">Char Dham &amp; Valley of Flowers season — weekends going first</p>
              </div>
            </div>
            <a
              href="https://wa.me/qr/IP26U77IWO5GO1?text=Hi,%20I%20want%20to%20check%20availability%20for%20a%20family%20or%20couple%20trip%20this%20summer."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2 px-4 shrink-0 whitespace-nowrap sm:ml-auto"
            >
              Check Availability on WhatsApp →
            </a>
          </div>

          {/* Family Packages carousel */}
          <div className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">👨‍👩‍👧‍👦</span>
                  <span className="text-xs font-inter font-semibold uppercase tracking-widest text-primary">4–10 people · Kid-friendly</span>
                </div>
                <h2 className="section-title">Family Packages</h2>
              </div>
              <Link href="/itineraries?genre=Family" className="btn-secondary text-sm shrink-0 self-start sm:self-auto">All Family Trips →</Link>
            </div>
            <ErrorBoundary label="Family Itineraries" compact>
              <ItinerarySwiper itineraries={familyItineraries.length > 0 ? familyItineraries : recommendedItineraries} />
            </ErrorBoundary>
          </div>

          {/* Couple Packages carousel */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">💑</span>
                  <span className="text-xs font-inter font-semibold uppercase tracking-widest text-secondary dark:text-secondary-dark">2 people · Romantic &amp; scenic</span>
                </div>
                <h2 className="section-title">Couple Escapes</h2>
              </div>
              <Link href="/itineraries?genre=Romantic" className="btn-secondary text-sm shrink-0 self-start sm:self-auto">All Couple Trips →</Link>
            </div>
            <ErrorBoundary label="Couple Itineraries" compact>
              <ItinerarySwiper itineraries={coupleItineraries.length > 0 ? coupleItineraries : recommendedItineraries} />
            </ErrorBoundary>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 5A — WHATSAPP SAFETY NET
          Catch undecided users
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 00.611.611l6.053-1.466A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.001-1.366l-.36-.213-3.724.902.919-3.626-.234-.373A9.818 9.818 0 1112 21.818z"/>
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-outfit font-bold text-brand-text dark:text-brand-text-dark mb-3">
              Planning a group trip?
            </h2>
            <p className="font-inter text-brand-text/65 dark:text-brand-text-dark/65 mb-2 leading-relaxed">
              Send us your dates and group size on WhatsApp.
            </p>
            <p className="font-inter text-brand-text/65 dark:text-brand-text-dark/65 mb-8 leading-relaxed">
              We'll plan everything — <strong className="text-brand-text dark:text-brand-text-dark font-semibold">no hidden charges, no sales pressure.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/qr/IP26U77IWO5GO1?text=Hi,%20I'm%20planning%20a%20group%20trip.%20Here%20are%20my%20details%3A%0A%0AGroup%20size%3A%0ADates%3A%0ABudget%20per%20person%3A%0APreference%3A"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center justify-center gap-2 py-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 00.611.611l6.053-1.466A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.001-1.366l-.36-.213-3.724.902.919-3.626-.234-.373A9.818 9.818 0 1112 21.818z"/></svg>
                Chat on WhatsApp
              </a>
              <Link href="/itineraries" className="btn-secondary py-3">Browse All Trips</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 5B — BLOG / GUIDES
          Keep undecided users on site, builds SEO
      ═══════════════════════════════════════════════════════════════ */}
      {recentBlogs.length > 0 && (
        <section className="py-14 md:py-20 bg-brand-border/20 dark:bg-brand-border-dark/20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
              <div>
                <span className="text-xs font-inter font-semibold uppercase tracking-widest text-primary mb-1 block">Before You Go</span>
                <h2 className="section-title mb-2">Travel Guides &amp; Stories</h2>
                <p className="section-subtitle">Packing lists, best seasons, route tips — written by people who've been there.</p>
              </div>
              <Link href="/blogs" className="btn-secondary shrink-0 self-start md:self-auto">Read All Articles →</Link>
            </div>
            <ErrorBoundary label="Blogs" compact>
              <BlogSwiper blogs={recentBlogs} />
            </ErrorBoundary>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 6 — EXPLORE THE MAP
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto card p-8 md:p-12 flex flex-col justify-center items-center text-center group">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl md:text-3xl font-outfit font-bold mb-3 text-brand-text dark:text-brand-text-dark">Explore the Map</h3>
            <p className="text-brand-text/65 dark:text-brand-text-dark/65 font-inter mb-8 leading-relaxed">
              See all our destinations pinned across Uttarakhand. Tap any pin to view the package, route, and pricing.
            </p>
            <Link href="/map" className="btn-outline">Launch Map Viewer →</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
