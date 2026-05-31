// scripts/upload-assets.mjs
// Uploads logo.png + r1-r8 from /public to Cloudinary, prints URLs
import { v2 as cloudinary } from 'cloudinary';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '../public');

cloudinary.config({
  cloud_name: 'ddthsmqk8',
  api_key: '355685145575378',
  api_secret: 's0nVGT5NY5OBoBgy5ZxL8Sw6JhQ',
});

async function upload(filePath, publicId, resourceType = 'image') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        public_id: publicId,
        folder: 'seematra',
        resource_type: resourceType,
        overwrite: true,
        quality: 'auto',
        fetch_format: 'auto',
      },
      (err, result) => {
        if (err || !result) reject(err ?? new Error('Upload failed'));
        else resolve(result.secure_url);
      }
    );
  });
}

const assets = [
  { file: 'logo.png',   id: 'brand/logo',   type: 'image' },
  { file: 'r1.jpeg',    id: 'reviews/r1',   type: 'image' },
  { file: 'r2.mp4',     id: 'reviews/r2',   type: 'video' },
  { file: 'r3.HEIC',    id: 'reviews/r3',   type: 'image' },
  { file: 'r4.mp4',     id: 'reviews/r4',   type: 'video' },
  { file: 'r5.mp4',     id: 'reviews/r5',   type: 'video' },
  { file: 'r6.jpeg',    id: 'reviews/r6',   type: 'image' },
  { file: 'r7.jpeg',    id: 'reviews/r7',   type: 'image' },
  { file: 'r8.jpg',     id: 'reviews/r8',   type: 'image' },
];

const results = {};

for (const { file, id, type } of assets) {
  const path = `${PUBLIC}/${file}`;
  process.stdout.write(`Uploading ${file}... `);
  try {
    const url = await upload(path, id, type);
    results[file] = url;
    console.log(`✅ ${url}`);
  } catch (e) {
    console.log(`❌ ${e.message}`);
    results[file] = null;
  }
}

console.log('\n\n=== FINAL URLS ===');
console.log(JSON.stringify(results, null, 2));
