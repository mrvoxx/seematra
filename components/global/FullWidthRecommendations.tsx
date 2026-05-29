'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/services/api';
import { IItinerary, IBlog } from '@/types';
import ItineraryCard from './ItineraryCard';
import BlogCard from './BlogCard';

interface Props {
  currentBlogId?: string;
  currentItineraryId?: string;
}

export default function FullWidthRecommendations({ currentBlogId, currentItineraryId }: Props) {
  const [itineraries, setItineraries] = useState<IItinerary[]>([]);
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itRes, blRes] = await Promise.all([
          api.get('/itineraries?limit=6'),
          api.get('/blogs?limit=6')
        ]);
        
        let fetchedItineraries = Array.isArray(itRes?.data)
          ? itRes.data
          : (Array.isArray(itRes) ? itRes : []);
        let fetchedBlogs = Array.isArray(blRes?.data)
          ? blRes.data
          : (Array.isArray(blRes) ? blRes : []);

        if (currentItineraryId) {
          fetchedItineraries = fetchedItineraries.filter((it: any) => it._id !== currentItineraryId);
        }
        if (currentBlogId) {
          fetchedBlogs = fetchedBlogs.filter((bl: any) => bl._id !== currentBlogId);
        }

        setItineraries(fetchedItineraries.slice(0, 3));
        setBlogs(fetchedBlogs.slice(0, 3));
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentBlogId, currentItineraryId]);

  if (loading) return null;

  return (
    <div className="w-full space-y-16">
      {itineraries.length > 0 && (
        <section>
          <h2 className="text-3xl font-outfit font-bold mb-8 border-l-4 border-primary pl-4">Recommended Journeys</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {itineraries.map((it) => (
              <ItineraryCard key={it._id} itinerary={it} />
            ))}
          </div>
        </section>
      )}

      {blogs.length > 0 && (
        <section>
          <h2 className="text-3xl font-outfit font-bold mb-8 border-l-4 border-primary pl-4">Related Travel Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
