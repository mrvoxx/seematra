// models/Blog.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface BlogDocument extends Document {
  title: string;
  slug: string;
  content?: string;
  thumbnail: string;
  tags: string[];
  author: string;
  isRecommended: boolean;
  publishedAt: Date;
  createdAt: Date;
  videoUrl?: string; // link to Instagram Reel or Facebook Video
  relatedItinerary?: mongoose.Types.ObjectId; // link to an itinerary for roadmap + CTA
  sections?: {
    header?: string;
    paragraph?: string;
    image?: string;
  }[];
  faqs?: {
    question: string;
    answer: string;
  }[];
}

const BlogSchema = new Schema<BlogDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: false },
    thumbnail: { type: String, required: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    author: { type: String, default: 'Seematra Team' },
    isRecommended: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: Date.now },
    videoUrl: { type: String, required: false },
    relatedItinerary: { type: Schema.Types.ObjectId, ref: 'Itinerary', default: null },
    faqs: [{
      question: { type: String },
      answer: { type: String },
    }],
  },
  { timestamps: true },
);

BlogSchema.index({ title: 'text', tags: 'text' });

const Blog: Model<BlogDocument> =
  mongoose.models.Blog ?? mongoose.model<BlogDocument>('Blog', BlogSchema);

export default Blog;
