'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, BookOpen, MessageCircle } from 'lucide-react';

const WHATSAPP = 'https://wa.me/qr/IP26U77IWO5GO1?text=Hi,%20I%20need%20help%20planning%20a%20trip%20with%20Seematra.';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Trips', href: '/itineraries', icon: Map },
  { label: 'Blogs', href: '/blogs', icon: BookOpen },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[9970] bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-md border-t border-brand-border dark:border-brand-border-dark shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                active
                  ? 'text-primary'
                  : 'text-brand-text/50 dark:text-brand-text-dark/50 hover:text-primary'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-outfit font-bold tracking-wide ${active ? 'text-primary' : ''}`}>
                {label}
              </span>
              {active && (
                <span className="absolute -top-0.5 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}

        {/* WhatsApp Chat button */}
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[#25D366] hover:opacity-80 transition-all"
        >
          <MessageCircle size={20} strokeWidth={1.8} />
          <span className="text-[10px] font-outfit font-bold tracking-wide">Chat</span>
        </a>
      </div>
    </nav>
  );
}
