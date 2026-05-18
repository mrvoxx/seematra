// app/api/reviews/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import { ReviewSchema } from '@/lib/validations';
import { ok, error, requireAuth, withErrorHandler } from '@/lib/apiHelpers';

// ─── GET /api/reviews?itineraryId= ────────────────────────────────────────────
export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const itineraryId = searchParams.get('itineraryId');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '10', 10));
  const skip = (page - 1) * limit;

  if (!itineraryId) return error('itineraryId is required', 400);

  await connectDB();

  const query = { itinerary: itineraryId, isHidden: false };

  const [reviews, total, rated] = await Promise.all([
    Review.find(query)
      .populate('user', 'name')
      .sort({
        isHighlighted: -1,  // pinned first
        rating: -1,          // highest rated
        helpfulCount: -1,    // most helpful
        createdAt: -1,       // newest
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(query),
    Review.aggregate([
      { $match: { itinerary: require('mongoose').Types.ObjectId.createFromHexString(itineraryId), isHidden: false } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  const averageRating = rated[0]?.avg ?? 0;
  const totalReviews = rated[0]?.count ?? 0;

  return ok({
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// ─── POST /api/reviews ────────────────────────────────────────────────────────
export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, response } = await requireAuth(req);
  if (response) return response;

  const body = await req.json();
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { itineraryId, rating, title, comment, images, tripDate } = parsed.data;
  const userId = (session as any).user.id;

  await connectDB();

  // 1. Find booking — must be COMPLETED
  const booking = await Booking.findOne({
    user: userId,
    itinerary: itineraryId,
    bookingStatus: 'completed',
  });

  if (!booking) {
    return error('You can only review after completing your trip', 403);
  }

  // 2. Prevent duplicate review per booking
  const existing = await Review.findOne({ booking: booking._id });
  if (existing) {
    return error('You have already reviewed this trip', 409);
  }

  // 3. Create review
  const review = await Review.create({
    user: userId,
    itinerary: itineraryId,
    booking: booking._id,
    rating,
    title,
    comment,
    images: images ?? [],
    tripDate: tripDate ? new Date(tripDate) : undefined,
    isVerified: true,
  });

  return ok(review, 201);
});
