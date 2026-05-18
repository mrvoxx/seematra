import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Itinerary from '../models/Itinerary';
import Blog from '../models/Blog';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable inside .env.local');

const ITIN_IMAGES = [
  'https://images.unsplash.com/photo-1626621341517-bbf3e9990b2c?q=80&w=1000',
  'https://images.unsplash.com/photo-1548777123-e216912df7d8?q=80&w=1000',
  'https://images.unsplash.com/photo-1598324789736-4861f89564a0?q=80&w=1000',
  'https://images.unsplash.com/photo-1605640840482-d548bc55a1b8?q=80&w=1000',
  'https://images.unsplash.com/photo-1517427677506-ade074eb1432?q=80&w=1000',
  'https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?q=80&w=1000',
];

const BLOG_IMAGES = [
  'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000',
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=1000',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000',
  'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=1000',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1000',
];

const randElem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

const DESTINATIONS = [
  { name: 'Kedarnath', lat: 30.7352, lng: 79.0669, genre: 'Spiritual', tag: 'Pilgrimage' },
  { name: 'Badrinath', lat: 30.7433, lng: 79.4938, genre: 'Spiritual', tag: 'Pilgrimage' },
  { name: 'Auli', lat: 30.5333, lng: 79.5667, genre: 'Adventure', tag: 'Skiing' },
  { name: 'Rishikesh', lat: 30.0869, lng: 78.2676, genre: 'Spiritual', tag: 'Yoga' },
  { name: 'Valley of Flowers', lat: 30.7289, lng: 79.5966, genre: 'Trekking', tag: 'Nature' },
  { name: 'Nainital', lat: 29.3919, lng: 79.4542, genre: 'Family', tag: 'Lakes' },
  { name: 'Mussoorie', lat: 30.4598, lng: 78.0664, genre: 'Couple', tag: 'Hills' },
  { name: 'Jim Corbett', lat: 29.5300, lng: 78.7747, genre: 'Wildlife', tag: 'Safari' },
  { name: 'Tungnath', lat: 30.4889, lng: 79.2167, genre: 'Trekking', tag: 'Shiva' },
  { name: 'Haridwar', lat: 29.9457, lng: 78.1642, genre: 'Spiritual', tag: 'Ganga' },
  { name: 'Chopta', lat: 30.4494, lng: 79.1824, genre: 'Adventure', tag: 'MiniSwitzerland' },
  { name: 'Kausani', lat: 29.8447, lng: 79.5989, genre: 'Couple', tag: 'Himalayas' },
  { name: 'Ranikhet', lat: 29.6434, lng: 79.4322, genre: 'Family', tag: 'Meadows' },
  { name: 'Mukteshwar', lat: 29.4727, lng: 79.6467, genre: 'Couples', tag: 'Apples' }, // Mapping 'Couples' to valid? Mongoose enum says 'Couple'
  { name: 'Dayara Bugyal', lat: 30.8252, lng: 78.6366, genre: 'Trekking', tag: 'Meadows' },
  { name: 'Munsiyari', lat: 30.0768, lng: 80.2335, genre: 'Adventure', tag: 'Glaciers' },
  { name: 'Lansdowne', lat: 29.8377, lng: 78.6871, genre: 'Couple', tag: 'Pines' },
  { name: 'Dhanaulti', lat: 30.4284, lng: 78.2435, genre: 'Family', tag: 'Snow' },
  { name: 'Pithoragarh', lat: 29.5829, lng: 80.2182, genre: 'Adventure', tag: 'Valleys' },
  { name: 'Almora', lat: 29.5971, lng: 79.6591, genre: 'Solo', tag: 'Heritage' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI!);
    await User.deleteMany({});
    await Itinerary.deleteMany({});
    await Blog.deleteMany({});

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Seematra Admin', email: 'admin@seematra.com', password: hashedPassword, role: 'admin' });
    await User.create({ name: 'Jane Traveler', email: 'jane@example.com', password: hashedPassword, role: 'user' });

    // Generate 20 Itineraries
    const itineraries = DESTINATIONS.map((dest, i) => {
      // Fix genre to match Schema strictly: 'Adventure','Spiritual','Family','Couple','Solo','Luxury','Wildlife','Trekking'
      const validGenre = ['Adventure','Spiritual','Family','Couple','Solo','Luxury','Wildlife','Trekking'].includes(dest.genre) ? dest.genre : 'Adventure';
      
      return {
        title: `${dest.name} Discovery – A Majestic ${validGenre} Journey`,
        duration: `${randInt(3, 8)} Days / ${randInt(2, 7)} Nights`,
        tags: [dest.name, dest.tag, 'Uttarakhand', validGenre],
        genres: [validGenre],
        description: `<p>Experience the divine aura and spectacular majesty of ${dest.name}. Prepare for breathtaking altitude, culturally rich heritages, and deeply peaceful sanctuaries. This fully curated package ensures all logistics are handled.</p><br><p>Perfect for ${validGenre.toLowerCase()} seekers.</p>`,
        price: randInt(10000, 45000),
        thumbnail: randElem(ITIN_IMAGES),
        vehicles: [{ name: 'Innova Crysta / SUV', capacity: 6 }],
        mapCoords: { lat: dest.lat, lng: dest.lng },
        isRecommended: i < 6,
        active: true,
        roadmap: [
          { 
            day: 1, 
            locationName: `Departing to ${dest.name}`, 
            coords: { lat: 30.3165, lng: 78.0322 }, 
            image: randElem(ITIN_IMAGES), 
            overview: `Arrival at Dehradun or Haridwar. Proceed by cab to ${dest.name}.` 
          },
          { 
            day: 2, 
            locationName: `Exploring ${dest.tag} around ${dest.name}`, 
            coords: { lat: dest.lat, lng: dest.lng }, 
            image: randElem(ITIN_IMAGES), 
            overview: `A complete full-day immersion traversing the key landmarks of this magnificent locale.` 
          }
        ]
      }
    });

    await Itinerary.insertMany(itineraries);

    // Generate 20 Blogs
    const blogs = Array.from({ length: 20 }).map((_, i) => ({
      title: `The Ultimate Guide to ${DESTINATIONS[i].name} - ${DESTINATIONS[i].genre} Edition`,
      slug: `ultimate-guide-${DESTINATIONS[i].name.toLowerCase().replace(/ /g, '-')}`,
      content: `<p>Uttarakhand holds many secrets, but ${DESTINATIONS[i].name} stands completely apart. If you love ${DESTINATIONS[i].tag}, then you must read the following crucial tips before booking your trip.</p><ul><li>Pack heavy woolens depending on the altitude.</li><li>Always carry sufficient cash.</li><li>Respect the local mountain ecology.</li></ul>`,
      thumbnail: randElem(BLOG_IMAGES),
      tags: [DESTINATIONS[i].name, 'Guide', 'Travel Tips'],
      author: 'Seematra Editorial',
      isRecommended: i % 3 === 0,
    }));

    await Blog.insertMany(blogs);

    console.log('✅ Injected 20 Unique Itineraries and 20 Blogs!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
