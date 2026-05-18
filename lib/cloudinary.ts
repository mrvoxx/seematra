// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export { cloudinary };

export async function uploadToCloudinary(
  file: Buffer,
  folder: string = 'seematra',
  resourceType: 'image' | 'video' | 'raw' = 'image',
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('Upload failed'));
        else resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    uploadStream.end(file);
  });
}
