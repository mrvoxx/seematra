// models/OtpVerification.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface OtpVerificationDocument extends Document {
  phone: string;
  otp: string;       // bcrypt-hashed OTP — NEVER stored in plaintext
  expiresAt: Date;   // 10-minute TTL, enforced by MongoDB TTL index
  attempts: number;  // Max 3 wrong attempts before lockout
  verified: boolean;
  createdAt: Date;
}

const OtpVerificationSchema = new Schema<OtpVerificationDocument>(
  {
    phone:     { type: String, required: true, index: true },
    otp:       { type: String, required: true }, // bcrypt hashed
    expiresAt: { type: Date,   required: true },
    attempts:  { type: Number, default: 0 },
    verified:  { type: Boolean, default: false },
  },
  { timestamps: true },
);

// MongoDB TTL index — automatically deletes expired OTP documents
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast lookup
OtpVerificationSchema.index({ phone: 1, expiresAt: 1, verified: 1 });

const OtpVerification: Model<OtpVerificationDocument> =
  mongoose.models.OtpVerification ??
  mongoose.model<OtpVerificationDocument>('OtpVerification', OtpVerificationSchema);

export default OtpVerification;
