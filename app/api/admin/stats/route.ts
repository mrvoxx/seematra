// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();

    const Booking = (await import('@/models/Booking')).default;
    const Itinerary = (await import('@/models/Itinerary')).default;
    const Blog = (await import('@/models/Blog')).default;
    const User = (await import('@/models/User')).default;

    const [totalBookings, totalItineraries, totalBlogs, totalUsers, recentBookings, revenue] = await Promise.all([
      Booking.countDocuments({ paymentStatus: { $in: ['PARTIAL_PAID', 'COMPLETED', 'RESERVED'] } }),
      Itinerary.countDocuments(),
      Blog.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.find().sort({ createdAt: -1 }).limit(5).populate('itinerary', 'title thumbnail').populate('user', 'name email').lean(),
      Booking.aggregate([
        { $match: { paymentStatus: { $in: ['PARTIAL_PAID', 'COMPLETED', 'RESERVED'] } } },
        { $group: { _id: null, total: { $sum: '$amountPaidOnline' } } }
      ]),
    ]);

    return NextResponse.json({
      data: {
        totalBookings,
        totalItineraries,
        totalBlogs,
        totalUsers,
        totalRevenue: revenue[0]?.total || 0,
        recentBookings,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
