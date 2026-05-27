import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Seematra',
  description: 'Read the privacy policy governing use of Seematra travel services.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      <div className="container mx-auto px-4 lg:px-8 pt-32 pb-16 max-w-4xl">
        <div className="mb-10">
          <p className="text-sm text-primary font-inter font-semibold uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl font-boldonse font-normal text-brand-text dark:text-brand-text-dark mb-4">Privacy Policy</h1>
          <p className="text-sm text-brand-text/50 dark:text-brand-text-dark/50 font-inter">Last Updated: May 26, 2026</p>
        </div>

        <div className="prose dark:prose-invert max-w-none font-inter text-brand-text/80 dark:text-brand-text-dark/80 space-y-8">
          
          <p>
            Seematra values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.
          </p>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">1. Information We Collect</h2>
            <p>We may collect the following information when you use Seematra:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Full name</li>
              <li>Contact details (phone number, email)</li>
              <li>Government-issued ID (Aadhaar, Passport, Driving Licence, etc.)</li>
              <li>Travel details (dates, preferences, itinerary selections)</li>
              <li>Payment and transaction details</li>
              <li>Emergency contact information</li>
            </ul>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">2. How We Use Your Information</h2>
            <p>Your information is used for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Booking and confirming travel services</li>
              <li>Coordinating hotels, transport, and activities</li>
              <li>Identity verification for safety purposes</li>
              <li>Providing customer support during travel</li>
              <li>Sending booking updates and confirmations</li>
              <li>Emergency assistance coordination</li>
            </ul>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">3. Information Sharing</h2>
            <p>We only share necessary information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hotels and accommodation partners</li>
              <li>Transport providers</li>
              <li>Licensed tour guides</li>
              <li>Local activity operators</li>
              <li>Emergency or legal authorities (if required by law)</li>
            </ul>
            <p className="mt-4 font-semibold">
              We do not sell, rent, or trade your personal data to third parties.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">4. Document Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identification documents are used strictly for verification purposes.</li>
              <li>We take reasonable technical and organizational measures to protect your data.</li>
              <li>However, no digital system is 100% secure, and users share data at their own risk.</li>
            </ul>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">5. Data Retention</h2>
            <p>We retain user data only as long as necessary for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Booking completion</li>
              <li>Legal compliance</li>
              <li>Dispute resolution</li>
              <li>Safety records</li>
            </ul>
            <p className="mt-4">
              After this, data is securely deleted or anonymized.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">6. User Rights</h2>
            <p>Users may request:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access to their personal data</li>
              <li>Correction of incorrect information</li>
              <li>Deletion of data (subject to legal requirements)</li>
            </ul>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">7. Cookies &amp; Tracking</h2>
            <p>If applicable, Seematra may use cookies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Improve website performance</li>
              <li>Understand user behavior</li>
              <li>Enhance booking experience</li>
            </ul>
            <p className="mt-4">
              Users can disable cookies in browser settings.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">8. Changes to Privacy Policy</h2>
            <p>
              Seematra may update this policy from time to time. Continued use of our services means acceptance of the updated policy.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">9. Contact</h2>
            <p>
              For privacy-related concerns, users may contact Seematra through official support channels.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
