// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import Navbar from '@/components/global/Navbar';
import Footer from '@/components/global/Footer';
import SocialFAB from '@/components/global/SocialFAB';
import ClientWhatsAppSticky from '@/components/global/ClientWhatsAppSticky';
import MobileBottomNav from '@/components/global/MobileBottomNav';
import { Toaster } from 'react-hot-toast';
import { Poppins, Edu_NSW_ACT_Cursive, Boldonse } from 'next/font/google';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins-next',
  display: 'swap',
});

const edu = Edu_NSW_ACT_Cursive({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-edu-next',
  display: 'swap',
});

const boldonse = Boldonse({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-boldonse-next',
  display: 'swap',
});

// ─── Site-wide Metadata ───────────────────────────────────────────────────────
// Hardcoded to production domain — never rely on env vars for canonical/OG URLs
const BASE_URL = 'https://seematra.com';
const OG_IMAGE = 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136945/seematra/backgrounds/uttrakhand.jpg';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Seematra | Premium Uttarakhand Tour Packages & Travel Itineraries',
    template: '%s | Seematra',
  },
  description:
    'Explore the best Uttarakhand tour packages with Seematra. Adventure, spiritual, family & luxury itineraries curated by local Himalayan experts. Book online instantly.',

  keywords: [
    'Uttarakhand tour packages', 'Uttarakhand travel', 'Kedarnath tour',
    'Chardham yatra', 'Himalayan trek', 'Rishikesh rafting packages',
    'Mussoorie trip', 'Nainital tour', 'Seematra travel', 'best OTA India',
    'adventure travel India', 'spiritual tour Uttarakhand',
  ],

  authors: [{ name: 'Seematra', url: BASE_URL }],
  creator: 'Seematra',
  publisher: 'Seematra',

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },

  // Root canonical for homepage — inner pages declare their own via metadata export
  alternates: { canonical: 'https://seematra.com' },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'Seematra',
    title: 'Seematra | Premium Uttarakhand Tour Packages',
    description:
      'Book the best Uttarakhand itineraries online. Adventure, spiritual, family & luxury packages by Seematra — your trusted Himalayan travel partner.',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Seematra – Uttarakhand Travel Packages',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Seematra | Premium Uttarakhand Tour Packages',
    description: 'Book curated Himalayan adventures with Seematra. Adventure, spiritual, family & luxury Uttarakhand itineraries.',
    images: [OG_IMAGE],
    creator: '@seematra',
  },

  // favicon: app/icon.png is automatically picked up by Next.js App Router
  // No need to specify icons manually when using the file convention

  manifest: '/manifest.json',

};

export const viewport = {
  themeColor: '#E87F24',
  width: 'device-width',
  initialScale: 1,
};

// ─── Organization JSON-LD ─────────────────────────────────────────────────────
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Seematra',
  url: BASE_URL,
  logo: 'https://res.cloudinary.com/ddthsmqk8/image/upload/v1780223863/seematra/brand/logo.png',
  description: 'Premium Uttarakhand tour packages and travel itineraries by local Himalayan experts.',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Uttarakhand',
    addressCountry: 'IN',
  },
  areaServed: {
    '@type': 'Place',
    name: 'Uttarakhand, India',
  },
  sameAs: [
    'https://www.facebook.com/seematra',
    'https://www.instagram.com/seematra6?igsh=MTB4eGJlYTU5N2RkeA==',
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${edu.variable} ${boldonse.variable}`}>
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <ClientWhatsAppSticky />
          <main className="min-h-screen pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
          <SocialFAB />
          <Toaster position="bottom-right" toastOptions={{ style: { marginBottom: '72px' } }} />
        </AuthProvider>
      </body>
    </html>
  );
}
