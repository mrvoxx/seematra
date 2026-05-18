// app/api/reviews/helpful/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import { HelpfulVoteSchema } from '@/lib/validations';
import { ok, error, requireAuth, withErrorHandler } from '@/lib/apiHelpers';
import mongoose from 'mongoose';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, response } = await requireAuth(req);
  if (response) return response;

  const body = await req.json();
  const parsed = HelpfulVoteSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { reviewId } = parsed.data;
  const userId = new mongoose.Types.ObjectId((session as any).user.id);

  await connectDB();

  const review = await Review.findById(reviewId);
  if (!review) return error('Review not found', 404);

  // Prevent duplicate votes
  if (review.helpfulVoters.some((v: any) => v.equals(userId))) {
    return error('You have already marked this review as helpful', 409);
  }

  review.helpfulCount += 1;
  review.helpfulVoters.push(userId);
  await review.save();

  return ok({ helpfulCount: review.helpfulCount });
});
