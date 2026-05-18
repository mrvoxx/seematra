// app/api/blogs/[slug]/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { BlogUpdateSchema } from '@/lib/validations';
import { ok, error, requireAdmin, withErrorHandler } from '@/lib/apiHelpers';
import { revalidatePath } from 'next/cache';

export const GET = withErrorHandler(async (_req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const params = await ctx?.params;
  const slug = params?.slug;
  if (!slug) return error('Slug is required', 400);

  await connectDB();
  const blog = await Blog.findOne({ slug }).lean();
  if (!blog) return error('Blog not found', 404);

  return ok(blog);
});

export const PUT = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const params = await ctx?.params;
  const slug = params?.slug;
  if (!slug) return error('Slug is required', 400);

  const body = await req.json();
  const parsed = BlogUpdateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 400);

  await connectDB();
  const updated = await Blog.findOneAndUpdate({ slug }, parsed.data, { returnDocument: 'after', runValidators: true }).lean();
  if (!updated) return error('Blog not found', 404);

  revalidatePath('/blogs');
  revalidatePath(`/blogs/${slug}`);

  return ok(updated);
});

export const DELETE = withErrorHandler(async (req: NextRequest, ctx?: { params: Promise<Record<string, string>> }) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const params = await ctx?.params;
  const slug = params?.slug;
  await connectDB();
  const deleted = await Blog.findOneAndDelete({ slug });
  if (!deleted) return error('Blog not found', 404);

  revalidatePath('/blogs');
  revalidatePath(`/blogs/${slug}`);

  return ok({ deleted: true });
});
