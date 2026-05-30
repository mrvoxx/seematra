// components/global/Modal.tsx
'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 pt-[70px] sm:pt-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg sm:max-w-2xl bg-brand-card dark:bg-brand-card-dark rounded-2xl shadow-2xl border border-brand-border dark:border-brand-border-dark animate-fade-up max-h-[calc(100svh-80px)] sm:max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 pt-5 pb-4 border-b border-brand-border dark:border-brand-border-dark shrink-0">
          <h2 className="text-base sm:text-xl font-poppins font-bold leading-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface dark:hover:bg-surface-dark transition-colors shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
