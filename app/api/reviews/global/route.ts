// app/api/reviews/global/route.ts
// GET all reviews (not per-itinerary) — for homepage carousel & reviews page
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import { ok, withErrorHandler } from '@/lib/apiHelpers';

export const revalidate = 0;

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit   = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const rating  = searchParams.get('rating'); // filter by star rating
  const skip    = (page - 1) * limit;

  await connectDB();

  const query: any = { isHidden: false };
  if (rating) query.rating = parseInt(rating, 10);

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('user', 'name avatar')
      .populate('itinerary', 'title')
      .sort({ isHighlighted: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(query),
  ]);

  // Normalise: use userName fallback for admin-created reviews
  const normalised = reviews.map((r: any) => ({
    _id:          r._id.toString(),
    rating:       r.rating,
    title:        r.title,
    comment:      r.comment,
    images:       r.images ?? [],
    isVerified:   r.isVerified,
    isHighlighted:r.isHighlighted,
    tripDate:     r.tripDate,
    itineraryTitle: r.itinerary?.title ?? null,
    // Display name: real user name > admin userName > "Traveler"
    name:     r.user?.name ?? r.userName ?? 'Traveler',
    location: r.userLocation ?? '',
    avatar:   r.user?.avatar ?? null,
    createdAt: r.createdAt,
  }));

  return ok({ reviews: normalised, total, page, totalPages: Math.ceil(total / limit) });
});
