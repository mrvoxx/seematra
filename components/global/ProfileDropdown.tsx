'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { User as UserIcon, Heart, BookOpen, CreditCard, Settings, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';

interface Props {
  session: any;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function ProfileDropdown({ session, isMobile = false, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Close when clicking outside
  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U';
  const avatarUrl = session?.user?.image || null;
  const isAdmin = (session?.user as any)?.role === 'admin';

  const handleLinkClick = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-2 mt-4 pt-4 border-t border-brand-border/30 dark:border-brand-border-dark/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {userInitial}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-outfit font-bold text-lg text-brand-text dark:text-brand-text-dark">{session?.user?.name}</span>
            <span className="text-xs font-inter text-brand-text/60 dark:text-brand-text-dark/60">{session?.user?.email}</span>
          </div>
        </div>

        {isAdmin && (
          <Link href="/admin" onClick={handleLinkClick} className="flex items-center gap-3 py-3 px-2 font-bold text-secondary hover:text-primary transition-colors border border-primary/20 bg-primary/5 rounded-xl mb-2">
            <LayoutDashboard size={18} /> Admin Panel
          </Link>
        )}
        <Link href="/dashboard?tab=profile" onClick={handleLinkClick} className="flex items-center gap-3 py-3 px-2 text-brand-text dark:text-brand-text-dark hover:text-primary transition-colors">
          <UserIcon size={18} /> My Profile
        </Link>
        <Link href="/dashboard?tab=favorite-itineraries" onClick={handleLinkClick} className="flex items-center gap-3 py-3 px-2 text-brand-text dark:text-brand-text-dark hover:text-primary transition-colors">
          <Heart size={18} /> Favorite Itineraries
        </Link>
        <Link href="/dashboard?tab=favorite-blogs" onClick={handleLinkClick} className="flex items-center gap-3 py-3 px-2 text-brand-text dark:text-brand-text-dark hover:text-primary transition-colors">
          <BookOpen size={18} /> Favorite Blogs & Guides
        </Link>
        <Link href="/dashboard?tab=payments" onClick={handleLinkClick} className="flex items-center gap-3 py-3 px-2 text-brand-text dark:text-brand-text-dark hover:text-primary transition-colors">
          <CreditCard size={18} /> Payment History
        </Link>
        <Link href="/dashboard?tab=settings" onClick={handleLinkClick} className="flex items-center gap-3 py-3 px-2 text-brand-text dark:text-brand-text-dark hover:text-primary transition-colors">
          <Settings size={18} /> Settings
        </Link>
        
        <button
          onClick={() => { signOut(); handleLinkClick(); }}
          className="flex items-center gap-3 py-3 px-2 text-accent hover:opacity-80 transition-opacity mt-4 border-t border-brand-border/30 dark:border-brand-border-dark/30"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="flex items-center gap-2 hover:bg-surface-dark/5 dark:hover:bg-surface/5 p-1.5 rounded-full transition-colors"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-primary" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {userInitial}
          </div>
        )}
        <ChevronDown size={14} className={`text-brand-text dark:text-brand-text-dark transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-surface dark:bg-surface-dark rounded-2xl shadow-xl border border-brand-border/50 dark:border-brand-border-dark/50 overflow-hidden z-50 animate-fade-up">
          <div className="p-4 border-b border-brand-border/30 dark:border-brand-border-dark/30 bg-primary/5">
            <p className="font-outfit font-bold text-brand-text dark:text-brand-text-dark truncate">{session?.user?.name}</p>
            <p className="text-xs font-inter text-brand-text/60 dark:text-brand-text-dark/60 truncate">{session?.user?.email}</p>
          </div>
          <div className="flex flex-col p-2">
            {isAdmin && (
              <Link href="/admin" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-secondary bg-primary/5 border border-primary/20 mb-1 hover:bg-primary/10 hover:text-primary transition-colors">
                <LayoutDashboard size={16} /> Admin Panel
              </Link>
            )}
            <Link href="/dashboard?tab=profile" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-text dark:text-brand-text-dark hover:bg-primary/10 hover:text-primary transition-colors">
              <UserIcon size={16} /> Profile Info
            </Link>
            <Link href="/dashboard?tab=favorite-itineraries" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-text dark:text-brand-text-dark hover:bg-primary/10 hover:text-primary transition-colors">
              <Heart size={16} /> Favorite Itineraries
            </Link>
            <Link href="/dashboard?tab=favorite-blogs" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-text dark:text-brand-text-dark hover:bg-primary/10 hover:text-primary transition-colors">
              <BookOpen size={16} /> Favorite Blogs
            </Link>
            <Link href="/dashboard?tab=payments" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-text dark:text-brand-text-dark hover:bg-primary/10 hover:text-primary transition-colors">
              <CreditCard size={16} /> Payment History
            </Link>
            <div className="h-px bg-brand-border/30 dark:bg-brand-border-dark/30 my-1 mx-2" />
            <Link href="/dashboard?tab=settings" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-text dark:text-brand-text-dark hover:bg-primary/10 hover:text-primary transition-colors">
              <Settings size={16} /> Settings
            </Link>
            <button
              onClick={() => { signOut(); handleLinkClick(); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-accent hover:bg-accent/10 transition-colors w-full text-left"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
