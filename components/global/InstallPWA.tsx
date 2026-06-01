'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show the prompt after a slight delay so it's not too aggressive
      setTimeout(() => setShowInstall(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
  };

  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[100]"
        >
          <div className="bg-white/90 dark:bg-brand-card-dark/90 backdrop-blur-xl border border-brand-border dark:border-brand-border-dark p-4 rounded-2xl shadow-2xl flex items-center gap-4 relative overflow-hidden">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent dark:from-white/5 pointer-events-none" />
            
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
              <Download className="text-primary w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-outfit font-bold text-sm text-brand-text dark:text-brand-text-dark truncate">
                Install Seematra App
              </h4>
              <p className="font-inter text-xs text-brand-text/60 dark:text-brand-text-dark/60 mt-0.5 line-clamp-1">
                Get fast access and offline mode.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-primary hover:bg-primary-hover text-white font-outfit font-bold text-xs px-4 py-2 rounded-lg shadow-md transition-colors"
              >
                Install
              </button>
            </div>

            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-brand-text/40 hover:text-brand-text/70 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
