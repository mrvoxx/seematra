// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Itinerary from '@/models/Itinerary';
import Blog from '@/models/Blog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // We need to register the models to populate correctly
    if (!Itinerary) console.log('Init Itinerary Model');
    if (!Blog) console.log('Init Blog Model');

    const user = await User.findOne({ email: session.user.email })
      .populate('favoriteItineraries')
      .populate('favoriteBlogs')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { theme, language } = body;

    await connectDB();
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { 'preferences.theme': theme, 'preferences.language': language } },
      { returnDocument: 'after' }
    ).lean();

    return NextResponse.json({ data: updatedUser });
  } catch (error: any) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
