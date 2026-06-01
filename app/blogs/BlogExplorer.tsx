'use client';

import { useState, useMemo } from 'react';
import BlogCard from '@/components/global/BlogCard';
import { IBlog } from '@/types';
import { Search } from 'lucide-react';

interface Props {
  initialBlogs: IBlog[];
}

export default function BlogExplorer({ initialBlogs }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return initialBlogs;
    const q = searchQuery.toLowerCase();
    return initialBlogs.filter(blog => 
      blog.title.toLowerCase().includes(q) || 
      blog.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [initialBlogs, searchQuery]);

  return (
    <div className="w-full px-4 sm:px-8 md:px-10 lg:px-14 xl:px-20 2xl:px-24 py-16 md:py-24">
      
      {/* ── Search Bar Area ── */}
      <div className="animate-fade-up mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-brand-border dark:border-brand-border-dark pb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-outfit font-extrabold text-brand-text dark:text-brand-text-dark">
            Latest Articles
          </h2>
          <p className="text-sm font-inter text-brand-text/50 dark:text-brand-text-dark/50 mt-1">
            Browse our collection of {initialBlogs.length} guides and stories.
          </p>
        </div>

        <div className="relative w-full md:w-80 shrink-0">
          <input
            type="text"
            placeholder="Search guides, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 text-brand-text dark:text-brand-text-dark placeholder:text-brand-text/40 shadow-sm transition-all"
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40" />
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 animate-fade-up">
          {filtered.map((blog, idx) => (
            <BlogCard key={blog.slug} blog={blog} index={idx} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-surface/50 dark:bg-surface-dark/50 rounded-2xl border border-brand-border dark:border-brand-border-dark animate-fade-in flex flex-col items-center">
          <Search size={32} className="text-brand-text/20 mb-4" />
          <h3 className="font-outfit font-bold text-lg text-brand-text dark:text-brand-text-dark mb-1">
            No matches found
          </h3>
          <p className="text-brand-text/50 dark:text-brand-text-dark/50 text-sm font-inter">
            We couldn't find any guides matching "{searchQuery}".
          </p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 text-sm font-bold font-outfit text-primary hover:text-primary/80 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
