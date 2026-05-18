// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getSession } from '@/lib/auth';

// ⚠️ SECURITY: Only allow safe image types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
// Allow only known Cloudinary folder names (prevent path traversal)
const ALLOWED_FOLDERS = ['seematra', 'itineraries', 'blogs', 'avatars', 'hotels', 'invoices'];

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string | null) || 'seematra';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // ⚠️ SECURITY: Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type '${file.type}' is not allowed. Use JPEG, PNG, WebP, GIF, or AVIF.` },
        { status: 415 },
      );
    }

    // ⚠️ SECURITY: Enforce size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 413 },
      );
    }

    // ⚠️ SECURITY: Validate folder name against allowlist
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'seematra';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer, safeFolder);

    return NextResponse.json({ url: result.url, publicId: result.publicId }, { status: 200 });
  } catch (err: any) {
    console.error('Upload Error:', err);
    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { error: isProd ? 'Upload failed' : err.message || 'Upload failed' },
      { status: 500 },
    );
  }
}
