// app/api/invoices/[token]/route.ts
// Secure token-based invoice access — only the booking owner can download
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { requireAuth, error, withErrorHandler } from '@/lib/apiHelpers';
import { NextResponse } from 'next/server';

export const GET = withErrorHandler(async (
  req: NextRequest,
  ctx: { params: { token: string } },
) => {
  const { session, response } = await requireAuth(req);
  if (response) return response;

  const { token } = ctx.params;
  if (!token || token.length < 32) return error('Invalid invoice token', 400);

  await connectDB();

  // ✅ SECURITY: Lookup by random token — not by sequential ID (unguessable)
  const invoice = await Invoice.findOne({ accessToken: token }).populate('booking', 'user');
  if (!invoice) return error('Invoice not found', 404);

  // ✅ SECURITY: Ensure the requester owns this invoice
  const userId = (session!.user as any).id as string;
  const bookingUserId = (invoice.booking as any)?.user?.toString?.() ?? invoice.user?.toString();
  const isAdmin = (session!.user as any).role === 'admin';

  if (bookingUserId !== userId && !isAdmin) {
    return error('Forbidden: you do not have access to this invoice', 403);
  }

  // Return invoice metadata + PDF URL for client-side download
  return NextResponse.json({
    success:       true,
    invoiceNumber: invoice.invoiceNumber,
    pdfUrl:        invoice.pdfUrl,
    amount:        invoice.amount,
    type:          invoice.type,
    createdAt:     invoice.createdAt,
  });
});
