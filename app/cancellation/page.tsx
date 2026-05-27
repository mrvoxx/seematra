import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation Policy | Seematra',
  description: 'Read the cancellation and refund policy governing use of Seematra travel services.',
};

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      <div className="container mx-auto px-4 lg:px-8 py-16 max-w-4xl">
        <div className="mb-10">
          <p className="text-sm text-primary font-inter font-semibold uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl font-boldonse font-normal text-brand-text dark:text-brand-text-dark mb-4">Cancellation &amp; Refund Policy</h1>
          <p className="text-sm text-brand-text/50 dark:text-brand-text-dark/50 font-inter">Last Updated: May 26, 2026</p>
        </div>

        <div className="prose dark:prose-invert max-w-none font-inter text-brand-text/80 dark:text-brand-text-dark/80 space-y-8">
          
          <p>
            This policy explains how cancellations and refunds work for Seematra bookings.
          </p>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">1. Booking Confirmation Rule</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>A ₹500 non-refundable reservation token is required at the time of booking.</li>
              <li>This token confirms your booking and secures arrangements with partners.</li>
            </ul>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">2. Refund Policy Timeline</h2>
            
            <div className="bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500 p-4 rounded-r-lg my-4">
              <h3 className="text-lg font-outfit font-semibold text-green-800 dark:text-green-400 mb-2">✅ Full Refund (Within 24 Hours)</h3>
              <p>If cancellation is requested within 24 hours of payment:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>100% refund will be provided (including token if applicable).</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 p-4 rounded-r-lg my-4">
              <h3 className="text-lg font-outfit font-semibold text-yellow-800 dark:text-yellow-400 mb-2">⚠️ Partial Deduction (24 Hours to 2 Days)</h3>
              <p>If cancellation is made after 24 hours but before 2 days:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>₹500 reservation token will be deducted</li>
                <li>Remaining amount will be refunded</li>
              </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500 p-4 rounded-r-lg my-4">
              <h3 className="text-lg font-outfit font-semibold text-orange-800 dark:text-orange-400 mb-2">⚠️ 25% Deduction (3 to 7 Days Before Trip)</h3>
              <p>If cancellation is made between 3 to 7 days before trip start:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>25% of total booking amount will be deducted</li>
                <li>Remaining amount will be refunded</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-lg my-4">
              <h3 className="text-lg font-outfit font-semibold text-red-800 dark:text-red-400 mb-2">❌ No Refund (Within 7 Days of Trip)</h3>
              <p>If cancellation is made within 7 days of trip start date:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>No refund will be provided</li>
              </ul>
            </div>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">3. Force Majeure Situations</h2>
            <p>No refunds will be provided for cancellations caused by:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Natural disasters</li>
              <li>Weather disruptions</li>
              <li>Government restrictions</li>
              <li>Road closures</li>
              <li>Unforeseen local emergencies</li>
            </ul>
            <p className="mt-4 font-semibold">
              However, Seematra will try to assist in rescheduling where possible.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">4. Refund Processing Time</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds may take 5–10 business days depending on bank and payment provider.</li>
              <li>Delays from banks or payment gateways are outside Seematra’s control.</li>
            </ul>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">5. Modification of Booking</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Date changes or itinerary modifications are subject to availability.</li>
              <li>Additional charges may apply depending on changes requested.</li>
            </ul>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">6. Contact for Cancellations</h2>
            <p>
              All cancellation requests must be sent through official Seematra support channels for verification and processing.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
