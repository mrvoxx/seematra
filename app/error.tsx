'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Seematra Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark px-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-outfit font-bold text-brand-text dark:text-brand-text-dark mb-3">
          Something Went Wrong
        </h1>
        <p className="text-brand-text/60 dark:text-brand-text-dark/60 font-inter mb-8 text-sm leading-relaxed">
          An unexpected error occurred. Our team has been notified. Please try again or return home.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link href="/" className="btn-secondary flex items-center gap-2">
            <Home size={16} />
            Go Home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs font-mono text-brand-text/30 dark:text-brand-text-dark/30">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
