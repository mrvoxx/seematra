import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { v2 as cloudinary } from 'cloudinary';
import Blog from '../models/Blog';

// --- CONFIGURATION ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR = path.join(__dirname, 'images');

// Reliable Picsum IDs for Blog Thumbnails (mix of nature, cafes, lifestyle)
const SOURCE_IMAGES = [
  'https://picsum.photos/id/1011/1000/600', // Lake/Nature
  'https://picsum.photos/id/1015/1000/600', // River/Valley
  'https://picsum.photos/id/1016/1000/600', // Mountains
  'https://picsum.photos/id/1018/1000/600', // Path/Trek
  'https://picsum.photos/id/1020/1000/600', // Bear/Wildlife
  'https://picsum.photos/id/1025/1000/600', // Dog in blanket (cozy/cafe)
  'https://picsum.photos/id/1026/1000/600', // Abstract nature
  'https://picsum.photos/id/1036/1000/600', // Snow mountains
  'https://picsum.photos/id/1039/1000/600', // Waterfall
  'https://picsum.photos/id/1043/1000/600', // Trees/Nature
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
  // @ts-ignore
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
  return dest;
}

async function uploadToCloudinary(localPath: string): Promise<string> {
  console.log(`[Cloudinary] Uploading ${path.basename(localPath)}...`);
  const result = await cloudinary.uploader.upload(localPath, {
    folder: 'seematra/seed/blogs',
    use_filename: true,
  });
  return result.secure_url;
}

