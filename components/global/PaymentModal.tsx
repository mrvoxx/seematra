'use client';

import { useState } from 'react';
import { ShieldCheck, IndianRupee, Users, Car } from 'lucide-react';
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
  const [method, setMethod] = useState<'online' | 'direct'>('online');
  const [loading, setLoading] = useState(false);

  const totalAmount = getTierPrice(itinerary.pricingTiers, groupSize, itinerary.price);
  const vehicleAssigned = getTierVehicle(itinerary.pricingTiers, groupSize);
  const advanceLevel = Math.ceil(totalAmount / 3);
  const balanceDue = totalAmount - advanceLevel;

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0];

  const handleCheckout = async () => {
    setLoading(true);
    try {
      if (method === 'direct') {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itineraryId: itinerary._id,
            paymentType: 'direct',
            pickupPoint,
            contactPhone,
            tourDate,
            groupSize,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Booking failed');
        toast.success('Booking confirmed! Payment due on arrival.');
        onSuccess(data.data._id);
        return;
      }

      // Online payment flow via Razorpay
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itineraryId: itinerary._id, pickupPoint, contactPhone, tourDate, groupSize }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');

      const { orderId, bookingId, keyId, amountPaidOnline } = data.data;

      const options = {
        key: keyId,
        amount: amountPaidOnline * 100,
        currency: 'INR',
        name: 'Seematra Tourism',
        description: `Advance payment for ${itinerary.title}`,
        order_id: orderId,
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
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: { name: '', email: '' },
        theme: { color: '#E87F24' },
      };

      const rzp = new (window as any).Razorpay(options);
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
            <div className="grid grid-cols-4 gap-2">
              {GROUP_SIZES.map(size => {
                const tierPrice = getTierPrice(itinerary.pricingTiers, size, itinerary.price);
                const tierVehicle = getTierVehicle(itinerary.pricingTiers, size);
                const hasTier = itinerary.pricingTiers?.some(t => t.persons === size && t.totalPrice > 0);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setGroupSize(size)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                      groupSize === size
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-brand-border dark:border-brand-border-dark text-brand-text/70 dark:text-brand-text-dark/70 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-lg font-bold">{size}</span>
                    <span className="text-[10px] font-medium opacity-60">{size === 1 ? 'Person' : 'Persons'}</span>
                    {hasTier && (
                      <span className="text-[10px] font-bold text-primary">₹{tierPrice.toLocaleString('en-IN')}</span>
                    )}
                    {hasTier && tierVehicle && (
                      <span className="text-[9px] opacity-50 truncate w-full">{tierVehicle}</span>
                    )}
                  </button>
                );
              })}
            </div>
            {vehicleAssigned && (
              <p className="mt-2 text-xs text-brand-text/60 dark:text-brand-text-dark/60 flex items-center gap-1">
                <Car size={12} className="text-primary" />
                Vehicle: <span className="font-bold text-brand-text dark:text-brand-text-dark">{vehicleAssigned}</span>
              </p>
            )}
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
            <button onClick={onClose} className="btn-secondary py-2" disabled={loading}>Cancel</button>
            <button
              onClick={() => {
                if (!tourDate) return toast.error('Please select your arrival date');
                if (pickupPoint.trim().length < 2) return toast.error('Pickup point is required');
                if (contactPhone.trim().length < 10) return toast.error('Valid phone is required');
                setStep(2);
              }}
              className="btn-primary py-2 w-32 justify-center"
            >
              Continue ✓
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
            <h3 className="font-outfit font-bold text-lg mb-4 flex items-center justify-between">
              Step 2: Review &amp; Payment
              <span className="text-primary"><IndianRupee size={20} className="inline mr-1 -mt-1"/>{totalAmount.toLocaleString('en-IN')}</span>
            </h3>

            <div className="mb-4 p-3 bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg text-sm flex flex-col gap-1 shadow-sm">
              <span className="font-bold opacity-80 text-xs uppercase tracking-widest text-primary">Your Details</span>
              <div className="flex justify-between items-center"><span className="opacity-60">Trip:</span> <span className="truncate max-w-[200px] font-bold text-primary">{itinerary.title}</span></div>
              <div className="flex justify-between items-center"><span className="opacity-60">Date:</span> <span className="font-bold">{new Date(tourDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span></div>
              <div className="flex justify-between items-center"><span className="opacity-60">Group:</span> <span className="font-bold">{groupSize} {groupSize === 1 ? 'Person' : 'Persons'}</span></div>
              {vehicleAssigned && <div className="flex justify-between items-center"><span className="opacity-60">Vehicle:</span> <span className="font-bold">{vehicleAssigned}</span></div>}
              <div className="flex justify-between items-center"><span className="opacity-60">Pickup:</span> <span className="font-bold truncate max-w-[200px]">{pickupPoint}</span></div>
              <div className="flex justify-between items-center"><span className="opacity-60">Phone:</span> <span className="font-mono font-bold">{contactPhone}</span></div>
            </div>

            <div className="space-y-4">
              <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors shadow-sm ${method === 'online' ? 'border-primary bg-surface dark:bg-surface-dark' : 'border-brand-border dark:border-brand-border-dark'}`}>
                <div className="flex items-start gap-3">
                  <input type="radio" name="payment" className="mt-1 accent-primary w-4 h-4 cursor-pointer" checked={method === 'online'} onChange={() => setMethod('online')} />
                  <div className="flex-1">
                    <span className="font-outfit font-bold block mb-1">Pay 1/3 Advance Online</span>
                    <span className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70 block">Secure your booking instantly. Balance due on arrival.</span>
                    <div className="mt-3 text-sm font-bold bg-primary/10 text-primary-dark inline-block px-3 py-1 rounded-md">
                      Due Now: ₹{advanceLevel.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </label>

              <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors shadow-sm ${method === 'direct' ? 'border-primary bg-surface dark:bg-surface-dark' : 'border-brand-border dark:border-brand-border-dark'}`}>
                <div className="flex items-start gap-3">
                  <input type="radio" name="payment" className="mt-1 accent-primary w-4 h-4 cursor-pointer" checked={method === 'direct'} onChange={() => setMethod('direct')} />
                  <div className="flex-1">
                    <span className="font-outfit font-bold block mb-1">Pay Full on Arrival</span>
                    <span className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70 block">Reserve now, pay the master guide directly.</span>
                    <div className="mt-3 text-sm font-bold bg-brand-border dark:bg-brand-border-dark text-brand-text inline-block px-3 py-1 rounded-md">
                      Due Now: ₹0
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-brand-text/50 justify-center">
            <ShieldCheck size={16} className="text-green-500" />
            Secure 256-bit encrypted checkout via Razorpay
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-brand-border dark:border-brand-border-dark">
            <button onClick={() => setStep(1)} className="btn-secondary py-2" disabled={loading}>← Back</button>
            <button onClick={handleCheckout} className="btn-primary py-2 min-w-[200px] justify-center" disabled={loading}>
              {loading ? 'Processing...' : method === 'online' ? `Pay ₹${advanceLevel.toLocaleString('en-IN')}` : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}

      {method === 'online' && (
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      )}
    </div>
  );
}
