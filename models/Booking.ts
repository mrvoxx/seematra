// models/Booking.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import type { PaymentStatus, PaymentType, BookingStatus } from '@/types';

export type PaymentMode = 'full' | 'advance_40' | 'reservation_500' | 'direct';

export interface BookingDocument extends Document {
  user: mongoose.Types.ObjectId;
  itinerary: mongoose.Types.ObjectId;
  paymentType: PaymentType;
  paymentMode: PaymentMode;
  totalAmount: number;
  amountPaidOnline: number;
  reservationFee: number;         // ₹500 locked amount for reservation mode
  balanceDue: number;
  balanceDueDate?: Date;          // Deadline to pay remaining balance
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  pickupPoint: string;
  contactPhone: string;
  tourDate?: Date;
  groupSize?: number;
  vehicleAssigned?: string;
  guideAssigned?: string;         // Guide name if assigned
  hotelStatus?: string;           // Hotel confirmation status note
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  balanceRazorpayOrderId?: string;   // Separate order for balance payment
  balanceRazorpayPaymentId?: string;
  disclaimerAccepted?: boolean;   // Required for reservation_500 mode
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<BookingDocument>(
  {
    user:      { type: Schema.Types.ObjectId, ref: 'User',      required: true, index: true },
    itinerary: { type: Schema.Types.ObjectId, ref: 'Itinerary', required: true },

    paymentType: { type: String, enum: ['online', 'direct'], required: true },
    paymentMode: {
      type: String,
      enum: ['full', 'advance_40', 'reservation_500', 'direct'],
      default: 'direct',
    },

    totalAmount:     { type: Number, required: true },
    amountPaidOnline:{ type: Number, default: 0 },
    reservationFee:  { type: Number, default: 0 },
    balanceDue:      { type: Number, required: true },
    balanceDueDate:  { type: Date },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'RESERVED', 'PARTIAL_PAID', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'reserved', 'partially_paid', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },

    pickupPoint:   { type: String, required: true },
    contactPhone:  { type: String, required: true },
    tourDate:      { type: Date },
    groupSize:     { type: Number, enum: [1, 2, 4, 6] },
    vehicleAssigned: { type: String },
    guideAssigned:   { type: String },
    hotelStatus:     { type: String },

    razorpayOrderId:            String,
    razorpayPaymentId:          String,
    balanceRazorpayOrderId:     String,
    balanceRazorpayPaymentId:   String,

    disclaimerAccepted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Indexes for fast queries
BookingSchema.index({ razorpayOrderId: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ bookingStatus: 1 });

const Booking: Model<BookingDocument> =
  mongoose.models.Booking ?? mongoose.model<BookingDocument>('Booking', BookingSchema);

export default Booking;
