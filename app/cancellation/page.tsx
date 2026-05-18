import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy',
  description: 'Read Seematra\'s cancellation and refund policy for travel bookings.',
};

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      <div className="container mx-auto px-4 lg:px-8 py-16 max-w-4xl">
        <div className="mb-10">
          <p className="text-sm text-primary font-inter font-semibold uppercase tracking-widest mb-2">Policies</p>
          <h1 className="text-3xl md:text-4xl font-boldonse font-normal text-brand-text dark:text-brand-text-dark mb-4">Cancellation &amp; Refund Policy</h1>
          <p className="text-sm text-brand-text/50 dark:text-brand-text-dark/50 font-inter">Last updated: May 16, 2025</p>
        </div>

        <div className="prose dark:prose-invert max-w-none font-inter text-brand-text/80 dark:text-brand-text-dark/80 space-y-8">

          <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
            <p className="font-semibold text-primary mb-1">Our Commitment to You</p>
            <p className="text-sm">We understand travel plans change. Our policy is designed to be fair — we protect your money while ensuring our local guides and vendors are also treated fairly. Please read this carefully before booking.</p>
          </div>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-4">Standard Cancellation Schedule</h2>
            <div className="overflow-x-auto rounded-xl border border-brand-border dark:border-brand-border-dark">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="text-left p-4 font-semibold">Notice Before Tour Date</th>
                    <th className="text-left p-4 font-semibold">Refund</th>
                    <th className="text-left p-4 font-semibold">Processing Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border dark:divide-brand-border-dark">
                  <tr className="hover:bg-surface dark:hover:bg-surface-dark/50">
                    <td className="p-4">More than 15 days</td>
                    <td className="p-4 text-green-600 font-semibold">100% refund</td>
                    <td className="p-4">5–7 business days</td>
                  </tr>
                  <tr className="hover:bg-surface dark:hover:bg-surface-dark/50">
                    <td className="p-4">7 to 15 days</td>
                    <td className="p-4 text-amber-600 font-semibold">50% refund</td>
                    <td className="p-4">5–7 business days</td>
                  </tr>
                  <tr className="hover:bg-surface dark:hover:bg-surface-dark/50">
                    <td className="p-4">Less than 7 days</td>
                    <td className="p-4 text-red-600 font-semibold">No refund</td>
                    <td className="p-4">—</td>
                  </tr>
                  <tr className="hover:bg-surface dark:hover:bg-surface-dark/50">
                    <td className="p-4">No-show on tour date</td>
                    <td className="p-4 text-red-600 font-semibold">No refund</td>
                    <td className="p-4">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">Force Majeure &amp; Natural Events</h2>
            <p>If your trip is cancelled or significantly disrupted due to events beyond our control — such as severe weather, natural disasters, landslides, road blockages, government orders, or political unrest — we will:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Offer a full <strong>credit note</strong> valid for 12 months for rebooking</li>
              <li>Alternatively, offer a rescheduled trip at no extra cost (subject to availability)</li>
              <li>In exceptional cases, offer a partial refund at our discretion</li>
            </ul>
            <p>We strongly recommend purchasing travel insurance covering trip cancellation for mountain travel.</p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">How to Cancel</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Log in to your <strong>Seematra dashboard</strong> and navigate to "My Bookings".</li>
              <li>Click the "Cancel Booking" button on the relevant booking.</li>
              <li>You will receive an email confirmation of your cancellation within 1 hour.</li>
              <li>Refunds (where applicable) are processed automatically to your original payment method.</li>
            </ol>
            <p>Alternatively, contact us directly at <strong>support@seematra.com</strong> or WhatsApp <strong>+91 99999 99999</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">Cancellations by Seematra</h2>
            <p>In the rare event that we cancel a tour (due to insufficient group size, safety concerns, or operational issues), you will receive:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A <strong>full 100% refund</strong>, processed within 5–7 business days</li>
              <li>Priority rebooking assistance for alternate dates at no extra charge</li>
              <li>A personal call from our team to discuss alternatives</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">Contact for Refund Queries</h2>
            <p><strong>Seematra Travel Private Limited</strong><br />Email: support@seematra.com<br />WhatsApp: +91 99999 99999<br />Hours: Monday–Saturday, 9 AM – 7 PM IST</p>
          </section>

        </div>
      </div>
    </div>
  );
}
