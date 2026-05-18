'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, AlertCircle, Download, CreditCard, Shield, Smartphone, Globe, ChevronRight, X } from 'lucide-react';

// ─── Payment Mode Selection Card ─────────────────────────────────────────────
type PaymentMode = 'full' | 'advance_40' | 'reservation_500';

interface PaymentOption {
  mode:        PaymentMode;
  title:       string;
  description: string;
  badge?:      string;
  badgeColor?: string;
  disclaimer?: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    mode:        'full',
    title:       'Pay Full Amount',
    description: 'Pay 100% now. Get instant confirmation and the best experience.',
    badge:       'Best Value',
    badgeColor:  'bg-green-500',
  },
  {
    mode:        'advance_40',
    title:       'Pay 40% Advance',
    description: 'Pay 40% now to confirm your booking. Remaining 60% due 3 days before your tour.',
    badge:       'Most Popular',
    badgeColor:  'bg-primary',
  },
  {
    mode:        'reservation_500',
    title:       '₹500 Reservation',
    description: 'Lock your spot with just ₹500. Pay the rest when ready.',
    disclaimer:  '⚠️ The ₹500 reservation fee is non-refundable unless the tour is cancelled by Seematra.',
  },
];

// ─── Payment Mode Modal ───────────────────────────────────────────────────────
interface PaymentModalProps {
  totalAmount:   number;
  packageTitle:  string;
  onSelect:      (mode: PaymentMode) => void;
  onClose:       () => void;
}

