'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/services/api';
import { IItinerary, IBlog } from '@/types';
import Link from 'next/link';
import { MapPin, Clock, ArrowRight, BookOpen } from 'lucide-react';

interface Props {
  currentBlogId?: string;
  currentItineraryId?: string;
}

export default function SidebarRecommendations({ currentBlogId, currentItineraryId }: Props) {
  const [itineraries, setItineraries] = useState<IItinerary[]>([]);
  const [blogs, setBlogs]             = useState<IBlog[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [itRes, blRes] = await Promise.all([
          api.get('/itineraries?limit=5'),
          api.get('/blogs?limit=5'),
        ]);

        let its = Array.isArray(itRes?.data) ? itRes.data : (Array.isArray(itRes) ? itRes : []);
        let bls = Array.isArray(blRes?.data) ? blRes.data : (Array.isArray(blRes) ? blRes : []);

        if (currentItineraryId) its = its.filter((x: any) => x._id !== currentItineraryId);
        if (currentBlogId)      bls = bls.filter((x: any) => x._id !== currentBlogId);

        setItineraries(its.slice(0, 3));
        setBlogs(bls.slice(0, 2));
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, [currentBlogId, currentItineraryId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-brand-border/40 dark:bg-brand-border-dark/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Popular Journeys ── */}
      {itineraries.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40 dark:text-brand-text-dark/40 mb-4 pl-0.5">
            Popular Journeys
          </p>
          <div className="space-y-3">
            {itineraries.map((it) => (
              <Link
                key={it._id}
                href={`/itineraries/${it._id}`}
                className="group flex items-center gap-3 p-2.5 rounded-xl border border-brand-border dark:border-brand-border-dark bg-brand-card dark:bg-brand-card-dark hover:border-primary/50 hover:shadow-md transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="shrink-0 w-[68px] h-[68px] rounded-lg overflow-hidden">
                  <img
                    src={it.thumbnail}
                    alt={it.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-outfit font-bold text-brand-text dark:text-brand-text-dark line-clamp-2 leading-tight group-hover:text-primary transition-colors mb-1">
                    {it.title}
                  </h4>
                  <p className="flex items-center gap-1 text-[11px] text-brand-text/45 dark:text-brand-text-dark/45 font-inter mb-1.5">
                    <Clock size={10} /> {it.duration}
                  </p>
                  <p className="text-[13px] font-bold text-primary font-outfit">
                    ₹{it.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* View all CTA */}
          <Link
            href="/itineraries"
            className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold font-outfit text-primary hover:text-primary/80 transition-colors py-2"
          >
            All Itineraries <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {/* ── Related Reads ── */}
      {blogs.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40 dark:text-brand-text-dark/40 mb-4 pl-0.5">
            Related Reads
          </p>
          <div className="space-y-3">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog.slug}`}
                className="group block rounded-xl overflow-hidden border border-brand-border dark:border-brand-border-dark hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                {/* Image */}
                <div className="relative w-full h-[110px] overflow-hidden">
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <h4 className="absolute bottom-0 left-0 right-0 px-3 pb-3 text-[12px] font-outfit font-bold text-white line-clamp-2 leading-snug">
                    {blog.title}
                  </h4>
                </div>
                {/* Footer */}
                <div className="px-3 py-2.5 bg-brand-card dark:bg-brand-card-dark flex items-center justify-between">
                  <span className="text-[10px] text-brand-text/40 dark:text-brand-text-dark/40 font-inter">Travel Guide</span>
                  <span className="text-[11px] font-bold text-primary font-outfit flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/blogs"
            className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold font-outfit text-primary hover:text-primary/80 transition-colors py-2"
          >
            All Guides <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {/* ── Book a trip CTA banner ── */}
      <div className="rounded-xl overflow-hidden relative">
        <div
          className="px-5 py-6 text-center"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-dyn) 0%, color-mix(in srgb, var(--color-primary-dyn) 70%, #0a0a0a) 100%)' }}
        >
          <BookOpen size={22} className="mx-auto mb-3 text-white/80" />
          <h4 className="font-outfit font-extrabold text-white text-sm leading-snug mb-1">
            Plan Your Uttarakhand Trip
          </h4>
          <p className="text-white/65 text-[11px] font-inter mb-4 leading-relaxed">
            Curated packages from ₹7,999 with hotel, guide & transport.
          </p>
          <Link
            href="/itineraries"
            className="inline-flex items-center gap-2 bg-white text-primary text-xs font-outfit font-bold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-all shadow-lg"
          >
            Explore Packages <ArrowRight size={12} />
          </Link>
        </div>
      </div>

    </div>
  );
}
