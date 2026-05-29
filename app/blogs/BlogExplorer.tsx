'use client';

import { useState, useMemo } from 'react';
import BlogCard from '@/components/global/BlogCard';
import { IBlog } from '@/types';

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
    <div className="container mx-auto px-4 lg:px-8 py-12">
      {/* Search Bar */}
      <div className="animate-fade-up mb-10 z-20 relative max-w-md mx-auto lg:mx-0 lg:ml-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search guides, tips, destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-brand-text dark:text-brand-text-dark placeholder:text-brand-text/40 shadow-sm"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up">
          {filtered.map((blog) => (
            <BlogCard key={blog.slug} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface dark:bg-surface-dark rounded-xl border border-brand-border dark:border-brand-border-dark animate-fade-in">
          <p className="text-brand-text/50 dark:text-brand-text-dark/50">
            No travel guides found for "{searchQuery}". Try a different term!
          </p>
        </div>
      )}
    </div>
  );
}
