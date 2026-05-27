import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Seematra',
  description: 'Read the terms and conditions governing use of Seematra travel services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      <div className="container mx-auto px-4 lg:px-8 py-16 max-w-4xl">
        <div className="mb-10">
          <p className="text-sm text-primary font-inter font-semibold uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl font-boldonse font-normal text-brand-text dark:text-brand-text-dark mb-4">Terms &amp; Conditions</h1>
          <p className="text-sm text-brand-text/50 dark:text-brand-text-dark/50 font-inter">Last Updated: May 26, 2026</p>
        </div>

        <div className="prose dark:prose-invert max-w-none font-inter text-brand-text/80 dark:text-brand-text-dark/80 space-y-8">
          
          <p>
            Welcome to Seematra. By accessing or using our platform, services, website, or booking experiences through us, you agree to comply with and be bound by the following Terms &amp; Conditions.
          </p>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">1. About Seematra</h2>
            <p>
              Seematra provides handmade curated Uttarakhand travel itineraries and manages travel arrangements including stays, transportation, activities, guides, and local experiences through trusted partners and local support networks.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">2. Booking Confirmation &amp; Identification Verification</h2>
            <p>To ensure safety, trust, and transparency for all travelers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>After booking confirmation, every traveler must provide a valid government-issued identification proof.</li>
              <li>
                Accepted identification documents include:
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>Aadhaar Card</li>
                  <li>Passport</li>
                  <li>Driving Licence</li>
                  <li>Other valid government-issued IDs</li>
                </ul>
              </li>
            </ul>
            <p className="mt-4">For additional traveler safety and trust:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Assigned guides may also share their identification proof with travelers when required.</li>
              <li>This verification process helps maintain accountability and secure travel experiences.</li>
            </ul>
            <p className="mt-4 font-semibold">
              Failure to provide valid identification may result in booking cancellation.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">3. Booking Payment Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>A mandatory non-blocking reservation token fee of ₹500 is required during booking confirmation.</li>
              <li>
                The remaining payment process is structured as follows:
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>Upon arrival and after hotel/stay check-in, the traveler must pay 50% of the total trip amount.</li>
                  <li>Remaining payment terms, if applicable, will be communicated during booking confirmation.</li>
                </ul>
              </li>
            </ul>
            <p className="mt-4 font-semibold">
              Bookings are considered confirmed only after successful token payment and availability confirmation.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">4. Cancellation &amp; Refund Policy</h2>
            <p>Refund eligibility depends on cancellation timing:</p>

            <h3 className="text-lg font-outfit font-semibold mt-4 mb-2">Full Refund</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>If cancellation is requested within 24 hours of online payment, the traveler is eligible for a full refund.</li>
            </ul>

            <h3 className="text-lg font-outfit font-semibold mt-4 mb-2">Refund After Deduction of ₹500 Reservation Token</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                If cancellation occurs after 24 hours but before 2 days of the trip/start date:
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>₹500 reservation token amount will be deducted.</li>
                  <li>Remaining eligible amount will be refunded.</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-lg font-outfit font-semibold mt-4 mb-2">25% Deduction</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                If cancellation occurs between 3 to 7 days before the trip/start date:
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>25% of the total paid amount will be deducted.</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-lg font-outfit font-semibold mt-4 mb-2">No Refund</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                If cancellation occurs within 7 days of the trip/start date:
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>No refund will be provided.</li>
                </ul>
              </li>
            </ul>

            <p className="mt-4 italic">
              Refund processing time may vary depending on payment providers and banking systems.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">5. Traveler Safety &amp; Emergency Support</h2>
            <p>Traveler safety is a priority at Seematra.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>An active WhatsApp support number will remain available for assistance during the journey.</li>
              <li>Assigned guides may also provide a local support or emergency contact number for quick communication and safety coordination.</li>
              <li>Travelers are encouraged to immediately report emergencies, medical issues, safety concerns, or travel disruptions.</li>
            </ul>
            <p className="mt-4">
              While Seematra aims to provide timely support, emergency response may depend on local authorities, medical services, weather conditions, and third-party providers.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">6. User Responsibilities</h2>
            <p>Travelers agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate booking information</li>
              <li>Carry valid identification during the journey</li>
              <li>Respect local culture, communities, and property</li>
              <li>Follow safety instructions given by guides or coordinators</li>
              <li>Avoid illegal, harmful, or disruptive behavior</li>
            </ul>
            <p className="mt-4 font-semibold">
              Any damages or legal violations caused by travelers remain their responsibility.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">7. Third-Party Services</h2>
            <p>
              Seematra coordinates services through hotels, transport providers, activity operators, and local vendors.
            </p>
            <p className="mt-2">While we strive to work with reliable partners, Seematra is not directly liable for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hotel or transport service quality</li>
              <li>Delays or cancellations</li>
              <li>Weather disruptions</li>
              <li>Road conditions</li>
              <li>Accidents caused by third-party operators</li>
              <li>Actions or negligence of external vendors</li>
            </ul>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">8. Liability Disclaimer</h2>
            <p>
              Travel may involve unforeseen risks including weather changes, road conditions, altitude-related discomfort, or natural events.
            </p>
            <p className="mt-2 font-semibold">
              By booking through Seematra, travelers acknowledge and voluntarily accept these risks.
            </p>
            <p className="mt-4">Seematra shall not be held liable for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal injury</li>
              <li>Loss of belongings</li>
              <li>Delays</li>
              <li>Natural disasters</li>
              <li>Government restrictions</li>
              <li>Force majeure events</li>
              <li>Unforeseen travel disruptions beyond operational control</li>
            </ul>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">9. Intellectual Property</h2>
            <p>
              All Seematra content including itineraries, branding, logos, graphics, text, and digital material are protected intellectual property and may not be copied, reproduced, or commercially used without permission.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">10. Privacy Policy</h2>
            <p>
              Traveler information and identification documents are collected only for booking verification, safety, and operational purposes.
            </p>
            <p className="mt-2">
              Seematra does not sell personal data to third parties and takes reasonable measures to protect user information.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">11. Governing Law</h2>
            <p>
              These Terms &amp; Conditions shall be governed under the laws of India.
            </p>
            <p className="mt-2">
              Any disputes shall fall under the jurisdiction of the competent courts of Uttarakhand, India.
            </p>
          </section>

          <hr className="border-brand-border dark:border-brand-border-dark" />

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">12. Consent</h2>
            <p>
              By using Seematra services and confirming bookings, travelers acknowledge that they have read, understood, and agreed to these Terms &amp; Conditions.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
