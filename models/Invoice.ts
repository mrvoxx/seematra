// models/Invoice.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export type InvoiceType = 'full' | 'partial' | 'reservation' | 'balance';

export interface InvoiceDocument extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  invoiceNumber: string;    // e.g. INV-SEEMATRA-2026-0042
  pdfUrl: string;           // Cloudinary URL of the generated PDF
  accessToken: string;      // Cryptographically random token for secure URL
  amount: number;           // Amount this invoice covers
  type: InvoiceType;
  createdAt: Date;
}

const InvoiceSchema = new Schema<InvoiceDocument>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    user:    { type: Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    pdfUrl:        { type: String, required: true },
    accessToken:   { type: String, required: true, unique: true, index: true },
    amount:        { type: Number, required: true },
    type:          { type: String, enum: ['full', 'partial', 'reservation', 'balance'], required: true },
  },
  { timestamps: true },
);

// Static method to generate a secure access token
InvoiceSchema.statics.generateToken = () => crypto.randomBytes(32).toString('hex');

// Static method to generate a sequential-looking invoice number
InvoiceSchema.statics.generateInvoiceNumber = async function () {
  const count = await this.countDocuments();
  const year = new Date().getFullYear();
  return `INV-SEEMATRA-${year}-${String(count + 1).padStart(4, '0')}`;
};

const Invoice: Model<InvoiceDocument> =
  mongoose.models.Invoice ?? mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);

export default Invoice;
