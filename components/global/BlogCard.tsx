'use client';

import Link from 'next/link';
import Image from 'next/image';
import { IBlog } from '@/types';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import FavoriteButton from './FavoriteButton';
import { motion, Variants } from 'framer-motion';

interface Props {
  blog: IBlog;
  index?: number;
}

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' }
  })
};

export default function BlogCard({ blog, index = 0 }: Props) {
  // Strip HTML and CSS for clean excerpt
  const rawText = (blog.content ?? '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/gm, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const excerpt = rawText.length > 130 ? rawText.slice(0, 130) + '…' : rawText;

  return (
    <Link href={`/blogs/${blog.slug}`} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
      <motion.article
        variants={cardVariant}
        initial="hidden"
        whileInView="visible"
        custom={index}
        viewport={{ once: true, margin: '-60px' }}
        className="flex flex-col h-full bg-white dark:bg-brand-card-dark rounded-2xl overflow-hidden border border-brand-border/60 dark:border-brand-border-dark shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-primary/30 transition-all duration-500"
      >
        {/* Image Container */}
        <div className="relative h-[220px] md:h-[240px] w-full overflow-hidden">
          <FavoriteButton itemId={blog._id} itemType="blog" />
          <Image
            src={blog.thumbnail}
            alt={blog.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Tags */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            {(blog.tags || []).slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white shadow-sm font-outfit">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 md:p-6 flex flex-col flex-1 relative">
          
          {/* Meta row: Date + Author */}
          <div className="flex items-center gap-3 text-[11px] font-inter text-brand-text/50 dark:text-brand-text-dark/50 mb-3.5 uppercase tracking-wider font-bold">
            <time dateTime={blog.publishedAt || blog.createdAt || new Date().toISOString()} className="flex items-center gap-1.5">
              <Calendar size={12} className="text-primary" />
              {format(new Date(blog.publishedAt || blog.createdAt || new Date().toISOString()), 'MMM d, yyyy')}
            </time>
            <span className="w-1 h-1 rounded-full bg-brand-border dark:bg-brand-border-dark" />
            <span className="flex items-center gap-1.5">
              <User size={12} className="text-primary" />
              {blog.author || 'Seematra Team'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg md:text-xl font-outfit font-extrabold line-clamp-2 text-brand-text dark:text-brand-text-dark group-hover:text-primary transition-colors duration-300 leading-snug mb-3">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-[13px] md:text-sm font-inter text-brand-text/65 dark:text-brand-text-dark/65 leading-relaxed line-clamp-3 flex-1 mb-6">
            {excerpt}
          </p>

          {/* Read More Footer */}
          <div className="mt-auto pt-4 border-t border-brand-border/60 dark:border-brand-border-dark flex items-center justify-between">
            <span className="text-[10px] text-brand-text/40 dark:text-brand-text-dark/40 font-inter uppercase tracking-widest font-bold">
              Travel Guide
            </span>
            <div className="flex items-center gap-1.5 text-primary font-outfit font-bold text-xs group-hover:gap-2 transition-all">
              Read Article <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
