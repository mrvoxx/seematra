// lib/invoice.ts
// Server-side PDF invoice generation using pdfkit
// PDFs are uploaded to Cloudinary /invoices/ folder and accessed via secure token
import PDFDocument from 'pdfkit';
import { connectDB } from './mongodb';
import Invoice from '@/models/Invoice';
import type { BookingDocument } from '@/models/Booking';

// Upload buffer to Cloudinary
async function uploadPdfToCloudinary(buffer: Buffer, publicId: string): Promise<string> {
  const cloudinary = (await import('cloudinary')).v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'seematra/invoices', public_id: publicId, format: 'pdf' },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Cloudinary upload failed'));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

// Generate PDF buffer in memory using pdfkit
function generateInvoicePdf(params: {
  invoiceNumber: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageTitle: string;
  packageDuration: string;
  tourDate: string;
  groupSize: number;
  pickupPoint: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  balanceDueDate?: string;
  paymentMode: string;
  paymentType: string; // 'initial' | 'balance'
  issuedAt: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const ORANGE = '#E87F24';
    const DARK   = '#1A1A2E';
    const GRAY   = '#6B7280';
    const WHITE  = '#FFFFFF';

    // ─── Header ────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 100).fill(DARK);
    doc.fontSize(24).fillColor(ORANGE).font('Helvetica-Bold').text('SEEMATRA', 50, 30);
    doc.fontSize(9).fillColor(WHITE).font('Helvetica').text('Premium Travel Experiences', 50, 58);
    doc.fontSize(9).fillColor(WHITE).text('seematra.com  ·  support@seematra.com', 50, 72);

    // Invoice badge
    doc.fontSize(11).fillColor(WHITE).font('Helvetica-Bold').text('PAYMENT RECEIPT', 380, 30, { align: 'right', width: 160 });
    doc.fontSize(9).fillColor(ORANGE).text(params.invoiceNumber, 380, 48, { align: 'right', width: 160 });
    doc.fontSize(8).fillColor('#AAAAAA').font('Helvetica').text(`Issued: ${params.issuedAt}`, 380, 64, { align: 'right', width: 160 });

    // ─── Booking & Customer Info ────────────────────────────────────────────
    doc.moveDown(2.5);
    doc.fontSize(11).fillColor(DARK).font('Helvetica-Bold').text('BOOKING DETAILS', 50);
    doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).stroke(ORANGE);
    doc.moveDown(0.5);

    const col2 = 300;
    const lineH = 18;
    const startY = doc.y;

    const leftLines = [
      ['Booking ID',   params.bookingId.slice(-12).toUpperCase()],
      ['Package',      params.packageTitle],
      ['Duration',     params.packageDuration],
      ['Tour Date',    params.tourDate],
    ];
    const rightLines = [
      ['Group Size',   `${params.groupSize} Person(s)`],
      ['Pickup Point', params.pickupPoint],
      ['Customer',     params.customerName],
      ['Contact',      params.customerPhone],
    ];

    leftLines.forEach(([label, value], i) => {
      doc.fontSize(8).fillColor(GRAY).font('Helvetica').text(label, 50, startY + i * lineH);
      doc.fontSize(9).fillColor(DARK).font('Helvetica-Bold').text(value, 155, startY + i * lineH);
    });
    rightLines.forEach(([label, value], i) => {
      doc.fontSize(8).fillColor(GRAY).font('Helvetica').text(label, col2, startY + i * lineH);
      doc.fontSize(9).fillColor(DARK).font('Helvetica-Bold').text(value, col2 + 90, startY + i * lineH);
    });

    // ─── Payment Summary ────────────────────────────────────────────────────
    doc.y = startY + leftLines.length * lineH + 20;
    doc.fontSize(11).fillColor(DARK).font('Helvetica-Bold').text('PAYMENT SUMMARY');
    doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).stroke(ORANGE);
    doc.moveDown(0.5);

    const paymentModeLabel: Record<string, string> = {
      full:            'Full Payment',
      advance_40:      '40% Advance Payment',
      reservation_500: '₹500 Reservation Fee',
      balance:         'Remaining Balance Payment',
      direct:          'Direct / Offline Payment',
    };

    const payRows: [string, string, boolean][] = [
      ['Total Package Cost', `₹${params.totalAmount.toLocaleString('en-IN')}`, false],
      ['Payment Mode', paymentModeLabel[params.paymentMode] ?? params.paymentMode, false],
      ['Amount Paid', `₹${params.amountPaid.toLocaleString('en-IN')}`, true],
      ['Balance Due', `₹${params.balanceDue.toLocaleString('en-IN')}`, false],
    ];
    if (params.balanceDueDate) {
      payRows.push(['Balance Due By', params.balanceDueDate, false]);
    }

    payRows.forEach(([label, value, highlight]) => {
      const rowY = doc.y;
      if (highlight) {
        doc.rect(45, rowY - 3, 505, 20).fill('#FFF7ED');
        doc.rect(45, rowY - 3, 3, 20).fill(ORANGE);
      }
      doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(label, 55, rowY);
      doc.fontSize(9).fillColor(highlight ? ORANGE : DARK).font(highlight ? 'Helvetica-Bold' : 'Helvetica')
        .text(value, 350, rowY, { align: 'right', width: 195 });
      doc.y = rowY + lineH;
    });

    // ─── Trust / Terms ──────────────────────────────────────────────────────
    doc.moveDown(1.5);
    doc.rect(45, doc.y, 505, 60).fill('#F0FDF4');
    const termsY = doc.y + 8;
    doc.fontSize(8).fillColor('#166534').font('Helvetica-Bold').text('✓ Payment Secured by Razorpay', 55, termsY);
    doc.fontSize(7.5).fillColor(GRAY).font('Helvetica')
      .text(
        'Reservation fees are non-refundable unless cancelled by Seematra. For support, WhatsApp us or email support@seematra.com. '
        + 'All prices are inclusive of applicable taxes. Tour itinerary subject to weather conditions.',
        55, termsY + 14, { width: 490 },
      );

    // ─── Footer ─────────────────────────────────────────────────────────────
    doc.fontSize(7).fillColor(GRAY).text(
      'Seematra Tours & Travels  ·  seematra.com  ·  This is a computer-generated invoice. No signature required.',
      50, doc.page.height - 40, { align: 'center', width: 495 },
    );

    doc.end();
  });
}

