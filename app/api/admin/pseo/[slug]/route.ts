import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PseoPage from '@/models/PseoPage';
import { ok, error, requireAdmin, withErrorHandler } from '@/lib/apiHelpers';
import { revalidatePath } from 'next/cache';

export const GET = withErrorHandler(async (req: NextRequest, props: { params: Promise<{ slug: string }> }) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const params = await props.params;
  await connectDB();
  
  const page = await PseoPage.findOne({ slug: params.slug }).lean();
  if (!page) return error('Page not found', 404);
  
  return ok(page);
});

export const PUT = withErrorHandler(async (req: NextRequest, props: { params: Promise<{ slug: string }> }) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const params = await props.params;
  const body = await req.json();

  await connectDB();

  const page = await PseoPage.findOneAndUpdate(
    { slug: params.slug },
    { $set: body },
    { new: true, runValidators: true }
  );

  if (!page) return error('Page not found', 404);

  // Revalidate the frontend routes
  revalidatePath(`/explore/${params.slug}`);
  revalidatePath('/blogs');

  return ok(page);
});

export const DELETE = withErrorHandler(async (req: NextRequest, props: { params: Promise<{ slug: string }> }) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const params = await props.params;
  await connectDB();

  const result = await PseoPage.findOneAndDelete({ slug: params.slug });
  if (!result) return error('Page not found', 404);

  revalidatePath('/blogs');

  return ok({ message: 'Deleted' });
});
