'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IBlog } from '@/types';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import FavoriteButton from './FavoriteButton';
import { motion } from 'framer-motion';
import { cardVariant } from './ItineraryCard';

interface Props {
  blog: IBlog;
  index?: number;
}

export default function BlogCard({ blog, index = 0 }: Props) {
  // Strip HTML for excerpt
  const excerpt = (blog.content ?? '').replace(/<[^>]*>?/gm, '').slice(0, 150) + '...';

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
        <FavoriteButton itemId={blog._id} itemType="blog" />
        <Image
          src={blog.thumbnail}
          alt={blog.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2">
          {(blog.tags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="badge bg-surface/90 text-primary-dark shadow-sm">
              {tag}
            </span>
          ))}
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
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{blog.author || 'Seematra Team'}</span>
          </div>
        </div>

        <Link href={`/blogs/${blog.slug}`} className="block group-hover:text-primary transition-colors mb-3">
          <h3 className="text-xl font-outfit font-bold line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <p className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70 mb-6 line-clamp-3 flex-1">
          {excerpt}
        </p>

        <Link
          href={`/blogs/${blog.slug}`}
          className="mt-auto text-primary font-outfit font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all before:absolute before:inset-0 before:z-10"
        >
          Read Full Article &rarr;
        </Link>
      </div>
    </motion.article>
  );
}
