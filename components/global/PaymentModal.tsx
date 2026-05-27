'use client';

import { useState } from 'react';
import { ShieldCheck, IndianRupee, Users, Car, CheckCircle2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { IPricingTier } from '@/types';

interface Props {
  itinerary: { _id: string; price: number; title: string; pricingTiers?: IPricingTier[] };
  onSuccess: (bookingId: string) => void;
  onClose: () => void;
}

const GROUP_SIZES = [1, 2, 4, 6] as const;
type GroupSize = 1 | 2 | 4 | 6;

function getTierPrice(pricingTiers: IPricingTier[] | undefined, groupSize: GroupSize, basePrice: number) {
  if (!pricingTiers?.length) return basePrice;
  const tier = pricingTiers.find(t => t.persons === groupSize);
  return tier ? tier.totalPrice : basePrice;
}

function getTierVehicle(pricingTiers: IPricingTier[] | undefined, groupSize: GroupSize) {
  if (!pricingTiers?.length) return '';
  const tier = pricingTiers.find(t => t.persons === groupSize);
  return tier?.vehicle || '';
}

export default function PaymentModal({ itinerary, onSuccess, onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [pickupPoint, setPickupPoint] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [tourDate, setTourDate] = useState('');
  const [groupSize, setGroupSize] = useState<GroupSize>(2);
  
  // Payment selection
  const [paymentMode, setPaymentMode] = useState<'full' | 'advance_40' | 'reservation_500'>('advance_40');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalAmount = getTierPrice(itinerary.pricingTiers, groupSize, itinerary.price);
  const vehicleAssigned = getTierVehicle(itinerary.pricingTiers, groupSize);

  let amountToPayNow = 0;
  if (paymentMode === 'full') amountToPayNow = totalAmount;
  if (paymentMode === 'advance_40') amountToPayNow = Math.ceil(totalAmount * 0.4);
  if (paymentMode === 'reservation_500') amountToPayNow = 500;

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0];

  const handleCheckout = async () => {
    if (paymentMode === 'reservation_500' && !disclaimerAccepted) {
      toast.error('You must accept the reservation terms to proceed.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itineraryId: itinerary._id, 
          pickupPoint, 
          contactPhone, 
          tourDate, 
          groupSize,
          paymentMode,
          disclaimerAccepted
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');

      const { orderId, bookingId, keyId, amountPaidOnline } = data.data;

      const options = {
        key: keyId,
        amount: amountPaidOnline * 100,
        currency: 'INR',
        name: 'Seematra Tourism',
        description: `${paymentMode === 'full' ? 'Full' : paymentMode === 'advance_40' ? 'Advance' : 'Reservation'} payment for ${itinerary.title}`,
        order_id: orderId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

            toast.success('Payment successful! Booking confirmed.');
            onSuccess(bookingId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: { contact: contactPhone },
        theme: { color: '#E87F24' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {step === 1 && (
        <div className="animate-fade-in space-y-5">
          <h3 className="font-outfit font-bold text-lg border-b border-brand-border dark:border-brand-border-dark pb-2">
            Step 1: Traveler Details
          </h3>

          {/* Tour Start Date */}
          <div>
            <label className="block text-sm font-bold mb-1">Arrival / Tour Start Date <span className="text-red-400">*</span></label>
            <input
              type="date"
              min={today}
              value={tourDate}
              onChange={(e) => setTourDate(e.target.value)}
              className="w-full bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark p-3 rounded-xl outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          {/* Group Size */}
          <div>
            <label className="block text-sm font-bold mb-2">
              <Users size={14} className="inline mr-1 -mt-0.5" />
              Group Size <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GROUP_SIZES.map(size => {
                const tierPrice = getTierPrice(itinerary.pricingTiers, size, itinerary.price);
                const tierVehicle = getTierVehicle(itinerary.pricingTiers, size);
                const hasTier = itinerary.pricingTiers?.some(t => t.persons === size && t.totalPrice > 0);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setGroupSize(size)}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border-2 transition-all text-center h-20 ${
                      groupSize === size
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-brand-border dark:border-brand-border-dark text-brand-text/70 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-lg font-bold leading-none">{size}</span>
                    <span className="text-[10px] font-medium opacity-60 leading-none">{size === 1 ? 'Person' : 'Persons'}</span>
                    {hasTier && (
                      <span className="text-[10px] font-bold text-primary leading-none mt-1">₹{tierPrice.toLocaleString('en-IN')}</span>
                    )}
                    {hasTier && tierVehicle && (
                      <span className="text-[9px] opacity-50 truncate w-full leading-none mt-0.5 px-1">{tierVehicle}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pickup Point */}
          <div>
            <label className="block text-sm font-bold mb-1">Pickup Point <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Dehradun Airport, Haridwar Railway Station"
              value={pickupPoint} onChange={(e) => setPickupPoint(e.target.value)}
              className="w-full bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark p-3 rounded-xl outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-bold mb-1">Contact Phone <span className="text-red-400">*</span></label>
            <input
              type="tel"
              placeholder="+91 .."
              value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark p-3 rounded-xl outline-none focus:border-primary transition-colors text-sm font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-border dark:border-brand-border-dark">
            <button onClick={onClose} className="btn-secondary py-2 px-4" disabled={loading}>Cancel</button>
            <button
              onClick={() => {
                if (!tourDate) return toast.error('Please select your arrival date');
                if (pickupPoint.trim().length < 2) return toast.error('Pickup point is required');
                if (contactPhone.trim().length < 10) return toast.error('Valid phone is required');
                setStep(2);
              }}
              className="btn-primary py-2 px-8 flex items-center gap-2"
            >
              Continue <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in flex flex-col gap-6">

          {/* Booking Summary */}
          <div>
            <h3 className="font-poppins font-bold text-lg mb-4 flex items-center justify-between">
              <span>Booking Summary</span>
              <span className="text-primary font-bold text-base flex items-center">
                <IndianRupee size={16} />{totalAmount.toLocaleString('en-IN')}
              </span>
            </h3>

            <div className="bg-surface/60 dark:bg-surface-dark/60 rounded-xl p-4 text-sm">
              <p className="font-semibold text-brand-text dark:text-brand-text-dark mb-3 text-base">
                {itinerary.title}
              </p>
              <div className="grid grid-cols-2 gap-3 text-brand-text/80 dark:text-brand-text-dark/80">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-brand-text/45 dark:text-brand-text-dark/45 font-bold mb-0.5">Date</span>
                  <span className="font-medium">
                    {new Date(tourDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-brand-text/45 dark:text-brand-text-dark/45 font-bold mb-0.5">Group</span>
                  <span className="font-medium">{groupSize} Person(s)</span>
                </div>
                {vehicleAssigned && (
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-brand-text/45 dark:text-brand-text-dark/45 font-bold mb-0.5">Vehicle</span>
                    <span className="font-medium flex items-center gap-1">
                      <Car size={13} className="text-primary" /> {vehicleAssigned}
                    </span>
                  </div>
                )}
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-brand-text/45 dark:text-brand-text-dark/45 font-bold mb-0.5">Pickup</span>
                  <span className="font-medium">{pickupPoint}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-brand-border/30 dark:border-brand-border-dark/30" />

          {/* Payment Method Selection */}
          <div>
            <h4 className="font-poppins font-semibold text-sm mb-3">Select Payment Method</h4>
            <div className="space-y-2">

              <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${paymentMode === 'full' ? 'bg-primary/8 ring-1 ring-primary/40' : 'hover:bg-surface/80 dark:hover:bg-surface-dark/80'}`}>
                <input type="radio" name="payment" className="mt-0.5 accent-primary w-4 h-4 shrink-0 cursor-pointer" checked={paymentMode === 'full'} onChange={() => setPaymentMode('full')} />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block text-sm">Full Payment (100%)</span>
                  <span className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 block">Pay total amount now for instant confirmation.</span>
                  <span className="mt-1 text-sm font-bold text-primary block">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${paymentMode === 'advance_40' ? 'bg-primary/8 ring-1 ring-primary/40' : 'hover:bg-surface/80 dark:hover:bg-surface-dark/80'}`}>
                <input type="radio" name="payment" className="mt-0.5 accent-primary w-4 h-4 shrink-0 cursor-pointer" checked={paymentMode === 'advance_40'} onChange={() => setPaymentMode('advance_40')} />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block text-sm">40% Advance Payment</span>
                  <span className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 block">Secure your booking. Pay the 60% balance 3 days before trip.</span>
                  <span className="mt-1 text-sm font-bold text-primary block">₹{Math.ceil(totalAmount * 0.4).toLocaleString('en-IN')}</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${paymentMode === 'reservation_500' ? 'bg-primary/8 ring-1 ring-primary/40' : 'hover:bg-surface/80 dark:hover:bg-surface-dark/80'}`}>
                <input type="radio" name="payment" className="mt-0.5 accent-primary w-4 h-4 shrink-0 cursor-pointer" checked={paymentMode === 'reservation_500'} onChange={() => { setPaymentMode('reservation_500'); setDisclaimerAccepted(false); }} />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block text-sm">Pay on Arrival (₹500 Reservation)</span>
                  <span className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 block">Lock your price today. Pay the entire balance when you arrive.</span>
                  <span className="mt-1 text-sm font-bold text-primary block">₹500</span>
                </div>
              </label>

            </div>
          </div>

          {paymentMode === 'reservation_500' && (
            <label className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg cursor-pointer animate-fade-in">
              <input 
                type="checkbox" 
                className="mt-0.5 accent-red-600 w-4 h-4 shrink-0 rounded cursor-pointer"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              />
              <span className="text-xs text-red-700 dark:text-red-300 font-medium leading-relaxed">
                I understand that this ₹500 fee is strictly non-refundable and reserves my spot, but hotel availability is only guaranteed once a 40% advance is paid.
              </span>
            </label>
          )}

          {/* Footer */}
          <div className="pt-2 border-t border-brand-border/20 dark:border-brand-border-dark/20 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[11px] text-brand-text/40 dark:text-brand-text-dark/40 justify-center">
              <ShieldCheck size={13} className="text-green-500" />
              Secure 256-bit encrypted checkout via Razorpay
            </div>

            <div className="flex justify-between items-center gap-3">
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="btn-secondary py-2.5 px-5 text-sm" disabled={loading}>← Back</button>
                <a 
                  href="https://wa.me/qr/IP26U77IWO5GO1?text=Hi!%20I%20need%20help%20booking%20the%20trip%20to%20Uttarakhand." 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[#25D366] hover:bg-[#1ebd5a] text-white py-2.5 px-3.5 rounded-xl flex items-center justify-center transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
              <button onClick={handleCheckout} className="btn-primary py-2.5 px-8 shadow-md text-sm" disabled={loading}>
                {loading ? 'Processing...' : `Pay ₹${amountToPayNow.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Razorpay Script dynamically only when needed */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
