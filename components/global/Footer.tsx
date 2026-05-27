// components/global/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface dark:bg-surface-dark border-t border-brand-border dark:border-brand-border-dark pt-16 pb-8 mt-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="Seematra Logo" 
                width={150}
                height={40}
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-xl font-outfit font-extrabold tracking-tight text-brand-text dark:text-brand-text-dark">
                Seematra
              </span>
            </Link>
            <p className="text-sm text-brand-text/70 dark:text-brand-text-dark/70 font-inter leading-relaxed">
              Curated travel experiences in the heart of Uttarakhand. We bring you closer to mountains, spirituality, and adventure.
              <br /><br />
              <strong>Office:</strong> Bhairav Colony, Gali no 1, Bhattowala, Gumamniwala<br />
              Rishikesh, Uttarakhand
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-outfit font-bold text-lg">Experiences</h4>
            <div className="flex flex-col gap-2 text-sm text-brand-text/70 dark:text-brand-text-dark/70">
              <Link href="/itineraries?genre=Adventure" className="hover:text-primary transition-colors">Adventure Tours</Link>
              <Link href="/itineraries?genre=Spiritual" className="hover:text-primary transition-colors">Spiritual Pilgrimages</Link>
              <Link href="/itineraries?genre=Wildlife" className="hover:text-primary transition-colors">Wildlife Safaris</Link>
              <Link href="/itineraries?genre=Family" className="hover:text-primary transition-colors">Family Packages</Link>
            </div>
          </div>

          {/* Links Col 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-outfit font-bold text-lg">Important Links</h4>
            <div className="flex flex-col gap-2 text-sm text-brand-text/70 dark:text-brand-text-dark/70">
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="/reviews" className="hover:text-primary transition-colors">Traveler Reviews</Link>
              <Link href="/blogs" className="hover:text-primary transition-colors">Travel Guides</Link>
              <Link href="/map" className="hover:text-primary transition-colors">Interactive Map</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
            </div>
          </div>

          {/* Legal Col */}
          <div className="flex flex-col gap-4">
            <h4 className="font-outfit font-bold text-lg">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-brand-text/70 dark:text-brand-text-dark/70">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
              <Link href="/cancellation" className="hover:text-primary transition-colors">Cancellation Policy</Link>
            </div>
          </div>

        </div>

        <div className="border-t border-brand-border dark:border-brand-border-dark pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-brand-text/50 dark:text-brand-text-dark/50">
            &copy; {new Date().getFullYear()} Seematra Tourism. All rights reserved.
          </p>
          <div className="text-xs text-brand-text/50 dark:text-brand-text-dark/50">
            Powered by Next.js & Mongoose
          </div>
        </div>
      </div>
    </footer>
  );
}
