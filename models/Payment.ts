// models/Payment.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentStage = 'initial' | 'balance';
export type PaymentModeRecord = 'full' | 'advance_40' | 'reservation_500' | 'balance' | 'direct';

export interface PaymentDocument extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;       // Denormalized for fast per-user queries
  razorpayPaymentId: string;
  razorpaySignature: string;
  status: 'success' | 'failed' | 'refunded';
  amount: number;
  paymentMode: PaymentModeRecord;
  paymentStage: PaymentStage;          // 'initial' = first payment, 'balance' = remaining
  invoiceId?: string;                  // Reference to generated invoice
  createdAt: Date;
}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    user:    { type: Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
    razorpayPaymentId: { type: String, required: true, unique: true }, // Prevents double processing
    razorpaySignature: { type: String, required: true },
    status:  { type: String, enum: ['success', 'failed', 'refunded'], required: true },
    amount:  { type: Number, required: true },
    paymentMode:  { type: String, enum: ['full', 'advance_40', 'reservation_500', 'balance', 'direct'], default: 'direct' },
    paymentStage: { type: String, enum: ['initial', 'balance'], default: 'initial' },
    invoiceId: { type: String },
  },
  { timestamps: true },
);

const Payment: Model<PaymentDocument> =
  mongoose.models.Payment ?? mongoose.model<PaymentDocument>('Payment', PaymentSchema);

export default Payment;
