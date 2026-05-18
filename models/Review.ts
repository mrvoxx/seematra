// models/Review.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ReviewDocument extends Document {
  user?: mongoose.Types.ObjectId;
  itinerary?: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  isHidden: boolean;
  isHighlighted: boolean;
  helpfulCount: number;
  helpfulVoters: mongoose.Types.ObjectId[];
  tripDate?: Date;
  sentimentScore?: number;
  // For admin-added reviews (not tied to a real booking)
  userName?: string;
  userLocation?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    user:      { type: Schema.Types.ObjectId, ref: 'User', index: true },
    itinerary: { type: Schema.Types.ObjectId, ref: 'Itinerary' },
    booking:   { type: Schema.Types.ObjectId, ref: 'Booking' },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    title:     { type: String, required: true, maxlength: 100, trim: true },
    comment:   { type: String, required: true, maxlength: 1000, trim: true },
    images:    [{ type: String }],
    isVerified:    { type: Boolean, default: true },
    isHidden:      { type: Boolean, default: false },
    isHighlighted: { type: Boolean, default: false },
    helpfulCount:  { type: Number, default: 0 },
    helpfulVoters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tripDate:       { type: Date },
    sentimentScore: { type: Number },
    // Admin-created reviews fields
    userName:     { type: String, trim: true },
    userLocation: { type: String, trim: true },
  },
  { timestamps: true },
);

// Compound index for sorted fetches per itinerary
ReviewSchema.index({ itinerary: 1, createdAt: -1 });
// Unique constraint: one review per user per itinerary
ReviewSchema.index({ user: 1, itinerary: 1 }, { unique: true });

const Review: Model<ReviewDocument> =
  mongoose.models.Review ?? mongoose.model<ReviewDocument>('Review', ReviewSchema);

export default Review;
