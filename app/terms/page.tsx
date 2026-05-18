import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the terms and conditions governing use of Seematra travel services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      <div className="container mx-auto px-4 lg:px-8 py-16 max-w-4xl">
        <div className="mb-10">
          <p className="text-sm text-primary font-inter font-semibold uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl font-boldonse font-normal text-brand-text dark:text-brand-text-dark mb-4">Terms &amp; Conditions</h1>
          <p className="text-sm text-brand-text/50 dark:text-brand-text-dark/50 font-inter">Last updated: May 16, 2025</p>
        </div>

        <div className="prose dark:prose-invert max-w-none font-inter text-brand-text/80 dark:text-brand-text-dark/80 space-y-8">

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Seematra platform (seematra.com), creating an account, or completing a booking, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our services. These terms apply to all users including travelers, visitors, and guests.</p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">2. Bookings and Payment</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All bookings are subject to availability and confirmation by Seematra.</li>
              <li>Prices are listed in Indian Rupees (INR) inclusive of applicable taxes unless stated otherwise.</li>
              <li>A booking is confirmed only after successful payment processing via Razorpay.</li>
              <li>Advance payment options may be available for select packages. Remaining balance is due as per the package terms.</li>
              <li>Seematra reserves the right to modify prices without prior notice. Existing confirmed bookings will not be affected by price changes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">3. Cancellation &amp; Refund Policy</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="text-left p-3 border border-brand-border dark:border-brand-border-dark">Notice Period Before Tour Date</th>
                    <th className="text-left p-3 border border-brand-border dark:border-brand-border-dark">Refund Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-brand-border dark:border-brand-border-dark">More than 15 days</td>
                    <td className="p-3 border border-brand-border dark:border-brand-border-dark">100% refund</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-brand-border dark:border-brand-border-dark">7 to 15 days</td>
                    <td className="p-3 border border-brand-border dark:border-brand-border-dark">50% refund</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-brand-border dark:border-brand-border-dark">Less than 7 days</td>
                    <td className="p-3 border border-brand-border dark:border-brand-border-dark">No refund</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-brand-border dark:border-brand-border-dark">Force majeure (natural disasters, road blockages)</td>
                    <td className="p-3 border border-brand-border dark:border-brand-border-dark">Full credit note for future use</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">Refunds are processed within 7–10 business days to the original payment method.</p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">4. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 18 years old to create an account and make bookings.</li>
              <li>You are responsible for ensuring all travelers in your group meet the physical fitness requirements for adventure activities.</li>
              <li>Accurate personal and contact information must be provided at the time of booking.</li>
              <li>You must not misuse the platform for fraudulent transactions or impersonation.</li>
              <li>One account per person and one account per phone number is permitted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">5. Liability Disclaimer</h2>
            <p>Seematra acts as an organizer and facilitator of travel experiences. While we take all reasonable precautions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We are not liable for personal injury, loss, or damages resulting from unforeseen natural events, accidents, or traveler negligence.</li>
              <li>Adventure activities (trekking, rafting, skiing) carry inherent risks. Participants do so at their own risk.</li>
              <li>Seematra's maximum liability in any case is limited to the booking amount paid for the affected package.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">6. Intellectual Property</h2>
            <p>All content on seematra.com — including text, photography, itinerary descriptions, logos, and videos — is the intellectual property of Seematra Travel Private Limited and may not be reproduced, redistributed, or used commercially without written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">7. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Rishikesh, Uttarakhand. We encourage resolution of disputes through direct communication before any legal proceedings.</p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">8. Contact</h2>
            <p><strong>Seematra Travel Private Limited</strong><br />12, Himalayan Market Road, Rishikesh, Uttarakhand – 249201<br />Email: legal@seematra.com<br />Phone: +91 99999 99999</p>
          </section>

        </div>
      </div>
    </div>
  );
}