export function PaymentModal({ totalAmount, packageTitle, onSelect, onClose }: PaymentModalProps) {
  const [selected, setSelected] = useState<PaymentMode>('advance_40');
  const [disclaimer, setDisclaimer] = useState(false);

  const getAmount = (mode: PaymentMode) => {
    if (mode === 'full')            return totalAmount;
    if (mode === 'advance_40')      return Math.ceil(totalAmount * 0.4);
    if (mode === 'reservation_500') return 500;
    return totalAmount;
  };

  const handleProceed = () => {
    if (selected === 'reservation_500' && !disclaimer) {
      toast.error('Please accept the reservation terms to continue.');
      return;
    }
    onSelect(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-primary/10 to-orange-50 dark:from-primary/10 dark:to-gray-900">
          <div>
            <h2 className="font-outfit font-bold text-lg text-gray-900 dark:text-white">Choose Payment Plan</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{packageTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              onClick={() => setSelected(opt.mode)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selected === opt.mode
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/40'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-outfit font-bold text-gray-900 dark:text-white">{opt.title}</span>
                    {opt.badge && (
                      <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-bold ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{opt.description}</p>
                  {opt.disclaimer && selected === opt.mode && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">{opt.disclaimer}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-outfit font-bold text-primary text-lg">₹{getAmount(opt.mode).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-gray-400">pay now</p>
                </div>
              </div>
            </button>
          ))}

          {/* Reservation disclaimer checkbox */}
          {selected === 'reservation_500' && (
            <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-primary"
                checked={disclaimer}
                onChange={(e) => setDisclaimer(e.target.checked)}
              />
              <span className="text-xs text-amber-800 dark:text-amber-300">
                I understand that the ₹500 reservation fee is <strong>non-refundable</strong> unless Seematra cancels the tour.
                The remaining balance is due 3 days before the tour date.
              </span>
            </label>
          )}
        </div>

        {/* Security + CTA */}
        <div className="px-5 pb-5">
          <button
            onClick={handleProceed}
            className="btn-primary w-full justify-center py-4 text-base font-bold"
          >
            Pay ₹{getAmount(selected).toLocaleString('en-IN')} Securely
          </button>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Shield size={11} /> 256-bit SSL</span>
            <span className="flex items-center gap-1"><CreditCard size={11} /> Razorpay Secured</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={11} /> PCI-DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trust Badges ─────────────────────────────────────────────────────────────
export function TrustBadges({ className = '' }: { className?: string }) {
  const badges = [
    { icon: Shield,      label: 'Razorpay Secured',      color: 'text-blue-500' },
    { icon: CheckCircle2,label: 'Instant Confirmation',  color: 'text-green-500' },
    { icon: Smartphone,  label: 'WhatsApp Support',      color: 'text-green-600' },
    { icon: Globe,       label: 'Local Expert Guides',   color: 'text-primary' },
  ];
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {badges.map(({ icon: Icon, label, color }) => (
        <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
          <Icon size={12} className={color} />
          {label}
        </div>
      ))}
    </div>
  );
}

// ─── Payment Progress Bar ─────────────────────────────────────────────────────
interface PaymentProgressProps {
  totalAmount:  number;
  amountPaid:   number;
  balanceDue:   number;
  dueDate?:     string;
  paymentMode?: string;
}

export function PaymentProgress({ totalAmount, amountPaid, balanceDue, dueDate, paymentMode }: PaymentProgressProps) {
  const pct = totalAmount > 0 ? Math.round((amountPaid / totalAmount) * 100) : 0;
  const isFullyPaid = balanceDue <= 0;

  return (
    <div className="bg-surface dark:bg-surface-dark rounded-xl border border-brand-border dark:border-brand-border-dark p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Progress</span>
        <span className="text-xs font-bold text-primary">{pct}% paid</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isFullyPaid ? 'bg-green-500' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
          <p className="text-sm font-bold">₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-[10px] text-green-500 uppercase font-bold">Paid</p>
          <p className="text-sm font-bold text-green-600">₹{amountPaid.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-[10px] text-amber-500 uppercase font-bold">Remaining</p>
          <p className="text-sm font-bold text-amber-600">₹{balanceDue.toLocaleString('en-IN')}</p>
        </div>
      </div>
      {dueDate && !isFullyPaid && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Balance due by: <strong className="text-amber-600">{new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
        </p>
      )}
    </div>
  );
}

// ─── Booking Status Badge ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending:        { label: 'Pending',       color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',              icon: Clock },
  reserved:       { label: 'Reserved',      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',       icon: CheckCircle2 },
  partially_paid: { label: 'Partially Paid',color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',           icon: Clock },
  confirmed:      { label: 'Confirmed',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',       icon: CheckCircle2 },
  in_progress:    { label: 'In Progress',   color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',   icon: CheckCircle2 },
  completed:      { label: 'Completed',     color: 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300',       icon: CheckCircle2 },
  cancelled:      { label: 'Cancelled',     color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',               icon: AlertCircle },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

// ─── Pay Balance Button ───────────────────────────────────────────────────────
interface PayBalanceButtonProps {
  bookingId:    string;
  balanceDue:   number;
  onSuccess:    () => void;
}

export function PayBalanceButton({ bookingId, balanceDue, onSuccess }: PayBalanceButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1. Create balance order
      const res = await fetch('/api/payments/pay-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // 2. Open Razorpay checkout
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) throw new Error('Payment library not loaded. Please refresh.');

      const rzp = new Razorpay({
        key:      data.data.keyId,
        amount:   data.data.amount * 100,
        currency: 'INR',
        name:     'Seematra',
        description: 'Remaining Balance Payment',
        order_id: data.data.orderId,
        handler: async (response: any) => {
          // 3. Verify balance payment
          const verifyRes = await fetch('/api/payments/pay-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success('🎉 Balance paid! Your booking is fully confirmed.');
            onSuccess();
          } else {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        theme: { color: '#E87F24' },
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
    >
      <CreditCard size={14} />
      {loading ? 'Processing...' : `Pay ₹${balanceDue.toLocaleString('en-IN')}`}
    </button>
  );
}

// ─── Invoice Download Button ──────────────────────────────────────────────────
interface InvoiceButtonProps {
  invoiceToken: string;
  label?:       string;
}

export function InvoiceDownloadButton({ invoiceToken, label = 'Download Invoice' }: InvoiceButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceToken}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Invoice not found.');

      // Open PDF in new tab
      window.open(data.pdfUrl, '_blank');
      toast.success('Invoice opened in a new tab.');
    } catch (err: any) {
      toast.error(err.message || 'Could not load invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 text-sm text-primary hover:underline font-bold disabled:opacity-50"
    >
      <Download size={14} />
      {loading ? 'Loading...' : label}
    </button>
  );
}
