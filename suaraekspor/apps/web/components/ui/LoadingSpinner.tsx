import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullHeight?: boolean;
}

export default function LoadingSpinner({ size = 'md', label = 'Memuat...', fullHeight = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-gray-200 border-t-secondary-container rounded-full animate-spin`} />
      {label && <p className="text-gray-500 text-sm font-medium animate-pulse">{label}</p>}
    </div>
  );

  if (fullHeight) {
    return (
      <div className="min-h-[400px] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
}
