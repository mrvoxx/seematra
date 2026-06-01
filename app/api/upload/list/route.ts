// app/api/upload/list/route.ts
import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { getSession } from '@/lib/auth';

const ALLOWED_FOLDERS = ['seematra', 'itineraries', 'blogs', 'avatars', 'hotels', 'invoices'];

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'seematra';
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'seematra';
    const maxResults = Math.min(parseInt(searchParams.get('max') || '50', 10), 100);

    // Use Cloudinary Search API to fetch images from the specified folder
    const result = await cloudinary.search
      .expression(`folder:${safeFolder}`)
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .with_field('tags')
      .execute();

    const images = (result.resources || []).map((r: any) => ({
      publicId: r.public_id,
      url: r.secure_url,
      filename: r.public_id.split('/').pop() || r.public_id,
      width: r.width,
      height: r.height,
      bytes: r.bytes,
      createdAt: r.created_at,
      format: r.format,
    }));

    return NextResponse.json({ images, total: result.total_count ?? images.length });
  } catch (err: any) {
    console.error('Cloudinary list error:', err);
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'production' ? 'Failed to list images' : err.message },
      { status: 500 },
    );
  }
}
