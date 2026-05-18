// app/api/bookings/[id]/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { ok, error, requireAdmin, withErrorHandler } from '@/lib/apiHelpers';
import mongoose from 'mongoose';

// PUT /api/bookings/[id] — admin updates booking status (e.g. mark completed)
export const PUT = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return error('Invalid booking ID', 400);

  const body = await req.json();
  const allowed = ['bookingStatus'];
  const update: Record<string, any> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) return error('No valid fields to update', 400);

  const VALID_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  if (update.bookingStatus && !VALID_STATUSES.includes(update.bookingStatus)) {
    return error('Invalid booking status', 400);
  }

  await connectDB();
  const booking = await Booking.findByIdAndUpdate(id, update, { returnDocument: 'after' });
  if (!booking) return error('Booking not found', 404);

  return ok(booking);
});
