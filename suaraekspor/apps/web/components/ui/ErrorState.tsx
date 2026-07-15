import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullHeight?: boolean;
}

export default function ErrorState({ 
  title = 'Terjadi Kesalahan', 
  message = 'Gagal memuat data. Silakan coba lagi.', 
  onRetry,
  fullHeight = false
}: ErrorStateProps) {
  const content = (
    <div className="bg-error-container/20 rounded-2xl border border-error/20 p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto w-full">
      <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center text-error mb-4">
        <span className="material-symbols-outlined text-[24px]">error</span>
      </div>
      <h3 className="text-error text-base font-bold mb-2">{title}</h3>
      <p className="text-error/80 text-sm mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="inline-flex items-center gap-2 border border-error/30 text-error px-5 py-2 rounded-lg font-bold text-sm hover:bg-error/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Coba Lagi
        </button>
      )}
    </div>
  );

  if (fullHeight) {
    return (
      <div className="min-h-[400px] flex items-center justify-center w-full px-4">
        {content}
      </div>
    );
  }

  return content;
}
