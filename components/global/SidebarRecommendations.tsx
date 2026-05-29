'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/services/api';
import { IItinerary, IBlog } from '@/types';
import Link from 'next/link';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  currentBlogId?: string;
  currentItineraryId?: string;
}

export default function SidebarRecommendations({ currentBlogId, currentItineraryId }: Props) {
  const [itineraries, setItineraries] = useState<IItinerary[]>([]);
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itRes, blRes] = await Promise.all([
          api.get('/itineraries?limit=5'),
          api.get('/blogs?limit=5')
        ]);
        
        let fetchedItineraries = Array.isArray(itRes?.data)
          ? itRes.data
          : (Array.isArray(itRes) ? itRes : []);
        let fetchedBlogs = Array.isArray(blRes?.data)
          ? blRes.data
          : (Array.isArray(blRes) ? blRes : []);

        // Filter out current items and take top 2
        if (currentItineraryId) {
          fetchedItineraries = fetchedItineraries.filter((it: any) => it._id !== currentItineraryId);
        }
        if (currentBlogId) {
          fetchedBlogs = fetchedBlogs.filter((bl: any) => bl._id !== currentBlogId);
        }

        setItineraries(fetchedItineraries.slice(0, 2));
        setBlogs(fetchedBlogs.slice(0, 2));
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentBlogId, currentItineraryId]);

  if (loading) return <div className="w-full h-48 bg-surface-dark/10 animate-pulse rounded-2xl" />;

  return (
    <div className="space-y-8">
      {/* Recommended Itineraries */}
      {itineraries.length > 0 && (
        <div>
          <h3 className="font-outfit font-bold text-xl mb-4 border-l-4 border-primary pl-3">Popular Journeys</h3>
          <div className="space-y-4">
            {itineraries.map((it) => (
              <Link key={it._id} href={`/itineraries/${it._id}`} className="group flex gap-4 bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark p-3 rounded-2xl hover:border-primary/50 transition-colors shadow-sm">
                <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden">
                  <img src={it.thumbnail} alt={it.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <h4 className="font-outfit font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">{it.title}</h4>
                  <div className="text-xs text-brand-text/50 font-inter mt-1 flex items-center gap-1">
                    <MapPin size={10} /> {it.duration}
                  </div>
                  <div className="text-sm font-bold text-primary mt-2">
                    ₹{it.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Blogs */}
      {blogs.length > 0 && (
        <div>
          <h3 className="font-outfit font-bold text-xl mb-4 border-l-4 border-primary pl-3">Related Reads</h3>
          <div className="space-y-4">
            {blogs.map((blog) => (
              <Link key={blog._id} href={`/blogs/${blog.slug}`} className="group flex flex-col bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark p-3 rounded-2xl hover:border-primary/50 transition-colors shadow-sm">
                <div className="relative w-full h-32 shrink-0 rounded-xl overflow-hidden mb-3">
                  <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h4 className="absolute bottom-2 left-3 right-3 font-outfit font-bold text-sm text-white line-clamp-2">{blog.title}</h4>
                </div>
                <div className="text-xs text-primary font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Article &rarr;
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
