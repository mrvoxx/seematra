// app/api/payments/verify/route.ts
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import { PaymentVerifySchema } from '@/lib/validations';
import { ok, error, requireAuth, withErrorHandler } from '@/lib/apiHelpers';
import { sendAdminPushNotification } from '@/lib/push';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, response } = await requireAuth(req);
  if (response) return response;

  const body = await req.json();
  const parsed = PaymentVerifySchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = parsed.data;

  // ✅ SECURITY: Verify HMAC-SHA256 signature BEFORE any DB operations
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    await connectDB();
    await Booking.updateOne({ razorpayOrderId: razorpay_order_id }, { paymentStatus: 'FAILED' });
    return error('Payment signature verification failed', 400);
  }

  await connectDB();

  // ✅ SECURITY FIX: Verify booking belongs to the authenticated user
  const userId = (session!.user as any).id as string;
  const booking = await Booking.findById(bookingId)
    .populate('user', 'name email phone')
    .populate('itinerary', 'title duration');

  if (!booking) return error('Booking not found', 404);
  if (booking.user?._id?.toString() !== userId && (session!.user as any).role !== 'admin') {
    return error('Forbidden: this booking does not belong to you', 403);
  }

  // ✅ IDEMPOTENCY: Prevent double-processing the same payment
  const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
  if (existingPayment) {
    return ok({ verified: true, bookingId, paymentStatus: booking.paymentStatus, alreadyProcessed: true });
  }

  // ─── Determine new statuses based on payment mode ────────────────────────
  let newPaymentStatus: string;
  let newBookingStatus: string;

  switch (booking.paymentMode) {
    case 'full':
      newPaymentStatus = 'COMPLETED';
      newBookingStatus = 'confirmed';
      break;
    case 'advance_40':
      newPaymentStatus = 'PARTIAL_PAID';
      newBookingStatus = 'partially_paid';
      break;
    case 'reservation_500':
      newPaymentStatus = 'RESERVED';
      newBookingStatus = 'reserved';
      break;
    default:
      newPaymentStatus = 'PARTIAL_PAID';
      newBookingStatus = 'confirmed';
  }

  // ✅ Update booking status
  await Booking.findByIdAndUpdate(bookingId, {
    paymentStatus:    newPaymentStatus,
    bookingStatus:    newBookingStatus,
    razorpayPaymentId: razorpay_payment_id,
  });

  // ✅ Log payment record (razorpayPaymentId unique index prevents re-entry)
  await Payment.create({
    booking:          bookingId,
    user:             userId,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    status:           'success',
    amount:           booking.amountPaidOnline,
    paymentMode:      booking.paymentMode ?? 'direct',
    paymentStage:     'initial',
  });

  // ✅ Generate PDF invoice (fire-and-forget — don't block response)
  let invoiceToken: string | undefined;
  try {
    const { createInvoice } = await import('@/lib/invoice');
    const invoice = await createInvoice(booking as any, 'initial');
    invoiceToken = invoice.accessToken;
    // Store token on payment record
    await Payment.updateOne({ razorpayPaymentId: razorpay_payment_id }, { invoiceId: invoiceToken });
  } catch (invoiceErr) {
    console.error('[Invoice] PDF generation failed (non-fatal):', invoiceErr);
  }

  // ✅ Notify admin via push notification
  const tripTitle = (booking.itinerary as any)?.title ?? 'a trip';
  sendAdminPushNotification(
    'Payment Verified! 🎉',
    `${(booking.user as any)?.name ?? 'A customer'} paid for ${tripTitle} (${booking.paymentMode}).`,
  ).catch(console.error);

  return ok({
    verified:      true,
    bookingId,
    paymentStatus: newPaymentStatus,
    bookingStatus: newBookingStatus,
    invoiceToken,  // Frontend can use this to offer invoice download
  });
});
