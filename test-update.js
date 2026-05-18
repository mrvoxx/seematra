require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  
  const b = await Blog.findOne({}).sort({ updatedAt: -1 });
  console.log("Current blog:", b.title, b.videoUrl);
  
  await Blog.updateOne({ _id: b._id }, { $set: { videoUrl: "https://www.instagram.com/reel/C2Pq/" } });
  console.log("Updated videoUrl to test!");
  
  process.exit(0);
}

main();
