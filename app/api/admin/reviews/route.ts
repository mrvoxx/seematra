// app/api/admin/reviews/route.ts
// Admin: manage all reviews (GET all, POST manually, PATCH, DELETE)
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import { ok, error, requireAdmin, withErrorHandler } from '@/lib/apiHelpers';

// GET /api/admin/reviews — all reviews including hidden
export const GET = withErrorHandler(async (req: NextRequest) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  await connectDB();
  const reviews = await Review.find({})
    .populate('user', 'name email')
    .populate('itinerary', 'title')
    .sort({ createdAt: -1 })
    .lean();

  const normalised = reviews.map((r: any) => ({
    _id:          r._id.toString(),
    rating:       r.rating,
    title:        r.title,
    comment:      r.comment,
    images:       r.images ?? [],
    isVerified:   r.isVerified,
    isHidden:     r.isHidden,
    isHighlighted:r.isHighlighted,
    name:         r.user?.name ?? r.userName ?? 'Traveler',
    email:        r.user?.email ?? null,
    location:     r.userLocation ?? '',
    avatar:       null,
    itineraryTitle: r.itinerary?.title ?? null,
    createdAt:    r.createdAt,
  }));

  return ok(normalised);
});

// POST /api/admin/reviews — admin manually adds a review
export const POST = withErrorHandler(async (req: NextRequest) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const body = await req.json();
  const { rating, title, comment, userName, userLocation, images, itineraryId } = body;

  if (!rating || !title || !comment || !userName) {
    return error('rating, title, comment, and userName are required', 400);
  }

  await connectDB();

  const review = await Review.create({
    rating:       parseInt(rating, 10),
    title:        title.trim(),
    comment:      comment.trim(),
    userName:     userName.trim(),
    userLocation: userLocation?.trim() ?? '',
    images:       images ?? [],
    itinerary:    itineraryId ?? undefined,
    isVerified:   true,
    isHighlighted: false,
  });

  return ok(review, 201);
});

// PATCH /api/admin/reviews?id=xxx — toggle hidden/highlighted
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const id   = new URL(req.url).searchParams.get('id');
  const body = await req.json();
  if (!id) return error('id is required', 400);

  await connectDB();
  const review = await Review.findByIdAndUpdate(id, { $set: body }, { new: true });
  if (!review) return error('Review not found', 404);

  return ok(review);
});

// DELETE /api/admin/reviews?id=xxx
export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return error('id is required', 400);

  await connectDB();
  await Review.findByIdAndDelete(id);
  return ok({ deleted: true });
});