// ─── Main export: generate + upload + store invoice ──────────────────────────
export async function createInvoice(
  booking: BookingDocument & { itinerary?: any; user?: any },
  paymentStage: 'initial' | 'balance',
): Promise<{ invoiceNumber: string; accessToken: string; pdfUrl: string }> {
  await connectDB();

  const InvoiceModel = Invoice as any;
  const invoiceNumber: string = await InvoiceModel.generateInvoiceNumber();
  const accessToken: string = InvoiceModel.generateToken();

  const packageTitle   = booking.itinerary?.title    ?? 'Seematra Experience';
  const packageDuration= booking.itinerary?.duration ?? 'N/A';
  const customerName   = booking.user?.name          ?? 'Guest';
  const customerEmail  = booking.user?.email         ?? '';
  const customerPhone  = booking.contactPhone;

  // Determine amounts based on payment stage
  const amountPaid = paymentStage === 'balance' ? booking.balanceDue : booking.amountPaidOnline;
  const balanceDue = paymentStage === 'balance' ? 0 : booking.balanceDue;

  const invoiceType =
    paymentStage === 'balance'                       ? 'balance'
    : booking.paymentMode === 'full'                 ? 'full'
    : booking.paymentMode === 'reservation_500'      ? 'reservation'
    : 'partial';

  const pdfBuffer = await generateInvoicePdf({
    invoiceNumber,
    bookingId:       booking._id.toString(),
    customerName,
    customerEmail,
    customerPhone,
    packageTitle,
    packageDuration,
    tourDate:        booking.tourDate ? new Date(booking.tourDate).toLocaleDateString('en-IN') : 'TBD',
    groupSize:       booking.groupSize ?? 1,
    pickupPoint:     booking.pickupPoint,
    totalAmount:     booking.totalAmount,
    amountPaid,
    balanceDue,
    balanceDueDate:  booking.balanceDueDate ? new Date(booking.balanceDueDate).toLocaleDateString('en-IN') : undefined,
    paymentMode:     booking.paymentMode ?? 'direct',
    paymentType:     paymentStage,
    issuedAt:        new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
  });

  const pdfUrl = await uploadPdfToCloudinary(pdfBuffer, `${invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_')}`);

  await Invoice.create({
    booking:  booking._id,
    user:     booking.user?._id ?? booking.user,
    invoiceNumber,
    pdfUrl,
    accessToken,
    amount:   amountPaid,
    type:     invoiceType,
  });

  return { invoiceNumber, accessToken, pdfUrl };
}
