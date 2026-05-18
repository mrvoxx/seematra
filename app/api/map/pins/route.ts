// app/api/map/pins/route.ts
import { connectDB } from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import { ok, withErrorHandler } from '@/lib/apiHelpers';
import { NextRequest } from 'next/server';

// Returns last destination coord of every active itinerary — used for the Map page pins
export const GET = withErrorHandler(async (_req: NextRequest) => {
  await connectDB();
  const itineraries = await Itinerary.find({ active: true })
    .select('_id title thumbnail price mapCoords roadmap')
    .lean();

  const pins = itineraries
    .map((it) => {
      const coords = it.mapCoords
        ?? (it.roadmap?.length > 0
          ? it.roadmap[it.roadmap.length - 1].coords
          : null);

      if (!coords) return null;
      return {
        itineraryId: it._id.toString(),
        title: it.title,
        lat: coords.lat,
        lng: coords.lng,
        thumbnail: it.thumbnail,
        price: it.price,
      };
    })
    .filter(Boolean);

  return ok(pins);
});

// Enable static build + ISR for this public route
export const revalidate = 1800;
