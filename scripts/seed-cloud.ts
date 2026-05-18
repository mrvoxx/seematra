import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { v2 as cloudinary } from 'cloudinary';
import Itinerary from '../models/Itinerary';

// --- CONFIGURATION ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR = path.join(__dirname, 'images');

// Hand-picked reliable nature/mountain images
const SOURCE_IMAGES = [
  'https://picsum.photos/id/29/1000/800', 
  'https://picsum.photos/id/10/1000/800', 
  'https://picsum.photos/id/11/1000/800', 
  'https://picsum.photos/id/13/1000/800', 
  'https://picsum.photos/id/14/1000/800', 
  'https://picsum.photos/id/15/1000/800', 
  'https://picsum.photos/id/16/1000/800', 
  'https://picsum.photos/id/28/1000/800', 
  'https://picsum.photos/id/54/1000/800', 
  'https://picsum.photos/id/57/1000/800', 
];

async function downloadImage(url: string, filename: string): Promise<string> {
  const dest = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
  
  if (fs.existsSync(dest)) {
    console.log(`[Cache] Found local file: ${filename}`);
    return dest;
  }

  console.log(`[Download] Fetching ${filename}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  
  const fileStream = fs.createWriteStream(dest, { flags: 'wx' });
  // @ts-ignore - node fetch body is compatible with Readable
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
  return dest;
}

async function uploadToCloudinary(localPath: string): Promise<string> {
  console.log(`[Cloudinary] Uploading ${path.basename(localPath)}...`);
  const result = await cloudinary.uploader.upload(localPath, {
    folder: 'seematra/seed',
    use_filename: true,
  });
  return result.secure_url;
}

const SEED_ITINERARIES = [
  {
    title: "White Water Rush: Rishikesh Weekender",
    duration: "2 Days / 1 Night",
    tags: ["Rishikesh", "Rafting", "Camping"],
    genres: ["Adventure"],
    description: "16km River Rafting, Beach Camping, Bonfire. Perfect for adrenaline junkies and weekend warriors looking for a quick escape from the city.",
    price: 2499,
    isRecommended: true,
    active: true,
    mapCoords: { lat: 30.0869, lng: 78.2676 },
    vehicles: [{ name: "Tempo Traveller", capacity: 12 }],
  },
  {
    title: "The Adrenaline Junkie: Rafting & Bungee",
    duration: "3 Days / 2 Nights",
    tags: ["Rishikesh", "Bungee", "Extreme"],
    genres: ["Adventure"],
    description: "Experience India's highest bungee jump (83m), a massive Flying Fox, and navigate through 26km of extreme white water rapids.",
    price: 6999,
    isRecommended: false,
    active: true,
    mapCoords: { lat: 30.0869, lng: 78.2676 },
    vehicles: [{ name: "Tempo Traveller", capacity: 12 }],
  },
  {
    title: "Into the Wild: Riverside Camping & Trek",
    duration: "2 Days / 1 Night",
    tags: ["Camping", "Trekking", "Nature"],
    genres: ["Adventure"],
    description: "Stay in luxury Swiss tents along the Ganges, trek to the hidden Patna Waterfall, and enjoy a night of stargazing with acoustic music.",
    price: 3499,
    isRecommended: true,
    active: true,
    mapCoords: { lat: 30.12, lng: 78.32 },
    vehicles: [{ name: "Innova", capacity: 6 }],
  },
  {
    title: "Divine Haridwar: Ganga Aarti & Temples",
    duration: "2 Days / 1 Night",
    tags: ["Haridwar", "Spiritual", "Aarti"],
    genres: ["Spiritual"],
    description: "Experience VIP seating for the mesmerizing Ganga Aarti at Har Ki Pauri, and take the scenic ropeway to Mansa Devi and Chandi Devi.",
    price: 2999,
    isRecommended: true,
    active: true,
    mapCoords: { lat: 29.9457, lng: 78.1642 },
    vehicles: [{ name: "Sedan", capacity: 4 }],
  },
  {
    title: "Soul of the Ganges: Haridwar & Rishikesh",
    duration: "3 Days / 2 Nights",
    tags: ["Haridwar", "Rishikesh", "Ashram"],
    genres: ["Spiritual"],
    description: "The ultimate spiritual awakening. Experience deep meditation inside the ancient Vashishta Gufa and attend beautiful evening Aartis.",
    price: 5499,
    isRecommended: false,
    active: true,
    mapCoords: { lat: 29.9457, lng: 78.1642 },
    vehicles: [{ name: "Innova", capacity: 6 }],
  },
  {
    title: "Romantic Ganga Retreat",
    duration: "2 Days / 1 Night",
    tags: ["Couple", "Luxury", "Riverside"],
    genres: ["Couple"],
    description: "Check into a boutique riverside resort and enjoy a private candlelight dinner set up on a secluded white sand beach by the Ganges.",
    price: 5999,
    isRecommended: true,
    active: true,
    mapCoords: { lat: 30.0869, lng: 78.2676 },
    vehicles: [{ name: "Luxury Sedan", capacity: 4 }],
  },
  {
    title: "Cafes, Sunsets & Solitude",
    duration: "3 Days / 2 Nights",
    tags: ["Couple", "Cafes", "Sunset"],
    genres: ["Couple"],
    description: "Spend the afternoon hopping between aesthetic Tapovan cafes. Wake up early for a magical sunrise over the snow-capped Himalayas at Kunjapuri.",
    price: 7499,
    isRecommended: false,
    active: true,
    mapCoords: { lat: 30.0869, lng: 78.2676 },
    vehicles: [{ name: "Scooter Rental", capacity: 2 }],
  },
  {
    title: "Mountain Romance: Dehradun & Mussoorie",
    duration: "4 Days / 3 Nights",
    tags: ["Dehradun", "Mussoorie", "Nature"],
    genres: ["Couple"],
    description: "Aesthetic pine forests, hidden streams at Maldevta, and panoramic sunsets over the Doon Valley from George Everest.",
    price: 10999,
    isRecommended: true,
    active: true,
    mapCoords: { lat: 30.3165, lng: 78.0322 },
    vehicles: [{ name: "Innova Crysta", capacity: 6 }],
  },
  {
    title: "Haridwar Heritage Family Tour",
    duration: "2 Days / 1 Night",
    tags: ["Haridwar", "Family", "Heritage"],
    genres: ["Family"],
    description: "Comfortable transport, guided Aarti access, and a heritage food walk covering Mathura Walo Ki Pracheen Pedha and Chotiwala.",
    price: 3499,
    isRecommended: false,
    active: true,
    mapCoords: { lat: 29.9457, lng: 78.1642 },
    vehicles: [{ name: "Tempo Traveller", capacity: 12 }],
  },
  {
    title: "Complete Comfort: Haridwar, Rishikesh & Dehradun",
    duration: "4 Days / 3 Nights",
    tags: ["Family", "Premium", "Full Tour"],
    genres: ["Family"],
    description: "The ultimate family tour. Visit Parmarth Niketan, let the kids splash in Robber's Cave, and enjoy seamless premium SUV transfers.",
    price: 9999,
    isRecommended: true,
    active: true,
    mapCoords: { lat: 30.3165, lng: 78.0322 },
    vehicles: [{ name: "Premium SUV", capacity: 6 }],
  },
  {
    title: "The Solo Backpacker: Hostels & Cafes",
    duration: "2 Days / 1 Night",
    tags: ["Solo", "Hostel", "Backpacking"],
    genres: ["Solo"],
    description: "Join vibrant hostel walking tours, meet travelers from around the world, and enjoy live indie music nights by the river.",
    price: 1999,
    isRecommended: false,
    active: true,
    mapCoords: { lat: 30.0869, lng: 78.2676 },
    vehicles: [{ name: "Shared Transport", capacity: 1 }],
  },
  {
    title: "The Nomadic Explorer: Complete Freedom",
    duration: "5 Days / 4 Nights",
    tags: ["Solo", "Nomad", "Workation"],
    genres: ["Solo"],
    description: "Work from cafes overlooking the Ganges, meditate in silent caves, raft through rapids, and explore Dehradun on a rented bike.",
    price: 7999,
    isRecommended: true,
    active: true,
    mapCoords: { lat: 30.0869, lng: 78.2676 },
    vehicles: [{ name: "Scooter Rental", capacity: 1 }],
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('[DB] Connected. Purging old Itineraries...');
    await Itinerary.deleteMany({});

    // 1. Download & Upload images
    const cloudUrls: string[] = [];
    for (let i = 0; i < SOURCE_IMAGES.length; i++) {
      const localPath = await downloadImage(SOURCE_IMAGES[i], `unsplash_${i}.jpg`);
      const cloudUrl = await uploadToCloudinary(localPath);
      cloudUrls.push(cloudUrl);
    }

    console.log(`[Cloudinary] Successfully mapped ${cloudUrls.length} images.`);

    // 2. Build Models
    const docs = SEED_ITINERARIES.map((itin, i) => {
      // Pick a random image for the thumbnail
      const thumbnail = cloudUrls[i % cloudUrls.length];
      
      // Calculate realistic pricing tiers based on base price
      const pricingTiers = [
        { persons: 1, totalPrice: itin.price, vehicle: itin.vehicles[0].name },
        { persons: 2, totalPrice: Math.round(itin.price * 1.8), vehicle: itin.vehicles[0].name },
        { persons: 4, totalPrice: Math.round(itin.price * 3.2), vehicle: "Innova Crysta" },
        { persons: 6, totalPrice: Math.round(itin.price * 4.5), vehicle: "Tempo Traveller" },
      ];

      return {
        ...itin,
        thumbnail,
        pricingTiers,
        inclusions: ["Accommodation as per itinerary", "Breakfast and Dinner", "Local Guide", "Transfers"],
        exclusions: ["Flights/Train tickets", "Personal expenses", "Entry fees for monuments"],
        roadmap: [
          {
            day: 1,
            locationName: `Arrival in ${itin.tags[0]}`,
            coords: itin.mapCoords,
            image: cloudUrls[(i + 1) % cloudUrls.length],
            overview: "Check-in to your accommodation. Briefing and leisure time to explore the local surroundings."
          },
          {
            day: 2,
            locationName: "Core Experience Day",
            coords: itin.mapCoords,
            image: cloudUrls[(i + 2) % cloudUrls.length],
            overview: "Full day dedicated to the primary highlights of your chosen itinerary. See detailed inclusions."
          }
        ]
      };
    });

    await Itinerary.insertMany(docs);
    console.log(`✅ [DB] Successfully inserted ${docs.length} high-quality itineraries.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
