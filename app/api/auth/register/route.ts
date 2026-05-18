// app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { RegisterSchema } from '@/lib/validations';
import { ok, error, withErrorHandler } from '@/lib/apiHelpers';
import { rateLimit } from '@/lib/rateLimit';

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Simple rate limiting: 5 registrations per 15 minutes per IP
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!rateLimit(ip, 5, 15 * 60 * 1000)) {
    return error('Too many registration attempts. Please try again later.', 429);
  }
  const body = await req.json();
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  await connectDB();

  const exists = await User.findOne({ email: parsed.data.email });
  if (exists) return error('Email already in use', 409);

  // Enforce one account per phone number
  if (parsed.data.phone) {
    const phoneTaken = await User.findOne({ phone: parsed.data.phone });
    if (phoneTaken) return error('This phone number is already registered with another account', 409);
  }

  const user = await User.create(parsed.data);
  return ok(
    { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    201,
  );
});
