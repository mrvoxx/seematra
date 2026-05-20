import Link from 'next/link';
import { CheckCircle2, ChevronRight, Share2, BookOpen } from 'lucide-react';
import ProtectedRoute from '@/components/global/ProtectedRoute';

export const metadata = {
  title: 'Booking Confirmed | Seematra',
};

export default function BookingConfirmationPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center pt-24 pb-12 px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="animate-fade-up">
            <div className="w-24 h-24 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-outfit font-extrabold text-brand-text dark:text-brand-text-dark mb-4">
              Booking Confirmed!
            </h1>
            
            <p className="text-lg font-inter text-brand-text/70 dark:text-brand-text-dark/70 mb-8 max-w-lg mx-auto leading-relaxed">
              You're all set for an incredible adventure. Your booking ID is <span className="font-mono font-bold text-brand-text dark:text-brand-text-dark">#{params.id.slice(-8).toUpperCase()}</span>. We've sent a confirmation to your email.
            </p>
            
            <div className="bg-brand-border/10 dark:bg-brand-border-dark/10 rounded-2xl p-6 md:p-8 mb-8 border border-brand-border/50 dark:border-brand-border-dark/50 shadow-sm inline-block w-full max-w-md">
              <h3 className="font-outfit font-bold text-xl mb-4">What's Next?</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">1</div>
                  <div>
                    <p className="font-bold text-sm">Check your dashboard</p>
                    <p className="text-xs text-brand-text/60 dark:text-brand-text-dark/60 mt-0.5">View your itinerary, driver details, and pending payments.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">2</div>
                  <div>
                    <p className="font-bold text-sm">Our team will reach out</p>
                    <p className="text-xs text-brand-text/60 dark:text-brand-text-dark/60 mt-0.5">We will contact you via WhatsApp for further coordination.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard?tab=bookings" className="btn-primary py-3 px-8 justify-center shadow-lg hover:-translate-y-1 transition-transform">
                Go to Dashboard <ChevronRight size={18} />
              </Link>
              <Link href="/blogs" className="btn-secondary py-3 px-8 justify-center flex items-center gap-2">
                <BookOpen size={18} /> Read Travel Guides
              </Link>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'I just booked a trip with Seematra!',
                      text: 'Check out Seematra for awesome travel itineraries in Uttarakhand.',
                      url: window.location.origin
                    });
                  }
                }}
                className="btn-outline py-3 px-6 justify-center flex items-center gap-2"
              >
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
