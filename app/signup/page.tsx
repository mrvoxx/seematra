'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || undefined, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success('Account created! Please log in.');
      router.push('/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 pt-24 bg-surface dark:bg-surface-dark">
      <div className="w-full max-w-md card p-8 md:p-10 animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-outfit font-extrabold mb-2 text-brand-text dark:text-brand-text-dark">Create Account</h1>
          <p className="text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70">Join Seematra and start your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-inter font-bold text-brand-text dark:text-brand-text-dark mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field" 
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-inter font-bold text-brand-text dark:text-brand-text-dark mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" 
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-inter font-bold text-brand-text dark:text-brand-text-dark mb-1">
              Mobile Number <span className="text-brand-text/40 font-normal">(optional — one account per number)</span>
            </label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field" 
              placeholder="9876543210"
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-sm font-inter font-bold text-brand-text dark:text-brand-text-dark mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2 py-4">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm font-inter text-brand-text/70 dark:text-brand-text-dark/70">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
