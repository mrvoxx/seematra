// app/api/bookings/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Itinerary from '@/models/Itinerary';
import { BookingSchema } from '@/lib/validations';
import { ok, error, requireAuth, requireAdmin, withErrorHandler } from '@/lib/apiHelpers';
import { sendAdminPushNotification } from '@/lib/push';
import mongoose from 'mongoose';

// GET /api/bookings — admin gets all, regular user gets theirs via /api/bookings/my
export const GET = withErrorHandler(async (req: NextRequest) => {
  const { session, response } = await requireAdmin(req);
  if (response) return response;

  await connectDB();
  const bookings = await Booking.find({})
    .populate('user', 'name email')
    .populate('itinerary', 'title price thumbnail')
    .sort({ createdAt: -1 })
    .lean();

  return ok(bookings);
});

// POST /api/bookings — create a direct (offline) booking
export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, response } = await requireAuth(req);
  if (response) return response;

  const body = await req.json();
  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { itineraryId, paymentType, pickupPoint, contactPhone, tourDate, groupSize } = parsed.data;
  if (!mongoose.isValidObjectId(itineraryId)) return error('Invalid itinerary ID', 400);

  await connectDB();
  const itinerary = await Itinerary.findById(itineraryId);
  if (!itinerary) return error('Itinerary not found', 404);

  // Resolve price from pricing tier if available, fallback to base price
  const matchedTier = (itinerary as any).pricingTiers?.find((t: any) => t.persons === groupSize);
  const totalAmount = matchedTier ? matchedTier.totalPrice : itinerary.price;
  const vehicleAssigned = matchedTier?.vehicle || '';
  // For direct payments, no online charge
  const amountPaidOnline = paymentType === 'direct' ? 0 : Math.ceil(totalAmount / 3);
  const balanceDue = totalAmount - amountPaidOnline;

  const booking = await Booking.create({
    user: (session!.user as any).id,
    itinerary: itineraryId,
    paymentType,
    pickupPoint,
    contactPhone,
    tourDate: tourDate ? new Date(tourDate) : undefined,
    groupSize,
    vehicleAssigned,
    totalAmount,
    amountPaidOnline,
    balanceDue,
    paymentStatus: paymentType === 'direct' ? 'PENDING' : 'PENDING',
    bookingStatus: paymentType === 'direct' ? 'confirmed' : 'pending',
  });

  // Notify admins via Web Push (fire and forget)
  sendAdminPushNotification(
    'New Booking Received',
    `A new direct booking was created for ${itinerary.title}.`
  ).catch(console.error);

  return ok(booking, 201);
});
