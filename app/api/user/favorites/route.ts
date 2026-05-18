// app/api/user/favorites/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, itemType } = await req.json();

    if (!itemId || !['itinerary', 'blog'].includes(itemType)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetArray = itemType === 'itinerary' ? 'favoriteItineraries' : 'favoriteBlogs';
    
    // Check if it already exists
    const objectId = new mongoose.Types.ObjectId(itemId);
    const existingIndex = user[targetArray].findIndex((id: mongoose.Types.ObjectId) => id.toString() === itemId);

    if (existingIndex >= 0) {
      // Remove it
      user[targetArray].splice(existingIndex, 1);
    } else {
      // Add it
      user[targetArray].push(objectId);
    }

    await user.save();

    return NextResponse.json({ 
      data: {
        success: true, 
        isFavorite: existingIndex < 0,
        favorites: user[targetArray]
      }
    });

  } catch (error: any) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
