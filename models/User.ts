// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/types';

export interface UserDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  avatar?: string;
  role: UserRole;
  pushSubscriptions: any[];
  favoriteItineraries: mongoose.Types.ObjectId[];
  favoriteBlogs: mongoose.Types.ObjectId[];
  preferences: {
    theme: string;
    language: string;
  };
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Phone is optional but UNIQUE — one account per phone number
    phone: { type: String, trim: true, sparse: true, unique: true, default: undefined },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    pushSubscriptions: [{ type: Schema.Types.Mixed }], // Store Web Push endpoint subscriptions
    favoriteItineraries: [{ type: Schema.Types.ObjectId, ref: 'Itinerary' }],
    favoriteBlogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    preferences: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'english' }
    }
  },
  { timestamps: true },
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>('User', UserSchema);

export default User;
