'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IBlog } from '@/types';
import { Calendar, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import FavoriteButton from './FavoriteButton';
import { motion } from 'framer-motion';
import { cardVariant } from './ItineraryCard';

interface Props {
  blog: IBlog;
  index?: number;
}

// Type badge colors for pSEO pages
const TYPE_COLORS: Record<string, string> = {
  'Circuit Guide': 'bg-teal-500/90 text-white',
  'Destination Guide': 'bg-emerald-500/90 text-white',
  'Travel Guide': 'bg-sky-500/90 text-white',
  'Comparison': 'bg-purple-500/90 text-white',
  'Seasonal Guide': 'bg-amber-500/90 text-white',
  'FAQ Hub': 'bg-violet-500/90 text-white',
  'Nearby Places': 'bg-rose-500/90 text-white',
};

export default function BlogCard({ blog, index = 0 }: Props) {
  const isPseo = blog.source === 'pseo';
  const linkHref = isPseo ? (blog.href || `/explore/${blog.slug}`) : `/blogs/${blog.slug}`;

  // Strip HTML for excerpt
  const excerpt = (blog.content ?? '').replace(/<[^>]*>?/gm, '').slice(0, 150) + '...';

  // Get first tag that matches a type label for the badge
  const typeBadge = isPseo ? blog.tags[0] : null;

  return (
    <motion.article
      variants={cardVariant}
      initial="hidden"
      whileInView="visible"
      custom={index}
      viewport={{ once: true, margin: '-60px' }}
      className="card group flex flex-col h-full overflow-hidden relative"
    >
      <div className="relative h-48 md:h-60 w-full overflow-hidden">
        {!isPseo && <FavoriteButton itemId={blog._id} itemType="blog" />}
        <Image
          src={blog.thumbnail}
          alt={blog.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Tags / Type Badge */}
        <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2">
          {isPseo && typeBadge ? (
            <span className={`badge backdrop-blur-sm text-xs font-bold ${TYPE_COLORS[typeBadge] || 'bg-teal-500/90 text-white'}`}>
              {typeBadge}
            </span>
          ) : (
            (blog.tags || []).slice(0, 2).map((tag) => (
              <span key={tag} className="badge bg-surface/90 text-primary-dark shadow-sm">
                {tag}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-xs font-inter text-brand-text/50 dark:text-brand-text-dark/50 mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <time dateTime={blog.publishedAt || blog.createdAt || new Date().toISOString()}>
              {format(new Date(blog.publishedAt || blog.createdAt || new Date().toISOString()), 'MMM d, yyyy')}
            </time>
          </div>
          {isPseo && blog.circuit ? (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{blog.circuit.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(' Circuit', '')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{blog.author || 'Seematra Team'}</span>
            </div>
          )}
        </div>

        <Link href={linkHref} className="block group-hover:text-primary transition-colors mb-3">
          <h3 className="text-xl font-outfit font-bold line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <p className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70 mb-6 line-clamp-3 flex-1">
          {excerpt}
        </p>

        <Link
          href={linkHref}
          className="mt-auto text-primary font-outfit font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all before:absolute before:inset-0 before:z-10"
        >
          {isPseo ? 'Read Travel Guide' : 'Read Full Article'} &rarr;
        </Link>
      </div>
    </motion.article>
  );
}
