// components/global/Navbar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE NOTES — fixes for real-device mobile bugs:
//
// BUG 1 — Hamburger double-fire on iOS:
//   onTouchStart + onClick BOTH fire on a tap. The sequence is:
//   touchstart → touchend → click (300ms later on old iOS, immediately on new).
//   Result: openMenu() called twice → opens then immediately closes.
//   FIX: Use only onClick with touchAction:'manipulation' to eliminate 300ms
//   delay without the double-fire. Remove onTouchStart entirely.
//
// BUG 2 — Drawer clipped by overflow:hidden ancestors (iOS Safari):
//   When Swiper hydrates and mutates the DOM, it can add overflow:hidden to
//   ancestor containers, clipping any position:fixed child inside it.
//   FIX: React Portal (createPortal → document.body) moves the drawer completely
//   outside the React component tree's DOM subtree. It is appended directly to
//   <body>, bypassing ALL stacking contexts, transforms, and overflow:hidden.
//   ALL positioning uses inline styles (not Tailwind classes) to prevent CSS
//   specificity issues on iOS Safari.
//
// BUG 3 — Portal target unavailable during SSR:
//   createPortal(_, document.body) crashes on server because document is undefined.
//   FIX: mounted state — portal only created after useEffect fires (client only).
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';
import ProfileDropdown from './ProfileDropdown';
import { api } from '@/lib/services/api';
import { useUserStore } from '@/store/userStore';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { setUserData } = useUserStore();
  const savedScrollY = useRef(0);

  // Gate for createPortal — document.body only exists in browser
  useEffect(() => { setMounted(true); }, []);

  // Fetch user profile after auth
  useEffect(() => {
    if (status === 'authenticated') {
      api.get('/user/profile').then(data => {
        if (data) setUserData(data);
      }).catch(() => {});
    }
  }, [status, setUserData]);

  // Auto-close drawer on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // iOS-safe body scroll lock:
  // position:fixed + negative top preserves scroll position without janky jump.
  // Restoring requires explicit window.scrollTo — CSS alone is not enough on iOS.
  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      savedScrollY.current = window.scrollY;
      document.body.style.cssText =
        `position:fixed;top:-${savedScrollY.current}px;left:0;right:0;overflow:hidden;width:100%;`;
    } else {
      document.body.style.cssText = '';
      window.scrollTo(0, savedScrollY.current);
    }
    return () => { document.body.style.cssText = ''; };
  }, [isOpen, mounted]);

  // ── Single-event handlers (no onTouchStart — prevents iOS double-fire) ──
  const openMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback((e?: React.MouseEvent | React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsOpen(false);
  }, []);

  const navLinks = [
    { name: 'Home',           href: '/' },
    { name: 'Itineraries',    href: '/itineraries' },
    { name: 'Map',            href: '/map' },
    { name: 'Blogs & Guides', href: '/blogs' },
    { name: 'Reviews',        href: '/reviews' },
    { name: 'About',          href: '/about' },
  ];

  // ── Portal: backdrop + drawer ────────────────────────────────────────────
  // All positioning is inline — Tailwind classes are NOT used for layout here.
  // Reason: iOS Safari can have CSS specificity fights with Tailwind's generated
  // styles, especially after dynamic class injection by Swiper's CSS modules.
  const mobileMenu = mounted && createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        style={{
          position:              'fixed',
          inset:                 0,
          zIndex:                9990,
          backgroundColor:       'rgba(0,0,0,0.55)',
          backdropFilter:        'blur(3px)',
          WebkitBackdropFilter:  'blur(3px)',
          opacity:               isOpen ? 1 : 0,
          pointerEvents:         isOpen ? 'auto' : 'none',
          transition:            'opacity 0.25s ease',
          touchAction:           'none',
        }}
      />

      {/* Drawer panel — all inline, no Tailwind for layout */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position:              'fixed',
          top:                   0,
          right:                 0,
          bottom:                0,
          width:                 'min(85vw, 380px)',
          zIndex:                9991,
          display:               'flex',
          flexDirection:         'column',
          padding:               '24px',
          overflowY:             'auto',
          WebkitOverflowScrolling: 'touch',
          background:            'var(--color-surface)',
          borderLeft:            '1px solid rgba(255,255,255,0.12)',
          boxShadow:             '-8px 0 40px rgba(0,0,0,0.2)',
          transform:             isOpen ? 'translateX(0)' : 'translateX(110%)',
          transition:            'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange:            'transform',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <span className="font-boldonse font-normal text-lg text-secondary dark:text-secondary-dark tracking-wide">
            Seematra
          </span>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            style={{
              width:          '40px',
              height:         '40px',
              borderRadius:   '50%',
              border:         '1px solid rgba(0,0,0,0.1)',
              background:     'rgba(0,0,0,0.04)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              touchAction:    'manipulation',
              flexShrink:     0,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl text-lg font-poppins font-medium transition-colors duration-150 ${
                pathname === link.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-brand-text/80 dark:text-brand-text-dark/80 hover:bg-brand-text/5'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth section */}
        <div style={{ marginTop: '32px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {session ? (
            <ProfileDropdown session={session} isMobile={true} onClose={() => setIsOpen(false)} />
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-full py-4 rounded-full bg-gradient-to-r from-primary to-accent text-surface font-poppins font-bold shadow-lg active:scale-95 transition-transform"
              style={{ touchAction: 'manipulation' }}
            >
              Login / Sign up
            </Link>
          )}
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <>
      {/* Navbar bar — always solid, no dynamic classes to avoid hydration diff */}
      <nav className="fixed top-0 left-0 right-0 z-[9980] py-3 bg-surface dark:bg-surface-dark border-b border-brand-border dark:border-brand-border-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Seematra Logo" width={150} height={28} className="h-7 w-auto object-contain" />
            <span className="text-sm md:text-base font-boldonse font-normal text-secondary dark:text-secondary-dark tracking-wide">
              Seematra
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-poppins font-medium text-base xl:text-lg tracking-wide transition-colors duration-200 ${
                  pathname === link.href
                    ? 'text-primary dark:text-primary font-bold'
                    : 'text-brand-text/90 dark:text-brand-text-dark/90 hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 pl-6 border-l border-brand-text/10 dark:border-brand-text-dark/10">
              <DarkModeToggle />
              {session
                ? <ProfileDropdown session={session} />
                : <Link href="/login" className="btn-primary" style={{ fontSize: 13, padding: '8px 20px' }}>Login</Link>
              }
            </div>
          </div>

          {/* Mobile controls */}
          <div className="flex lg:hidden items-center gap-3">
            <DarkModeToggle />
            {/*
              IMPORTANT: onClick ONLY — no onTouchStart.
              touchAction:'manipulation' removes the 300ms click delay on iOS
              without causing the double-fire that onTouchStart + onClick produces.
            */}
            <button
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              onClick={openMenu}
              style={{ touchAction: 'manipulation' }}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark text-secondary dark:text-secondary-dark cursor-pointer relative z-[9981] active:scale-95 transition-transform shadow-sm"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Portal-mounted mobile drawer */}
      {mobileMenu}
    </>
  );
}
