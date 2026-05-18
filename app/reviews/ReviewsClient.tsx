'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Star, Camera, ChevronDown, CheckCircle } from 'lucide-react';

interface Review {
  _id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  itineraryTitle: string | null;
  isVerified: boolean;
  isHighlighted: boolean;
  avatar: string | null;
  createdAt: string;
}

const STAR_FILTERS = [0, 5, 4, 3, 2, 1]; // 0 = all

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= rating ? '#F59E0B' : 'none'}
          className={s <= rating ? 'text-amber-400' : 'text-brand-border dark:text-brand-border-dark'}
        />
      ))}
    </div>
  );
}

function VerifiedUserAvatar({ name }: { name: string }) {
  return (
    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0 border-2 border-surface dark:border-surface-dark shadow">
      <span className="font-outfit font-bold text-primary text-lg">{name.charAt(0).toUpperCase()}</span>
      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white">
        <CheckCircle size={10} className="text-white" strokeWidth={3} />
      </span>
    </div>
  );
}

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchReviews = useCallback(async (r: number, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '12' });
      if (r) params.set('rating', String(r));
      const res = await fetch(`/api/reviews/global?${params}`);
      const json = await res.json();
      setReviews(json.data?.reviews ?? []);
      setTotalPages(json.data?.totalPages ?? 1);
      setTotal(json.data?.total ?? 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReviews(ratingFilter, page); }, [ratingFilter, page, fetchReviews]);

  function handleFilter(r: number) {
    setRatingFilter(r);
    setPage(1);
  }

  // Average stars
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-6xl">

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-6 mb-8">
        <div className="flex items-end gap-2">
          <span className="text-5xl font-boldonse text-brand-text dark:text-brand-text-dark">{avg}</span>
          <div className="mb-1">
            <StarDisplay rating={Math.round(Number(avg))} size={18} />
            <p className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 font-inter mt-0.5">{total} verified reviews</p>
          </div>
        </div>
        <div className="h-12 w-px bg-brand-border dark:bg-brand-border-dark hidden sm:block" />
        <div className="flex items-center gap-2 text-sm font-inter text-green-600 dark:text-green-400 font-semibold">
          <CheckCircle size={16} />
          All reviews are from real Seematra travelers
        </div>
      </div>

      {/* Star filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STAR_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => handleFilter(r)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-inter font-medium border transition-all duration-200 ${
              ratingFilter === r
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-surface dark:bg-surface-dark border-brand-border dark:border-brand-border-dark text-brand-text/70 dark:text-brand-text-dark/70 hover:border-primary hover:text-primary'
            }`}
          >
            {r === 0 ? (
              'All Reviews'
            ) : (
              <>
                <Star size={12} fill="currentColor" />
                {r} Star{r > 1 ? 's' : ''}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-border/40 dark:bg-brand-border-dark/40 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-brand-border/40 dark:bg-brand-border-dark/40 rounded w-3/4" />
                  <div className="h-2 bg-brand-border/40 dark:bg-brand-border-dark/40 rounded w-1/2" />
                </div>
              </div>
              <div className="h-2 bg-brand-border/40 rounded mb-2 w-full" />
              <div className="h-2 bg-brand-border/40 rounded mb-2 w-5/6" />
              <div className="h-2 bg-brand-border/40 rounded w-4/6" />
            </div>
          ))}
        </div>
      )}

      {/* Reviews grid */}
      {!loading && reviews.length === 0 && (
        <div className="text-center py-20">
          <Star size={40} className="text-brand-border dark:text-brand-border-dark mx-auto mb-4" />
          <p className="text-brand-text/50 dark:text-brand-text-dark/50 font-inter">No reviews yet for this filter.</p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className={`card p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200 ${
                review.isHighlighted ? 'border-primary/40 ring-1 ring-primary/20' : ''
              }`}
            >
              {/* User row */}
              <div className="flex items-center gap-3">
                {review.avatar ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-surface dark:border-surface-dark shadow">
                    <Image src={review.avatar} alt={review.name} fill className="object-cover" />
                  </div>
                ) : review.images[0] ? (
                  <button
                    onClick={() => setSelectedPhoto(review.images[0])}
                    className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary/30 shadow group"
                  >
                    <Image src={review.images[0]} alt={review.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={12} className="text-white" />
                    </div>
                  </button>
                ) : (
                  <VerifiedUserAvatar name={review.name} />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-outfit font-semibold text-sm text-brand-text dark:text-brand-text-dark truncate">{review.name}</p>
                    {review.isVerified && (
                      <CheckCircle size={12} className="text-green-500 shrink-0" />
                    )}
                  </div>
                  {review.location && (
                    <p className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 font-inter truncate">{review.location}</p>
                  )}
                </div>
              </div>

              {/* Stars + trip tag */}
              <div className="flex items-center justify-between">
                <StarDisplay rating={review.rating} />
                {review.itineraryTitle && (
                  <span className="text-[10px] font-inter text-primary bg-primary/10 px-2 py-0.5 rounded-full truncate max-w-[50%]">
                    {review.itineraryTitle}
                  </span>
                )}
              </div>

              {/* Text */}
              <div>
                <p className="text-sm font-outfit font-medium text-brand-text dark:text-brand-text-dark mb-1">{review.title}</p>
                <p className="text-xs font-inter text-brand-text/70 dark:text-brand-text-dark/70 leading-relaxed line-clamp-3">"{review.comment}"</p>
              </div>

              {/* Trip photos row */}
              {review.images.length > 0 && (
                <div className="flex gap-1.5 mt-1">
                  {review.images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhoto(img)}
                      className="relative w-14 h-14 rounded-lg overflow-hidden border border-brand-border dark:border-brand-border-dark hover:border-primary transition-colors shrink-0"
                    >
                      <Image src={img} alt="Trip photo" fill className="object-cover" />
                      {idx === 3 && review.images.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                          +{review.images.length - 4}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <button onClick={() => setPage(p => p - 1)} className="btn-secondary px-4 py-2 text-sm">Previous</button>
          )}
          <span className="flex items-center px-4 text-sm text-brand-text/50 dark:text-brand-text-dark/50 font-inter">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <button onClick={() => setPage(p => p + 1)} className="btn-secondary px-4 py-2 text-sm flex items-center gap-1">
              Load More <ChevronDown size={14} />
            </button>
          )}
        </div>
      )}

      {/* Photo lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl">
            <Image src={selectedPhoto} alt="Trip photo" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
