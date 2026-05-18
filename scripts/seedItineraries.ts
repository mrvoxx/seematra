// scripts/seedItineraries.ts
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables so we can connect to MongoDB
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string, {
    bufferCommands: false,
  });
}

// Minimal Itinerary Schema for Seeding
const RoadmapPointSchema = new mongoose.Schema({
  day: Number, locationName: String, coords: { lat: Number, lng: Number },
  image: String, overview: String, nightStay: { image: String, description: String }
}, { _id: false });

const VehicleSchema = new mongoose.Schema({
  name: String, image: String, capacity: Number
}, { _id: false });

const HotelSchema = new mongoose.Schema({
  name: String, rating: String, images: [String], description: String, contactNumber: String
}, { _id: false });

const ItinerarySchema = new mongoose.Schema({
  title: String, duration: String, tags: [String], genres: [String], description: String,
  price: Number, thumbnail: String, video: String, vehicles: [VehicleSchema],
  inclusions: [String], hotels: [HotelSchema], roadmap: [RoadmapPointSchema],
  mapCoords: { lat: Number, lng: Number }, isRecommended: Boolean, active: Boolean
}, { timestamps: true });

const Itinerary = mongoose.models.Itinerary || mongoose.model('Itinerary', ItinerarySchema);

// Dummy Images tailored for Uttarakhand
const IMAGES = {
  kedarnath: "https://images.unsplash.com/photo-1626307416562-ee839676f5fc?auto=format&fit=crop&q=80&w=1200",
  badrinath: "https://images.unsplash.com/photo-1626307416562-ee839676f5fc?auto=format&fit=crop&q=80&w=1200", // fallback
  nainital: "https://images.unsplash.com/photo-1596706981881-229d4791ea03?auto=format&fit=crop&q=80&w=1200",
  auli: "https://images.unsplash.com/photo-1610214349372-8800bd8dffe7?auto=format&fit=crop&q=80&w=1200",
  corbett: "https://images.unsplash.com/photo-1613274554329-80f8b301cd37?auto=format&fit=crop&q=80&w=1200",
  rishikesh: "https://images.unsplash.com/photo-1591544371754-0eb6aab43cb3?auto=format&fit=crop&q=80&w=1200",
  hotel: "https://images.unsplash.com/photo-1542314831-c6a4d14d8376?auto=format&fit=crop&q=80&w=1200",
  vehicle: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200"
};

const DUMMY_DATA = Array.from({ length: 20 }).map((_, i) => {
  const destinations = [
    { n: "Kedarnath Spiritual Trek", lat: 30.7352, lng: 79.0669, img: IMAGES.kedarnath, genre: "Spiritual" },
    { n: "Nainital Lake Retreat", lat: 29.3919, lng: 79.4542, img: IMAGES.nainital, genre: "Family" },
    { n: "Auli Snow Adventure", lat: 30.5333, lng: 79.5667, img: IMAGES.auli, genre: "Adventure" },
    { n: "Jim Corbett Wildlife Safari", lat: 29.5300, lng: 78.7747, img: IMAGES.corbett, genre: "Wildlife" },
    { n: "Rishikesh Yoga & Rafting", lat: 30.0869, lng: 78.2676, img: IMAGES.rishikesh, genre: "Adventure" }
  ];
  
  const dest = destinations[i % destinations.length];
  const isFeatured = i % 4 === 0;

  return {
    title: `${dest.n} - Complete Guided Tour ${i + 1}`,
    duration: `${(i % 5) + 3} Days / ${(i % 5) + 2} Nights`,
    tags: [dest.genre.toLowerCase(), "uttarakhand", "himalayas", "nature", "tour"],
    genres: [dest.genre, "Nature"],
    description: `<h3>Experience the Magic of the Himalayas</h3><p>This ${dest.n} package is meticulously crafted to give you the ultimate ${dest.genre.toLowerCase()} experience. From deep valleys to high snow peaks, explore the unparalleled beauty of Uttarakhand with expert local guides.</p><p>We have arranged the finest bespoke accommodations, luxury transportation, and curated off-beat stops to ensure you have a lifetime worth of memories.</p>`,
    price: 15000 + (i * 2000), // Randomize price ranging from 15k to 55k
    thumbnail: dest.img,
    video: isFeatured ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : "",
    vehicles: [
      { name: "Luxury Innova Crysta", capacity: 6, image: IMAGES.vehicle },
      { name: "Tempo Traveller", capacity: 12, image: IMAGES.vehicle }
    ],
    inclusions: [
      "Daily Breakfast & Dinner",
      "Welcome Drink on Arrival",
      "Dedicated Tour Guide (English/Hindi)",
      "Premium AC Transportation",
      "24/7 On-Trip Assistance",
      "All necessary Forest/Trek Permits"
    ],
    hotels: [
      {
        name: `The Grand ${dest.n.split(' ')[0]} Resort`,
        rating: isFeatured ? "5 Star Premium" : "4 Star Boutique",
        images: [IMAGES.hotel],
        description: "Wake up to breathtaking mountain views. Our resorts guarantee absolute comfort with heated bedding, authentic local cuisine restaurants, and pristine hygiene standards.",
        contactNumber: "+91 98765 43210" // Admin only
      }
    ],
    roadmap: Array.from({ length: (i % 5) + 3 }).map((_, dayIndex) => ({
      day: dayIndex + 1,
      locationName: dayIndex === 0 ? `Arrival at ${dest.n.split(' ')[0]}` : dayIndex === 1 ? `Local Sightseeing at ${dest.n.split(' ')[0]}` : `Exploration & Departure`,
      coords: { lat: dest.lat + (dayIndex * 0.01), lng: dest.lng + (dayIndex * 0.01) },
      image: dest.img,
      overview: `On Day ${dayIndex + 1}, you will be taken to explore the deep secrets of ${dest.n}. The journey is comfortable, allowing scenic photography breaks and authentic culinary experiences. End the day relaxing at the designated campsite or premium hotel lounge.`,
    })),
    mapCoords: { lat: dest.lat, lng: dest.lng },
    isRecommended: isFeatured,
    active: true
  };
});

async function runSeed() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected. Clearing old itineraries...');
    await Itinerary.deleteMany({});
    
    console.log(`Inserting ${DUMMY_DATA.length} detailed itineraries...`);
    const result = await Itinerary.insertMany(DUMMY_DATA);
    console.log(`Success! Inserted ${result.length} records.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

runSeed();
