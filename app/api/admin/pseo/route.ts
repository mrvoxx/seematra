import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PseoPage from '@/models/PseoPage';
import { ok, error, requireAdmin, withErrorHandler } from '@/lib/apiHelpers';
import { revalidatePath } from 'next/cache';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { response } = await requireAdmin(req);
  if (response) return response;

  await connectDB();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const circuit = searchParams.get('circuit');
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  const query: any = {};
  if (type) query.page_type = type;
  if (circuit) query.circuit = circuit;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } }
    ];
  }

  const pages = await PseoPage.find(query)
    .sort({ generated_at: -1 })
    .limit(500)
    .lean();

  return ok({ data: pages });
});
