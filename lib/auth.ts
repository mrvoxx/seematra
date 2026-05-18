// lib/auth.ts – NextAuth v4 configuration with email, Google OAuth, and Phone OTP
import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from './mongodb';
import User from '@/models/User';
import { rateLimit } from './rateLimit';

// ─── In-memory brute-force protection ─────────────────────────────────────────
// Tracks failed login attempts per email. Resets on successful login.
// On Vercel serverless, this resets per-instance — acceptable for free tier.
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkLoginAttempts(email: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const record = loginAttempts.get(email.toLowerCase());

  if (record && record.lockedUntil > now) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, message: `Too many failed attempts. Try again in ${minutesLeft} minute(s).` };
  }

  return { allowed: true };
}

function recordFailedAttempt(email: string) {
  const now = Date.now();
  const record = loginAttempts.get(email.toLowerCase());
  const count = (record?.count ?? 0) + 1;

  // Lock after 5 failed attempts for 15 minutes
  loginAttempts.set(email.toLowerCase(), {
    count,
    lockedUntil: count >= 5 ? now + 15 * 60 * 1000 : 0,
  });
}

function clearLoginAttempts(email: string) {
  loginAttempts.delete(email.toLowerCase());
}

// ─── NextAuth Options ─────────────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth — link existing email account or create new
      if (account?.provider === 'google') {
        try {
          await connectDB();
          const existing = await User.findOne({ email: user.email });
          if (!existing) {
            // Auto-create account for new Google users
            await User.create({
              name:     user.name  ?? 'Google User',
              email:    user.email ?? '',
              avatar:   user.image ?? '',
              password: `oauth_google_${Math.random().toString(36)}`, // placeholder, never used
              role: 'user',
            });
          } else if (!existing.avatar && user.image) {
            // Update avatar if missing
            await User.updateOne({ email: user.email }, { avatar: user.image });
          }
        } catch (e) {
          console.error('[Google OAuth] Account create/link error:', e);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = ((user as { role?: string }).role ?? 'user') as 'user' | 'admin';
      }
      // For Google OAuth, fetch role from DB since it's not in the OAuth profile
      if (account?.provider === 'google' && token.email && !token.role) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email }).select('role _id');
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          }
        } catch (_) {}
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role ?? 'user') as 'user' | 'admin';
      }
      return session;
    },
  },

  providers: [
    // ─── Google OAuth ──────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Link Google to existing email accounts
    }),

    // ─── Email + Password ──────────────────────────────────────────────────
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // Rate limit by IP (5 login attempts per 10 minutes per IP)
        const ip = (req as any)?.headers?.['x-forwarded-for'] || 'unknown';
        if (!rateLimit(ip as string, 5, 10 * 60 * 1000)) {
          throw new Error('Too many login attempts. Please try again later.');
        }

        // Brute-force protection per email
        const { allowed, message } = checkLoginAttempts(credentials.email);
        if (!allowed) throw new Error(message);

        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

        if (!user || !user.password) {
          recordFailedAttempt(credentials.email);
          return null;
        }

        const valid = await user.comparePassword(credentials.password);
        if (!valid) {
          recordFailedAttempt(credentials.email);
          return null;
        }

        clearLoginAttempts(credentials.email);
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    // ─── Phone OTP ─────────────────────────────────────────────────────────
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        await connectDB();

        // Import dynamically to avoid circular deps
        const OtpVerification = (await import('@/models/OtpVerification')).default;
        const bcrypt = (await import('bcryptjs')).default;

        const now = new Date();
        const record = await OtpVerification.findOne({
          phone: credentials.phone,
          expiresAt: { $gt: now },
          verified: false,
        }).sort({ createdAt: -1 });

        if (!record) throw new Error('OTP expired or not found. Please request a new one.');
        if (record.attempts >= 3) throw new Error('Too many incorrect attempts. Please request a new OTP.');

        const valid = await bcrypt.compare(credentials.otp, record.otp);
        if (!valid) {
          await OtpVerification.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
          throw new Error('Incorrect OTP. Please try again.');
        }

        // Mark as verified
        await OtpVerification.updateOne({ _id: record._id }, { verified: true });

        // Find or create user
        let user = await User.findOne({ phone: credentials.phone });
        if (!user) {
          user = await User.create({
            name: `User ${credentials.phone.slice(-4)}`,
            email: `phone_${credentials.phone}@seematra.internal`,
            phone: credentials.phone,
            password: `otp_${Math.random().toString(36)}`, // placeholder
            role: 'user',
          });
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
};

// Helper to get session on the server
export const getSession = () => getServerSession(authOptions);
