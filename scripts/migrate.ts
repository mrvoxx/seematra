import mongoose from 'mongoose';
import Itinerary from '../models/Itinerary';
import Blog from '../models/Blog';
import User from '../models/User';

const LOCAL_URI = 'mongodb://localhost:27017/seematra-ota';
const ATLAS_URI = 'mongodb+srv://seematra:Dangwal%40123@seematra.wenay6h.mongodb.net/seematra?retryWrites=true&w=majority&appName=seematra';

async function migrateData() {
  console.log('Connecting to Local DB...');
  const localDb = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('Connected to Local DB.');

  console.log('Connecting to Atlas DB...');
  const atlasDb = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('Connected to Atlas DB.');

  // Register models on both connections
  const LocalItinerary = localDb.model('Itinerary', Itinerary.schema);
  const AtlasItinerary = atlasDb.model('Itinerary', Itinerary.schema);

  const LocalBlog = localDb.model('Blog', Blog.schema);
  const AtlasBlog = atlasDb.model('Blog', Blog.schema);

  const LocalUser = localDb.model('User', User.schema);
  const AtlasUser = atlasDb.model('User', User.schema);

  try {
    console.log('Fetching Itineraries from Local DB...');
    const itineraries = await LocalItinerary.find().lean();
    console.log(`Found ${itineraries.length} itineraries. Migrating...`);
    if (itineraries.length > 0) {
      await AtlasItinerary.deleteMany({}); // clear existing
      await AtlasItinerary.insertMany(itineraries);
      console.log('Itineraries migrated successfully.');
    }

    console.log('Fetching Blogs from Local DB...');
    const blogs = await LocalBlog.find().lean();
    console.log(`Found ${blogs.length} blogs. Migrating...`);
    if (blogs.length > 0) {
      await AtlasBlog.deleteMany({});
      await AtlasBlog.insertMany(blogs);
      console.log('Blogs migrated successfully.');
    }

    console.log('Fetching Users from Local DB...');
    const users = await LocalUser.find().lean();
    console.log(`Found ${users.length} users. Migrating...`);
    if (users.length > 0) {
      await AtlasUser.deleteMany({});
      await AtlasUser.insertMany(users);
      console.log('Users migrated successfully.');
    }

    console.log('Migration Complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await localDb.close();
    await atlasDb.close();
    process.exit(0);
  }
}

migrateData();
