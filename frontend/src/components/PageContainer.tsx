import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`mx-auto w-full max-w-2xl px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
};
