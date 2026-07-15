import React from 'react';

export type BadgeVariant = 'done' | 'processing' | 'pending' | 'error' | 'export-ready' | 'category' | 'new' | 'custom';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
  icon?: string;
}

export default function Badge({ variant, label, className = '', icon }: BadgeProps) {
  const styles: Record<BadgeVariant, { bg: string, text: string, defaultIcon?: string, defaultLabel?: string }> = {
    done: { bg: 'bg-green-100', text: 'text-green-700', defaultIcon: 'check_circle', defaultLabel: 'Done' },
    processing: { bg: 'bg-secondary-container/10', text: 'text-secondary-container', defaultIcon: 'sync', defaultLabel: 'Processing' },
    pending: { bg: 'bg-gray-100', text: 'text-gray-500', defaultIcon: 'hourglass_empty', defaultLabel: 'Pending' },
    error: { bg: 'bg-error-container', text: 'text-error', defaultIcon: 'error', defaultLabel: 'Error' },
    'export-ready': { bg: 'bg-primary-fixed-dim/30', text: 'text-primary', defaultIcon: 'workspace_premium', defaultLabel: 'Export Ready' },
    category: { bg: 'bg-gray-100', text: 'text-gray-600', defaultLabel: 'Category' },
    new: { bg: 'bg-secondary-container/10', text: 'text-secondary-container', defaultLabel: 'BARU' },
    custom: { bg: 'bg-gray-100', text: 'text-gray-800' }
  };

  const style = styles[variant];
  const displayLabel = label || style.defaultLabel || '';
  const displayIcon = icon !== undefined ? icon : style.defaultIcon;

  // Specific styling for certain variants to match existing designs
  if (variant === 'category') {
    return (
      <span className={`bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${className}`}>
        {displayLabel}
      </span>
    );
  }

  if (variant === 'new') {
    return (
      <span className={`text-[10px] font-bold ${style.text} ${style.bg} px-2 py-1 rounded uppercase tracking-wider ${className}`}>
        {displayLabel}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${style.text} text-xs font-bold ${className}`}>
      {displayIcon && <span className="material-symbols-outlined text-[14px]">{displayIcon}</span>}
      {displayLabel}
    </div>
  );
}
