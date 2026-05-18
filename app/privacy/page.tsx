import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Seematra collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      <div className="container mx-auto px-4 lg:px-8 py-16 max-w-4xl">
        <div className="mb-10">
          <p className="text-sm text-primary font-inter font-semibold uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl font-boldonse font-normal text-brand-text dark:text-brand-text-dark mb-4">Privacy Policy</h1>
          <p className="text-sm text-brand-text/50 dark:text-brand-text-dark/50 font-inter">Last updated: May 16, 2025</p>
        </div>

        <div className="prose dark:prose-invert max-w-none font-inter text-brand-text/80 dark:text-brand-text-dark/80 space-y-8">

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">1. Who We Are</h2>
            <p>Seematra Travel Private Limited ("Seematra", "we", "our", or "us") is a travel services company registered in Uttarakhand, India. We operate the website <strong>seematra.com</strong> and associated mobile interfaces. Our registered address is: 12, Himalayan Market Road, Rishikesh, Uttarakhand – 249201, India.</p>
            <p>This Privacy Policy describes how we collect, use, disclose, and protect your personal information when you use our services, book travel packages, or interact with our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">2. Information We Collect</h2>
            <p>We collect information you provide directly to us:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> Name, email address, mobile number, and password when you register.</li>
              <li><strong>Booking information:</strong> Travel dates, group size, pickup location, and contact details for tour reservations.</li>
              <li><strong>Payment information:</strong> We do not store card details. Payment is processed securely by Razorpay under PCI-DSS compliance.</li>
              <li><strong>Communication data:</strong> Messages sent via WhatsApp enquiry, contact forms, or email support.</li>
              <li><strong>Usage data:</strong> Pages visited, search queries, device type, browser, and IP address — collected automatically via cookies and analytics tools.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process and confirm your travel bookings</li>
              <li>Send booking confirmations, itinerary updates, and payment receipts</li>
              <li>Respond to your customer support enquiries</li>
              <li>Send promotional offers, travel guides, and seasonal packages (you can opt out anytime)</li>
              <li>Improve our website performance, detect fraud, and ensure platform security</li>
              <li>Comply with legal obligations under Indian law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">4. Information Sharing</h2>
            <p>We do not sell, rent, or trade your personal data. We may share it with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Service providers:</strong> Razorpay (payments), MongoDB Atlas (database), Vercel (hosting) — only to the extent necessary to deliver our services.</li>
              <li><strong>Ground operators:</strong> Local drivers, guides, or hotel partners who need your name and contact for fulfilling your booked experience.</li>
              <li><strong>Legal authorities:</strong> If required by law, court order, or government directive.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">5. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active or as needed to provide services. Booking records are retained for 7 years as required by Indian accounting and tax regulations. You may request deletion of your account and personal data by writing to us at <strong>privacy@seematra.com</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">6. Cookies</h2>
            <p>We use essential cookies to keep you logged in and remember preferences, and analytics cookies (via Google Analytics) to understand how visitors use our site. You can disable cookies in your browser settings, though some features may not function correctly.</p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">7. Your Rights</h2>
            <p>Under applicable Indian privacy law (IT Act 2000 & DPDP Act 2023), you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data we hold</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>
            <p>To exercise these rights, contact: <strong>privacy@seematra.com</strong></p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">8. Security</h2>
            <p>We use industry-standard security measures including HTTPS encryption, hashed passwords (bcrypt), and restricted database access. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong unique password and never share your login credentials.</p>
          </section>

          <section>
            <h2 className="text-xl font-outfit font-semibold text-brand-text dark:text-brand-text-dark mb-3">9. Contact Us</h2>
            <p>For privacy-related queries, write to us at:</p>
            <p><strong>Seematra Travel Private Limited</strong><br />12, Himalayan Market Road, Rishikesh, Uttarakhand – 249201<br />Email: privacy@seematra.com<br />Phone: +91 99999 99999</p>
          </section>

        </div>
      </div>
    </div>
  );
}
