'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

export default function ClientWhatsAppSticky() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when user scrolls past 70vh
      if (window.scrollY > window.innerHeight * 0.7) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <a
      href="https://wa.me/919999999999?text=Hi,%20I'm%20interested%20in%20exploring%20Uttarakhand%20with%20Seematra."
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed top-[80px] lg:top-[90px] left-4 z-[99] px-4 py-2 lg:px-5 lg:py-2.5 bg-green-500 text-white rounded-full flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:bg-green-600 hover:scale-105 transition-all duration-300 ${
        show ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-12 opacity-0 pointer-events-none'
      }`}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
      <span className="font-poppins font-medium text-xs lg:text-sm">Plan on WhatsApp</span>
    </a>
  );
}
