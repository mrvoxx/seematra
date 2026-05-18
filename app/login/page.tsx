'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, Smartphone, Eye, EyeOff, Shield, ArrowRight, RefreshCw } from 'lucide-react';

type Tab = 'email' | 'otp' | 'google';

export default function LoginPage() {
  const [tab, setTab]               = useState<Tab>('email');
  const [loading, setLoading]       = useState(false);
  const router = useRouter();

  // ─── Email/Password state ─────────────────────────────────────────────────
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ─── OTP state ───────────────────────────────────────────────────────────
  const [phone, setPhone]           = useState('');
  const [otp, setOtp]               = useState('');
  const [otpSent, setOtpSent]       = useState(false);
  const [cooldown, setCooldown]     = useState(0);

  // ─── Email/Password login ────────────────────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', { redirect: false, email, password });
    setLoading(false);
    if (res?.error) {
      toast.error(res.error === 'CredentialsSignin' ? 'Invalid email or password.' : res.error);
    } else {
      toast.success('Welcome back! 🎉');
      router.push('/dashboard');
      router.refresh();
    }
  };

  // ─── Send OTP ────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOtpSent(true);
      toast.success('OTP sent! Check your SMS / WhatsApp.');
      // Start 60s cooldown
      let t = 60;
      setCooldown(t);
      const interval = setInterval(() => {
        t -= 1;
        setCooldown(t);
        if (t <= 0) clearInterval(interval);
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Verify OTP + sign in ────────────────────────────────────────────────
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP.'); return; }
    setLoading(true);
    const res = await signIn('phone-otp', { redirect: false, phone, otp });
    setLoading(false);
    if (res?.error) {
      toast.error(res.error === 'CredentialsSignin' ? 'Incorrect or expired OTP.' : res.error);
    } else {
      toast.success('Logged in successfully! 🎉');
      router.push('/dashboard');
      router.refresh();
    }
  };

  // ─── Google login ─────────────────────────────────────────────────────────
  const handleGoogleLogin = () => {
    setLoading(true);
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const tabs = [
    { id: 'email' as Tab,  label: 'Email',  icon: Mail },
    { id: 'otp'   as Tab,  label: 'Phone',  icon: Smartphone },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 pt-24 bg-surface dark:bg-surface-dark">
      <div className="w-full max-w-md animate-fade-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-outfit font-extrabold mb-2">Welcome Back</h1>
          <p className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70">
            Sign in to manage your bookings and itineraries.
          </p>
        </div>

        {/* Card */}
        <div className="card p-6 md:p-8">

          {/* Tab Switcher */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                  tab === id
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* ─── Email/Password Form ─── */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 mt-1">
                {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* ─── Phone OTP Form ─── */}
          {tab === 'otp' && (
            <form onSubmit={handleOtpLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="input-field w-16 text-center font-bold shrink-0 bg-gray-50 dark:bg-gray-800">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="input-field flex-1"
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={otpSent}
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || phone.length < 10}
                  className="btn-primary w-full justify-center py-4"
                >
                  {loading ? 'Sending...' : 'Send OTP via SMS / WhatsApp'}
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input-field text-center tracking-[0.5em] text-xl font-bold"
                      placeholder="• • • • • •"
                      maxLength={6}
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      OTP sent to +91 {phone}.{' '}
                      {cooldown > 0 ? (
                        <span className="text-gray-400">Resend in {cooldown}s</span>
                      ) : (
                        <button type="button" onClick={handleSendOtp} className="text-primary font-bold hover:underline inline-flex items-center gap-1">
                          <RefreshCw size={11} /> Resend
                        </button>
                      )}
                    </p>
                  </div>
                  <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full justify-center py-4">
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </>
              )}
            </form>
          )}

          {/* ─── Divider ─── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* ─── Google Button ─── */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5 transition-all font-bold text-sm"
          >
            {/* Google 'G' logo SVG */}
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Trust line */}
          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
            <Shield size={11} /> Your data is encrypted and never shared.
          </p>
        </div>

        {/* Sign up link */}
        <p className="text-center mt-5 text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70">
          New to Seematra?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">Create free account</Link>
        </p>
      </div>
    </div>
  );
}
