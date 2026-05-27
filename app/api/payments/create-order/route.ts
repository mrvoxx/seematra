// app/api/payments/create-order/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import Booking from '@/models/Booking';
import razorpay from '@/lib/razorpay';
import { ok, error, requireAuth, withErrorHandler } from '@/lib/apiHelpers';
import { z } from 'zod';
import mongoose from 'mongoose';

// ─── Reservation fee amount (fixed) ──────────────────────────────────────────
const RESERVATION_FEE = 500;

const CreateOrderSchema = z.object({
  itineraryId:  z.string().min(1, 'Itinerary ID required'),
  pickupPoint:  z.string().min(2, 'Pickup point is required'),
  contactPhone: z.string().min(10, 'Valid contact number is required'),
  tourDate:     z.string().min(1, 'Tour date is required'),
  groupSize:    z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(6)]),
  // ✅ NEW: Payment mode selection
  paymentMode:  z.enum(['full', 'advance_40', 'reservation_500']).default('advance_40'),
  // ✅ Required acknowledgment for reservation fee (non-refundable)
  disclaimerAccepted: z.boolean().optional(),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, response } = await requireAuth(req);
  if (response) return response;

  const body = await req.json();
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { itineraryId, pickupPoint, contactPhone, tourDate, groupSize, paymentMode, disclaimerAccepted } = parsed.data;

  if (!mongoose.isValidObjectId(itineraryId)) return error('Invalid itinerary ID', 400);

  // Disclaimer is required for reservation_500 to prevent abuse
  if (paymentMode === 'reservation_500' && !disclaimerAccepted) {
    return error('You must accept the reservation terms before proceeding.', 400);
  }

  await connectDB();

  // ✅ Always fetch price from DB — never trust client-side amounts
  const itinerary = await Itinerary.findById(itineraryId);
  if (!itinerary) return error('Itinerary not found', 404);

  // Resolve price from pricing tier if available, fallback to base price
  const matchedTier = (itinerary as any).pricingTiers?.find((t: any) => t.persons === groupSize);
  const totalAmount   = matchedTier ? matchedTier.totalPrice : itinerary.price;
  const vehicleAssigned = matchedTier?.vehicle || '';

  // ─── Calculate amount based on payment mode ───────────────────────────────
  let amountPaidOnline: number;
  let reservationFee = 0;
  let newBookingStatus: string;
  let newPaymentStatus: string;

  switch (paymentMode) {
    case 'full':
      amountPaidOnline = totalAmount;
      newBookingStatus = 'confirmed';
      newPaymentStatus = 'COMPLETED';
      break;

    case 'advance_40':
      // Ceil to avoid fractions in paise
      amountPaidOnline = Math.ceil(totalAmount * 0.4);
      newBookingStatus = 'partially_paid';
      newPaymentStatus = 'PARTIAL_PAID';
      break;

    case 'reservation_500':
      // Flat ₹500 reservation fee, deducted from total later
      amountPaidOnline = RESERVATION_FEE;
      reservationFee   = RESERVATION_FEE;
      newBookingStatus = 'reserved';
      newPaymentStatus = 'RESERVED';
      break;
  }

  const balanceDue = totalAmount - amountPaidOnline;
  const amountInPaise = amountPaidOnline * 100; // Razorpay uses paise

  // Balance due 3 days before tour date
  const tourDateObj   = new Date(tourDate);
  const balanceDueDate = new Date(tourDateObj);
  balanceDueDate.setDate(balanceDueDate.getDate() - 3);

  // ✅ Create Razorpay order
  const order = await razorpay.orders.create({
    amount:   amountInPaise,
    currency: 'INR',
    receipt:  `booking_${Date.now()}`,
    notes: {
      itineraryId,
      userId:      ((session?.user as any)?.id || session?.user?.email || 'guest') as string,
      paymentMode,
    },
  });

  // ✅ Persist pending booking immediately
  const booking = await Booking.create({
    user:             (session!.user as any).id,
    itinerary:        itineraryId,
    pickupPoint,
    contactPhone,
    tourDate:         tourDateObj,
    groupSize,
    vehicleAssigned,
    paymentType:      'online',
    paymentMode,
    totalAmount,
    amountPaidOnline,
    reservationFee,
    balanceDue,
    balanceDueDate,
    paymentStatus:    'PENDING', // Will be updated after verify
    bookingStatus:    'pending',
    razorpayOrderId:  order.id,
    disclaimerAccepted: disclaimerAccepted ?? false,
  });

  // Labels for the payment screen
  const paymentLabels: Record<string, string> = {
    full:            'Full Payment',
    advance_40:      '40% Advance',
    reservation_500: '₹500 Reservation',
  };

  return ok({
    orderId:         order.id,
    bookingId:       booking._id.toString(),
    totalAmount,
    amountPaidOnline,
    balanceDue,
    paymentMode,
    paymentLabel:    paymentLabels[paymentMode],
    currency:        'INR',
    keyId:           process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  }, 201);
});
