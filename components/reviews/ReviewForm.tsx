'use client';

import { useState } from 'react';
import { Star, Upload, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Props {
  itineraryId: string;
  hasCompletedBooking: boolean;
  onSuccess: (review: any) => void;
}

export default function ReviewForm({ itineraryId, hasCompletedBooking, onSuccess }: Props) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Not logged in
  if (!session) return null;

  // Logged in but trip not completed
  if (!hasCompletedBooking) {
    return (
      <div className="card p-6 border border-brand-border/50 dark:border-brand-border-dark/50 text-center">
        <p className="text-brand-text/60 dark:text-brand-text-dark/60 font-inter text-sm">
          ✈️ Review will be available after your trip is completed.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return showToast('Please select a rating');
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itineraryId, rating, title, comment, images: [] }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Submission failed');
      onSuccess(data.data);
      showToast('Review submitted! Thank you 🎉');
      setRating(0); setTitle(''); setComment('');
    } finally {
      setSubmitting(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
      <h3 className="font-outfit font-bold text-xl">Share Your Experience</h3>

      {/* Star Picker */}
      <div>
        <label className="text-xs font-inter text-brand-text/70 dark:text-brand-text-dark/70 mb-2 block uppercase tracking-wide">Your Rating *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={28}
                fill={(hovered || rating) >= s ? 'currentColor' : 'none'}
                className={(hovered || rating) >= s ? 'text-accent' : 'text-brand-border dark:text-brand-border-dark'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-inter text-brand-text/70 dark:text-brand-text-dark/70 mb-1 block uppercase tracking-wide">Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          placeholder="Summarize your experience..."
          className="w-full border border-brand-border dark:border-brand-border-dark rounded-lg px-4 py-2 bg-surface dark:bg-surface-dark text-brand-text dark:text-brand-text-dark font-inter text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Comment */}
      <div>
        <label className="text-xs font-inter text-brand-text/70 dark:text-brand-text-dark/70 mb-1 block uppercase tracking-wide">Review *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          required
          rows={4}
          placeholder="Tell future travelers what you loved, what to expect..."
          className="w-full border border-brand-border dark:border-brand-border-dark rounded-lg px-4 py-2 bg-surface dark:bg-surface-dark text-brand-text dark:text-brand-text-dark font-inter text-sm outline-none focus:border-primary transition-colors resize-none"
        />
        <p className="text-xs text-right text-brand-text/40 mt-1 font-inter">{comment.length}/1000</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full justify-center py-3 text-base"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-dark dark:bg-surface text-brand-text-dark dark:text-brand-text px-5 py-3 rounded-xl shadow-xl text-sm font-inter font-bold animate-fade-up">
          {toast}
        </div>
      )}
    </form>
  );
}
