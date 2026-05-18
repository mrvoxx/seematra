import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import User from '../models/User';

async function fixUsers() {
  await mongoose.connect(process.env.MONGODB_URI!);
  await User.deleteMany({});
  await User.create({ name: 'Seematra Admin', email: 'admin@seematra.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'Jane Traveler', email: 'jane@example.com', password: 'admin123', role: 'user' });
  console.log('✅ Users reset with correct single-hashing!');
  process.exit(0);
}
fixUsers();
