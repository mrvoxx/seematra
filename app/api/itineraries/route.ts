// app/api/itineraries/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import { ItinerarySchema } from '@/lib/validations';
import { ok, error, requireAdmin, withErrorHandler } from '@/lib/apiHelpers';

export const GET = withErrorHandler(async (req: NextRequest) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const genre = searchParams.get('genre');
  const search = searchParams.get('search');
  const tag = searchParams.get('tag');
  const recommended = searchParams.get('recommended');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '12', 10));
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = { active: true };
  if (genre) query.genres = genre;
  if (tag) query.tags = tag.toLowerCase();
  if (recommended === 'true') query.isRecommended = true;
  if (search) query.$text = { $search: search };

  const [data, total] = await Promise.all([
    Itinerary.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Itinerary.countDocuments(query),
  ]);

  return ok({ data, total, page, totalPages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, response } = await requireAdmin(req);
  if (response) return response;

  const body = await req.json();
  const parsed = ItinerarySchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  await connectDB();

  // Auto-set mapCoords from last roadmap point if not provided
  const data = parsed.data;
  if (!data.mapCoords && data.roadmap.length > 0) {
    const last = data.roadmap[data.roadmap.length - 1];
    data.mapCoords = last.coords;
  }

  const itinerary = await Itinerary.create(data);
  return ok(itinerary, 201);
});
