// app/api/admin/push/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { ok, error, requireAdmin, withErrorHandler } from '@/lib/apiHelpers';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, response } = await requireAdmin(req);
  if (response) return response;

  const subscription = await req.json();
  if (!subscription || !subscription.endpoint) {
    return error('Invalid subscription object', 400);
  }

  await connectDB();
  
  // Update the admin user with the new subscription
  const adminId = (session!.user as any).id ?? (session!.user as any)._id;
  
  await User.findByIdAndUpdate(adminId, {
    $addToSet: { pushSubscriptions: subscription } // Avoid exact duplicates if possible, though Mongoose Mixed array $addToSet has limits
  });

  // To truly avoid duplicates of the exact endpoint, we can pull first then push
  await User.findByIdAndUpdate(adminId, {
    $pull: { pushSubscriptions: { endpoint: subscription.endpoint } }
  });
  await User.findByIdAndUpdate(adminId, {
    $push: { pushSubscriptions: subscription }
  });

  return ok({ message: 'Subscription saved' }, 201);
});
