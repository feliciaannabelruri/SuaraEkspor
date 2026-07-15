import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({ icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-primary/60 mb-4">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="text-primary text-lg font-bold mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm mb-6 max-w-sm">{description}</p>}
      
      {cta && (
        cta.href ? (
          <Link href={cta.href} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            {cta.label}
          </Link>
        ) : (
          <button onClick={cta.onClick} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
            {cta.label}
          </button>
        )
      )}
    </div>
  );
}
