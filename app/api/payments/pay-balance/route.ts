// app/api/payments/pay-balance/route.ts
// Allows a user to pay the remaining balance on a partially-paid booking
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import razorpay from '@/lib/razorpay';
import { ok, error, requireAuth, withErrorHandler } from '@/lib/apiHelpers';
import { z } from 'zod';
import mongoose from 'mongoose';
import { sendAdminPushNotification } from '@/lib/push';

const CreateBalanceOrderSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
});

const VerifyBalanceSchema = z.object({
  bookingId:             z.string().min(1),
  razorpay_order_id:     z.string().min(1),
  razorpay_payment_id:   z.string().min(1),
  razorpay_signature:    z.string().min(1),
});

// ─── POST /api/payments/pay-balance → create Razorpay order for balance ───────
export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, response } = await requireAuth(req);
  if (response) return response;

  const body = await req.json();

  // Detect whether this is a "create order" or "verify payment" call
  const isVerify = 'razorpay_order_id' in body;

  if (isVerify) {
    // ─── Verify balance payment ──────────────────────────────────────────
    const parsed = VerifyBalanceSchema.safeParse(body);
    if (!parsed.success) return error(parsed.error.issues[0].message, 400);

    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
    if (!mongoose.isValidObjectId(bookingId)) return error('Invalid booking ID', 400);

    // ✅ Verify HMAC signature
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) return error('Signature verification failed', 400);

    await connectDB();

    // ✅ Verify ownership
    const userId = (session!.user as any).id as string;
    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email')
      .populate('itinerary', 'title');

    if (!booking) return error('Booking not found', 404);
    if (booking.user?._id?.toString() !== userId && (session!.user as any).role !== 'admin') {
      return error('Forbidden', 403);
    }

    if (booking.balanceDue <= 0) return error('No balance remaining on this booking.', 400);

    // ✅ Idempotency check
    const existing = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existing) return ok({ verified: true, alreadyProcessed: true });

    // ✅ Update booking to fully paid
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus:          'COMPLETED',
      bookingStatus:          'confirmed',
      balanceDue:             0,
      balanceRazorpayOrderId:   razorpay_order_id,
      balanceRazorpayPaymentId: razorpay_payment_id,
    });

    // ✅ Log payment
    await Payment.create({
      booking:           bookingId,
      user:              userId,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status:            'success',
      amount:            booking.balanceDue,
      paymentMode:       'balance',
      paymentStage:      'balance',
    });

    // ✅ Generate balance payment invoice
    let invoiceToken: string | undefined;
    try {
      const { createInvoice } = await import('@/lib/invoice');
      const invoice = await createInvoice(booking as any, 'balance');
      invoiceToken = invoice.accessToken;
    } catch (e) {
      console.error('[Invoice] Balance invoice failed:', e);
    }

    const tripTitle = (booking.itinerary as any)?.title ?? 'a trip';
    sendAdminPushNotification('Balance Paid! ✅', `Full payment received for ${tripTitle}.`).catch(console.error);

    return ok({ verified: true, bookingId, paymentStatus: 'COMPLETED', invoiceToken });

  } else {
    // ─── Create Razorpay order for balance ───────────────────────────────
    const parsed = CreateBalanceOrderSchema.safeParse(body);
    if (!parsed.success) return error(parsed.error.issues[0].message, 400);

    const { bookingId } = parsed.data;
    if (!mongoose.isValidObjectId(bookingId)) return error('Invalid booking ID', 400);

    await connectDB();

    const userId = (session!.user as any).id as string;
    const booking = await Booking.findById(bookingId);
    if (!booking) return error('Booking not found', 404);
    if (booking.user.toString() !== userId && (session!.user as any).role !== 'admin') {
      return error('Forbidden', 403);
    }
    if (booking.balanceDue <= 0) return error('No balance remaining on this booking.', 400);

    const order = await razorpay.orders.create({
      amount:   booking.balanceDue * 100, // paise
      currency: 'INR',
      receipt:  `balance_${bookingId}_${Date.now()}`,
      notes:    { bookingId, type: 'balance_payment', userId },
    });

    await Booking.findByIdAndUpdate(bookingId, { balanceRazorpayOrderId: order.id });

    return ok({
      orderId:     order.id,
      bookingId,
      amount:      booking.balanceDue,
      currency:    'INR',
      keyId:       process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  }
});
