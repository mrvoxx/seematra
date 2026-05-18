// app/api/bookings/my/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { ok, requireAuth, withErrorHandler } from '@/lib/apiHelpers';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { session, response } = await requireAuth(req);
  if (response) return response;

  await connectDB();
  const userId = (session!.user as any).id ?? (session!.user as any)._id;
  const bookings = await Booking.find({ user: userId })
    .populate('itinerary', 'title thumbnail duration price')
    .sort({ createdAt: -1 })
    .lean();

  return ok(bookings);
});
