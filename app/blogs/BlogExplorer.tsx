'use client';

import { useState, useMemo } from 'react';
import BlogCard from '@/components/global/BlogCard';
import { IBlog } from '@/types';

interface Props {
  initialBlogs: IBlog[];
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'blog', label: 'Blogs' },
  { key: 'pseo', label: 'Travel Guides' },
] as const;

export default function BlogExplorer({ initialBlogs }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let items = initialBlogs;

    // Source filter
    if (activeFilter === 'blog') {
      items = items.filter(b => b.source !== 'pseo');
    } else if (activeFilter === 'pseo') {
      items = items.filter(b => b.source === 'pseo');
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(blog =>
        blog.title.toLowerCase().includes(q) ||
        blog.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return items;
  }, [initialBlogs, searchQuery, activeFilter]);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      {/* Filters + Search */}
      <div className="animate-fade-up mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Type Filters */}
        <div className="flex items-center gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-outfit font-medium transition-all duration-200 ${
                activeFilter === f.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark text-brand-text/70 dark:text-brand-text-dark/70 hover:border-primary/50'
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({f.key === 'all'
                  ? initialBlogs.length
                  : initialBlogs.filter(b => f.key === 'blog' ? b.source !== 'pseo' : b.source === 'pseo').length
                })
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[280px]">
          <input
            type="text"
            placeholder="Search guides, tips, destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-brand-text dark:text-brand-text-dark placeholder:text-brand-text/40 shadow-sm"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up">
          {filtered.map((blog) => (
            <BlogCard key={`${blog.source}-${blog.slug}`} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface dark:bg-surface-dark rounded-xl border border-brand-border dark:border-brand-border-dark animate-fade-in">
          <p className="text-brand-text/50 dark:text-brand-text-dark/50">
            No travel guides found for &quot;{searchQuery}&quot;. Try a different term!
          </p>
        </div>
      )}
    </div>
  );
}
