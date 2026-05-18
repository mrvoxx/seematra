'use client';

import { useState } from 'react';
import { IDbReview, IUser } from '@/types';
import { Star, ThumbsUp, CheckCircle, Award, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Props {
  review: IDbReview;
  rank: number; // 0-indexed position in sorted list
  onHelpful: (reviewId: string, newCount: number) => void;
}

const BADGE_CONFIG = [
  { label: 'Most Helpful', icon: ThumbsUp, color: 'bg-secondary/20 text-secondary dark:text-accent' },
  { label: 'Top Rated', icon: Award, color: 'bg-accent/20 text-accent-dark' },
  { label: 'Recent Review', icon: Zap, color: 'bg-primary/20 text-primary' },
];

export default function ReviewCard({ review, rank, onHelpful }: Props) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const user = review.user as IUser;
  const badge = rank < 3 ? BADGE_CONFIG[rank] : null;
  const isHighlighted = review.isHighlighted || rank === 0;

  async function handleHelpful() {
    if (!session || isVoting) return;
    setIsVoting(true);
    try {
      const res = await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review._id }),
      });
      const data = await res.json();
      if (res.ok) onHelpful(review._id, data.data.helpfulCount);
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <>
      <div className={`card p-6 flex flex-col gap-4 transition-all ${isHighlighted ? 'border-primary/50 shadow-lg shadow-primary/10 scale-[1.01]' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-outfit font-bold text-primary text-sm shrink-0">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-outfit font-bold text-sm">{user?.name ?? 'Traveler'}</span>
                {review.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-inter">
                    <CheckCircle size={12} /> Verified Traveler
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 font-inter">
                {review.tripDate
                  ? new Date(review.tripDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                  : new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Badge */}
          {badge && (
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full shrink-0 ${badge.color}`}>
              <badge.icon size={12} /> {badge.label}
            </span>
          )}
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={16} fill={s <= review.rating ? 'currentColor' : 'none'} className={s <= review.rating ? 'text-accent' : 'text-brand-border dark:text-brand-border-dark'} />
          ))}
          <span className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 ml-1 font-inter">{review.rating}/5</span>
        </div>

        {/* Content */}
        <div>
          <h4 className="font-outfit font-bold mb-1 text-base">{review.title}</h4>
          <p className="text-sm font-inter text-brand-text/80 dark:text-brand-text-dark/80 leading-relaxed">{review.comment}</p>
        </div>

        {/* Images */}
        {review.images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {review.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Review image ${i + 1}`}
                onClick={() => setLightboxImg(img)}
                className="w-20 h-20 object-cover rounded-lg cursor-pointer border border-brand-border dark:border-brand-border-dark hover:opacity-80 transition-opacity"
              />
            ))}
          </div>
        )}

        {/* Helpful */}
        <button
          onClick={handleHelpful}
          disabled={!session || isVoting}
          className="self-start flex items-center gap-2 text-xs font-inter font-bold text-brand-text/60 dark:text-brand-text-dark/60 hover:text-secondary transition-colors disabled:opacity-40"
        >
          <ThumbsUp size={14} />
          Helpful ({review.helpfulCount})
        </button>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Review" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </>
  );
}
