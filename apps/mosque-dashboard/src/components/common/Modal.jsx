import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-surface/90 dark:bg-on-surface/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[24px] shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-lg border-b border-white/20 dark:border-white/10 shrink-0">
          <h2 className="text-title-lg font-title-lg text-on-surface dark:text-white m-0">{title}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-on-surface-variant dark:text-outline-variant transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-lg overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
