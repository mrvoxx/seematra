import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const files = ['uttrakhand.jpg', 'blog.png', 'about.jpg', 'itineraries.jpg'];

async function upload() {
  for (const file of files) {
    try {
      const result = await cloudinary.uploader.upload(path.join(process.cwd(), 'public', file), {
        folder: 'seematra/backgrounds',
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        quality: 'auto:good', // Optimization
        fetch_format: 'auto'
      });
      console.log(`${file}: ${result.secure_url}`);
    } catch (e) {
      console.error(`Failed to upload ${file}`, e);
    }
  }
}

upload();
