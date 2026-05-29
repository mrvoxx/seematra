import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb';

async function removePseoData() {
  try {
    await connectDB();
    console.log('Connected to MongoDB.');

    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error("Database not connected");
    }

    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));

    if (collections.some(c => c.name === 'pseo_pages' || c.name === 'pseo_seeds')) {
      for (const collName of ['pseo_pages', 'pseo_seeds']) {
        if (collections.some(c => c.name === collName)) {
          await db.dropCollection(collName);
          console.log(`Dropped collection: ${collName}`);
        }
      }
    } else {
      console.log('No pseo collections found.');
    }

    // Optionally check blogs that look like PSEO 
    const blogsCollection = db.collection('blogs');
    const pseoBlogs = await blogsCollection.find({ 
      $or: [
        { tags: 'pseo' },
        { isPseo: true }, 
        { author: 'Programmatic' }
      ] 
    }).toArray();
    
    if (pseoBlogs.length > 0) {
      console.log(`Found ${pseoBlogs.length} PSEO blogs. Deleting...`);
      await blogsCollection.deleteMany({ 
        $or: [
          { tags: 'pseo' },
          { isPseo: true }, 
          { author: 'Programmatic' }
        ] 
      });
      console.log('Deleted PSEO blogs.');
    } else {
      console.log('No PSEO-specific blogs found via tags/author heuristics.');
    }

    console.log('Cleanup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up PSEO data:', error);
    process.exit(1);
  }
}

removePseoData();
