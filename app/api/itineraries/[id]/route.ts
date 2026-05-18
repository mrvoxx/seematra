// app/api/itineraries/[id]/route.ts
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import { ItineraryUpdateSchema } from '@/lib/validations';
import { ok, error, requireAdmin, withErrorHandler } from '@/lib/apiHelpers';

type Ctx = { params: { id: string } };

export const GET = withErrorHandler(async (_req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const params = await ctx?.params;
  const id = params?.id;
  if (!mongoose.isValidObjectId(id)) return error('Invalid ID', 400);

  await connectDB();
  const itinerary = await Itinerary.findById(id).lean();
  if (!itinerary) return error('Itinerary not found', 404);

  return ok(itinerary);
});

export const PUT = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const params = await ctx?.params;
  const id = params?.id;
  if (!mongoose.isValidObjectId(id)) return error('Invalid ID', 400);

  const body = await req.json();
  const parsed = ItineraryUpdateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  await connectDB();
  const updated = await Itinerary.findByIdAndUpdate(id, parsed.data, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  if (!updated) return error('Itinerary not found', 404);

  return ok(updated);
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const params = await ctx?.params;
  const id = params?.id;
  if (!mongoose.isValidObjectId(id)) return error('Invalid ID', 400);

  await connectDB();
  const deleted = await Itinerary.findByIdAndDelete(id);
  if (!deleted) return error('Itinerary not found', 404);

  return ok({ deleted: true });
});
