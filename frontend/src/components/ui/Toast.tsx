import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 2000, action }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, message, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 z-[200] -translate-x-1/2 transform animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-4 rounded-xl bg-background-dark dark:bg-background-light px-6 py-3 text-white dark:text-black shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-primary">info</span>
          <p className="font-semibold text-sm whitespace-nowrap">{message}</p>
        </div>
        {action && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              onClose();
            }}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
