// app/api/auth/otp/send/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OtpVerification from '@/models/OtpVerification';
import { sendOtp } from '@/lib/otpService';
import { rateLimit } from '@/lib/rateLimit';
import { ok, error, withErrorHandler } from '@/lib/apiHelpers';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const SendOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Rate limit: 3 OTP requests per phone per 15 minutes per IP
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!rateLimit(ip, 3, 15 * 60 * 1000)) {
    return error('Too many OTP requests. Please wait 15 minutes.', 429);
  }

  const body = await req.json();
  const parsed = SendOtpSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  const { phone } = parsed.data;

  await connectDB();

  // Check if a valid OTP was sent in the last 60 seconds (resend cooldown)
  const recentOtp = await OtpVerification.findOne({
    phone,
    createdAt: { $gt: new Date(Date.now() - 60_000) }, // within last 60s
    verified: false,
  });
  if (recentOtp) {
    return error('Please wait 60 seconds before requesting another OTP.', 429);
  }

  // Generate 6-digit OTP and hash it
  const plainOtp = String(Math.floor(100000 + Math.random() * 900000));
  const hashedOtp = await bcrypt.hash(plainOtp, 10);

  // Store hashed OTP with 10-minute expiry
  await OtpVerification.create({
    phone,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0,
    verified: false,
  });

  // Send OTP via configured provider (MSG91 / Twilio / console in dev)
  await sendOtp(phone, plainOtp);

  return ok({ sent: true, message: 'OTP sent successfully.' });
});
