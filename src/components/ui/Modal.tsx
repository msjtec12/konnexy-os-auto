import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
        <div
          className={`relative transform overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white text-left shadow-2xl transition-all w-full ${maxWidthStyles[maxWidth]} animate-in slide-in-from-bottom sm:slide-in-from-bottom-2 duration-200 border border-slate-200`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="p-5 sm:p-6 pb-3 border-b border-slate-100 flex items-start justify-between">
              <div>
                {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
                {description && <p className="text-xs sm:text-sm text-slate-500 mt-1">{description}</p>}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
