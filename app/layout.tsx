// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import Navbar from '@/components/global/Navbar';
import Footer from '@/components/global/Footer';
import SocialFAB from '@/components/global/SocialFAB';
import ClientWhatsAppSticky from '@/components/global/ClientWhatsAppSticky';
import { Toaster } from 'react-hot-toast';

// ─── Site-wide Metadata ───────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

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

  alternates: { canonical: BASE_URL },

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
        url: `${BASE_URL}/og-image.jpg`,
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
    images: [`${BASE_URL}/og-image.jpg`],
    creator: '@seematra',
  },

  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },

  manifest: '/manifest.json',

  verification: {
    google: 'your-google-site-verification-code', // Replace after verifying with Google Search Console
  },
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
  logo: `${BASE_URL}/logo.png`,
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
    'https://www.instagram.com/seematra',
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Google Fonts — loaded via <link> so browsers fetch with correct User-Agent (gets WOFF2, not TTF) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Boldonse&family=Edu+NSW+ACT+Cursive:wght@400..700&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        />
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
          <main className="min-h-screen">{children}</main>
          <Footer />
          <SocialFAB />
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
