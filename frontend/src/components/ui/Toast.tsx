import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 3000 }) => {
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
    <div className="fixed top-24 left-1/2 z-50 -translate-x-1/2 transform animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white shadow-lg shadow-primary/20">
        <span className="material-symbols-outlined text-xl">info</span>
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
};
