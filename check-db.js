require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false,
  });

  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  
  const blogs = await Blog.find({}).sort({ updatedAt: -1 }).limit(3);
  console.log(blogs.map(b => ({ title: b.title, videoUrl: b.videoUrl })));
  
  process.exit(0);
}

main();
