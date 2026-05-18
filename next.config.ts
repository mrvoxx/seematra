import type { NextConfig } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';
const isProd = process.env.NODE_ENV === 'production';

// ─── Content Security Policy ─────────────────────────────────────────────────
// Allows Razorpay, Google Fonts, Cloudinary, and WhatsApp OTP provider
const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://images.unsplash.com`,
  `connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://api.msg91.com`,
  `frame-src https://api.razorpay.com https://checkout.razorpay.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join('; ');

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  // ─── Bundle Optimization ──────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  serverExternalPackages: ['mongoose', 'pdfkit'],

  allowedDevOrigins: ['lexical-hydropathic-lottie.ngrok-free.dev'],

  async headers() {
    return [
      // ─── Global security headers ──────────────────────────────────────────
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',           value: 'nosniff' },
          { key: 'X-Frame-Options',                  value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',                 value: '1; mode=block' },
          { key: 'Referrer-Policy',                  value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',               value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          // HSTS — tell browsers to always use HTTPS (only enforce in production)
          ...(isProd ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }] : []),
          // CSP — only enforce in production, report-only in dev
          ...(isProd
            ? [{ key: 'Content-Security-Policy', value: CSP }]
            : [{ key: 'Content-Security-Policy-Report-Only', value: CSP }]
          ),
        ],
      },

      // ─── API CORS — restricted to your own origin only ────────────────────
      // ⚠️ SECURITY FIX: Removed wildcard '*' — was allowing any site to call your API
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin',      value: BASE_URL },
          { key: 'Access-Control-Allow-Methods',     value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers',     value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },

      // ─── Static asset caching ─────────────────────────────────────────────
      {
        source: '/:all*(ico|png|jpg|jpeg|svg|webp|avif|woff2|woff|ttf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
