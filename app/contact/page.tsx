import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Support | Seematra',
  description: 'Get in touch with the Seematra support team for any queries or assistance.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark pb-20">
      {/* Header */}
      <div className="bg-primary/5 pt-32 pb-16 md:pt-40 md:pb-24 border-b border-brand-border dark:border-brand-border-dark">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <p className="text-sm text-primary font-inter font-semibold uppercase tracking-widest mb-2">Support</p>
          <h1 className="text-3xl md:text-5xl font-boldonse font-normal text-brand-text dark:text-brand-text-dark mb-4">
            How can we help you?
          </h1>
          <p className="text-brand-text/70 dark:text-brand-text-dark/70 font-inter text-lg">
            Whether you have a question about our itineraries, need help with a booking, or just want to say hi, our team is here for you.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 mt-16 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* WhatsApp Card */}
          <div className="card p-8 flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-2">
              <MessageCircle size={32} />
            </div>
            <h3 className="font-outfit font-bold text-xl text-brand-text dark:text-brand-text-dark">WhatsApp Assistance</h3>
            <p className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70">
              For the fastest response, reach out to us on WhatsApp. We usually reply within 15 minutes.
            </p>
            <a 
              href="https://wa.me/qr/IP26U77IWO5GO1?text=Hi!%20I%20need%20support." 
              target="_blank" 
              rel="noreferrer"
              className="mt-auto bg-[#25D366] hover:bg-[#1ebd5a] text-white py-2.5 px-6 rounded-xl font-bold font-poppins text-sm transition-colors shadow-sm w-full"
            >
              Get Instant Support
            </a>
          </div>

          {/* Email Card */}
          <div className="card p-8 flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Mail size={32} />
            </div>
            <h3 className="font-outfit font-bold text-xl text-brand-text dark:text-brand-text-dark">Email Support</h3>
            <p className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70">
              For detailed inquiries, partnerships, or booking modifications, send us an email.
            </p>
            <a 
              href="mailto:seematra.support@gmail.com" 
              className="mt-auto btn-outline w-[90%] mx-auto justify-center text-xs sm:text-sm px-2 sm:px-4"
            >
              seematra.support@gmail.com
            </a>
          </div>

          {/* Office Card */}
          <div className="card p-8 flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform md:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary dark:text-secondary-dark flex items-center justify-center mb-2">
              <MapPin size={32} />
            </div>
            <h3 className="font-outfit font-bold text-xl text-brand-text dark:text-brand-text-dark">Our Headquarters</h3>
            <p className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70">
              Office: Bhairav Colony, Gali no 1, Bhattowala, Gumamniwala<br />
              Rishikesh, Uttarakhand
            </p>
          </div>

        </div>

        {/* FAQ Teaser */}
        <div className="mt-20 bg-brand-card dark:bg-brand-card-dark rounded-3xl p-8 md:p-12 border border-brand-border dark:border-brand-border-dark flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-boldonse font-normal text-brand-text dark:text-brand-text-dark mb-3">Looking for quick answers?</h2>
            <p className="text-brand-text/70 dark:text-brand-text-dark/70 font-inter">
              Review our policies to see if your question has already been answered.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link href="/cancellation" className="btn-outline">
              Cancellation Policy
            </Link>
            <Link href="/terms" className="btn-secondary">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