// 12 of the generated blogs with formatted HTML content
const SEED_BLOGS = [
  {
    title: "The Ultimate 2 Day Rishikesh Trip for Couples",
    slug: "rishikesh-trip-couples-romantic-getaway",
    tags: ["Rishikesh", "Couple", "Romantic"],
    author: "Seematra Experts",
    content: `
      <p>When you think of Rishikesh, adventure and spirituality often come to mind. But nestled along the banks of the turquoise Ganges lies a deeply romantic side of this Himalayan town.</p>
      <h3>The Itinerary</h3>
      <p><strong>Day 1: Arrival & Riverside Serenity</strong><br/>Check into a luxury Swiss tent or boutique resort in Tapovan. Spend the afternoon café hopping—Little Buddha Cafe offers stunning river views. In the evening, take a quiet walk across the beautifully illuminated Lakshman Jhula.</p>
      <p><strong>Day 2: Sunsets & Stargazing</strong><br/>Wake up early for a scooter ride to Kunjapuri Temple to witness a magical Himalayan sunrise. After breakfast, head to Neer Garh Waterfall for a secluded nature dip. End your trip with a private candle-light dinner by the Ganges before heading home.</p>
      <h3>Cost Estimate</h3>
      <p>Budget: ₹6,000 | Mid: ₹12,000 | Premium: ₹25,000+</p>
    `,
  },
  {
    title: "3 Day Haridwar Spiritual Journey: The Ultimate Pilgrimage",
    slug: "haridwar-spiritual-journey-pilgrimage",
    tags: ["Haridwar", "Spiritual", "Aarti"],
    author: "Seematra Experts",
    content: `
      <p>Haridwar translates to "Gateway to God," and the moment you step foot here, you feel it. The chanting of priests, the scent of incense, and the chilling, pure waters of the Ganges create an atmosphere unlike anywhere else on earth.</p>
      <h3>The Itinerary</h3>
      <p><strong>Day 1: The Holy Dip & Maha Aarti</strong><br/>Arrive and check into your hotel. Head to Har Ki Pauri for a holy dip. In the evening, secure a good spot by 5:00 PM for the mesmerizing Ganga Aarti.</p>
      <p><strong>Day 2: The Ropeway to the Goddesses</strong><br/>Take the Udankhatola to Mansa Devi Temple. Post lunch, visit the Chandi Devi Temple. Spend the evening wandering the colorful Moti Bazaar.</p>
      <p><strong>Day 3: Ancient Heritage & Departure</strong><br/>Visit the Daksha Mahadev Temple, one of the oldest in the region. Enjoy a hearty breakfast of local Aloo Puri at Mohan Ji Puri Wale before departing.</p>
      <h3>Travel Tips</h3>
      <p>Beware of touts offering "special pujas" at exorbitant prices. Wear modest clothing when visiting temples.</p>
    `,
  },
  {
    title: "The Ultimate 5 Day Uttarakhand Adventure Trip",
    slug: "uttarakhand-adventure-trip-rafting-bungee",
    tags: ["Adventure", "Rafting", "Bungee"],
    author: "Ashwin Dangwal",
    content: `
      <p>If your idea of a vacation involves racing heartbeats and conquering fears, Uttarakhand is your playground. From the raging rapids of the Ganges to the towering cliffs of the Shivaliks, this 5-day adventure is not for the faint-hearted.</p>
      <h3>The Itinerary</h3>
      <p><strong>Day 1: Basecamp Rishikesh</strong><br/>Arrive in Rishikesh and head straight to your riverside adventure camp in Shivpuri. Enjoy an evening of beach volleyball and bonfire music.</p>
      <p><strong>Day 2: White Water Rush</strong><br/>Gear up for a thrilling 26km river rafting expedition from Marine Drive to Nim Beach. Experience Grade III+ rapids like 'The Wall' and 'Roller Coaster'.</p>
      <p><strong>Day 3: The Leap of Faith</strong><br/>Head to Jumpin Heights. Experience India’s highest Bungee Jump (83 meters) and the massive Giant Swing.</p>
      <p><strong>Day 4: Jungle Trekking</strong><br/>Leave the waters and hit the trails. Trek to the remote Garud Chatti waterfall, followed by an overnight jungle survival camp experience.</p>
      <p><strong>Day 5: Dehradun Cave Exploration</strong><br/>Drive to Dehradun. Wade through the knee-deep waters of Robber's Cave (Guchhupani) before heading home.</p>
    `,
  },
  {
    title: "Solo Backpacking in Rishikesh: A 3-Day Guide to Freedom",
    slug: "solo-backpacking-rishikesh-guide",
    tags: ["Solo", "Hostels", "Backpacking"],
    author: "Seematra Experts",
    content: `
      <p>There is something incredibly liberating about traveling alone, and Rishikesh is arguably the best place in India to do it. It’s a melting pot of global travelers, yogis, and digital nomads.</p>
      <h3>The Itinerary</h3>
      <p><strong>Day 1: Hostels & Heritage</strong><br/>Check into a backpacker hostel in Tapovan. Spend the afternoon walking through the iconic Beatles Ashram, capturing the incredible street art.</p>
      <p><strong>Day 2: Cafes & Connections</strong><br/>Start with a drop-in morning yoga class. Spend the day working or reading at a riverside cafe. In the evening, join your hostel mates for a sunset jam session at the ghats.</p>
      <p><strong>Day 3: The Offbeat Waterfall</strong><br/>Rent a scooter and drive up the winding roads to Patna Waterfall. It’s less crowded and perfect for a solo meditation session before you pack your bags.</p>
    `,
  },
  {
    title: "4 Day Family Trip to Dehradun and Mussoorie",
    slug: "family-trip-dehradun-mussoorie",
    tags: ["Family", "Dehradun", "Mussoorie"],
    author: "Seematra Experts",
    content: `
      <p>Traveling with family requires a delicate balance—activities for the kids, relaxation for the parents, and comfort for the elderly. A combined trip to Dehradun and Mussoorie offers exactly that.</p>
      <h3>The Itinerary</h3>
      <p><strong>Day 1: Arrival in the Doon Valley</strong><br/>Arrive in Dehradun. Take the kids to the Malsi Deer Park (Dehradun Zoo) for a relaxed afternoon. Enjoy dinner at the famous Rajpur Road.</p>
      <p><strong>Day 2: Caves and Monasteries</strong><br/>Visit the breathtaking Mindroling Tibetan Monastery. Post lunch, head to Robber's Cave where the kids will love wading through the natural river cave.</p>
      <p><strong>Day 3: Up to the Queen of Hills</strong><br/>Hire a comfortable SUV and drive up to Mussoorie (1.5 hours). Check into your hotel and take an evening stroll down Mall Road.</p>
      <p><strong>Day 4: Kempty Falls & Departure</strong><br/>Visit the iconic Kempty Falls in the morning. After a lovely family lunch at Landour Bakehouse, begin your descent to the airport/station.</p>
    `,
  },
  {
    title: "How to Plan a Weekend Trip to Rishikesh Under ₹5000",
    slug: "budget-weekend-trip-rishikesh",
    tags: ["Budget", "Rishikesh", "Weekend"],
    author: "Seematra Experts",
    content: `
      <p>Traveling on a tight budget? Learn how to experience the best of Rishikesh, from ashrams to waterfalls, without breaking the bank.</p>
      <h3>Budget Breakdown</h3>
      <p><strong>Transport:</strong> Take a local state bus from Delhi to Rishikesh (approx. ₹300-500 one way).</p>
      <p><strong>Accommodation:</strong> Stay in dormitories in Tapovan. Standard beds range from ₹300-₹500 per night.</p>
      <p><strong>Food:</strong> Eat at the community Langar in Geeta Bhawan for free/donation, or enjoy street-side dhabas for under ₹150 per meal.</p>
      <p><strong>Activities:</strong> Triveni Ghat evening Aarti is completely free. Hiking to Neer Waterfall costs just ₹50 for entry. Walking across Ram Jhula and exploring the river banks costs absolutely nothing!</p>
    `,
  },
  {
    title: "The Ultimate Dehradun Travel Guide for Cafe Lovers",
    slug: "dehradun-cafe-hopping-guide",
    tags: ["Dehradun", "Cafes", "Leisure"],
    author: "Ashwin Dangwal",
    content: `
      <p>Discover the aesthetic side of the Doon Valley. Dehradun is rapidly becoming the cafe capital of the hills, offering everything from quaint bakeries to luxurious rooftop lounges.</p>
      <h3>Top Recommendations</h3>
      <p><strong>1. Orchard:</strong> Nestled in Rajpur, this place offers the best Tibetan/Thai food with an incredible view of the valley.</p>
      <p><strong>2. Kalsang AMA Cafe:</strong> Known for its amazing aesthetic and lip-smacking momos.</p>
      <p><strong>3. Ellora's Melting Moments:</strong> You cannot leave Dehradun without trying their famous stick-jaws and plum cake.</p>
      <p><strong>4. First Gear Cafe:</strong> Situated on a steep incline towards Mussoorie, offering the best Maggi and sunset views.</p>
    `,
  },
  {
    title: "River Rafting and Camping: A 2-Day Rishikesh Thrill",
    slug: "river-rafting-camping-rishikesh",
    tags: ["Rishikesh", "Rafting", "Camping"],
    author: "Seematra Experts",
    content: `
      <p>The classic Rishikesh weekend. Plan your 2-day rafting and beach camping trip with our expert adventure guide.</p>
      <h3>The Thrill of the Rapids</h3>
      <p>The 16km stretch from Shivpuri to Nim Beach is the most popular route. You will encounter famous Grade III rapids like 'Return to Sender' and 'Roller Coaster'. The feeling of plunging into the icy cold waves is unmatched.</p>
      <h3>Beach Camping Magic</h3>
      <p>After a day on the river, nothing beats sitting by a bonfire on a white sand river beach, listening to acoustic music, and staring up at a sky full of stars.</p>
    `,
  },
  {
    title: "Dehradun Travel Guide: A 3-Day Heritage Trail",
    slug: "dehradun-heritage-trail-guide",
    tags: ["Dehradun", "Heritage", "History"],
    author: "Seematra Experts",
    content: `
      <p>Look beyond the cafes. Discover colonial architecture, ancient temples, and historical institutes in this 3-day Dehradun itinerary.</p>
      <h3>Historical Highlights</h3>
      <p><strong>Forest Research Institute (FRI):</strong> This massive Greco-Roman structure is larger than the Buckingham Palace. It houses 6 incredible museums detailing the flora and fauna of the Himalayas.</p>
      <p><strong>Tapkeshwar Temple:</strong> An ancient Shiva temple situated in a natural cave where water continuously drops onto the Shivalinga.</p>
      <p><strong>Mindroling Monastery:</strong> Established in 1965, it is one of the largest Buddhist centers in India, featuring a massive 220-foot high Stupa.</p>
    `,
  },
  {
    title: "3-Day Monsoon Magic in Dehradun & Surrounds",
    slug: "monsoon-magic-dehradun",
    tags: ["Dehradun", "Monsoon", "Nature"],
    author: "Ashwin Dangwal",
    content: `
      <p>Dehradun comes alive in the rains! Explore lush green valleys and raging waterfalls in this 3-day monsoon travel guide.</p>
      <h3>Why the Monsoon?</h3>
      <p>While many avoid the hills during the rains, the Doon Valley turns into an emerald paradise. The clouds descend onto the streets, and hidden streams emerge in every corner.</p>
      <h3>Must-Do Activities</h3>
      <p>Take a slow drive up to Maldevta, an area known for its pristine river streams. Sit by the balcony of a cozy cafe on Rajpur Road with a hot cup of tea and a plate of Pakoras. Just beware of leeches if you decide to go deep into the jungle trails!</p>
    `,
  }
];

async function seedBlogs() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('[DB] Connected. Purging old Blogs...');
    await Blog.deleteMany({});

    // 1. Download & Upload images
    const cloudUrls: string[] = [];
    for (let i = 0; i < SOURCE_IMAGES.length; i++) {
      const localPath = await downloadImage(SOURCE_IMAGES[i], `blog_seed_${i}.jpg`);
      const cloudUrl = await uploadToCloudinary(localPath);
      cloudUrls.push(cloudUrl);
    }

    console.log(`[Cloudinary] Successfully mapped ${cloudUrls.length} blog images.`);

    // 2. Build Models
    const docs = SEED_BLOGS.map((blog, i) => {
      // Pick a random image for the thumbnail
      const thumbnail = cloudUrls[i % cloudUrls.length];

      return {
        ...blog,
        thumbnail,
        isRecommended: i < 4, // Make first 4 featured
        publishedAt: new Date(Date.now() - i * 86400000), // Stagger publish dates
      };
    });

    await Blog.insertMany(docs);
    console.log(`✅ [DB] Successfully inserted ${docs.length} high-quality SEO blogs.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedBlogs();
