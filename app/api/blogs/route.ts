// app/api/blogs/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { BlogSchema } from '@/lib/validations';
import { ok, error, requireAdmin, withErrorHandler } from '@/lib/apiHelpers';
import { revalidatePath } from 'next/cache';

export const GET = withErrorHandler(async (req: NextRequest) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const recommended = searchParams.get('recommended');
  const search = searchParams.get('search');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '9', 10));
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};
  if (recommended === 'true') query.isRecommended = true;
  if (search) query.$text = { $search: search };

  const [data, total] = await Promise.all([
    Blog.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
    Blog.countDocuments(query),
  ]);

  return ok({ data, total, page, totalPages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const body = await req.json();
  const parsed = BlogSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { relatedItinerary, ...rest } = parsed.data;
  const blogData = {
    ...rest,
    ...(relatedItinerary ? { relatedItinerary } : {}),
  };
  const blog = await Blog.create(blogData);
  revalidatePath('/blogs');
  return ok(blog, 201);
});
