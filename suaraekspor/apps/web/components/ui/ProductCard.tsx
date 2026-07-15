import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string | null;
  exportReady?: boolean;
  langs?: string[];
  href?: string; // Optional custom href, defaults to /marketplace/[id]
  isFavorite?: boolean;
  onFavoriteToggle?: (e: React.MouseEvent) => void;
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500';

export default function ProductCard({ 
  id, 
  title, 
  location, 
  price, 
  image, 
  exportReady = false, 
  langs = [],
  href,
  isFavorite,
  onFavoriteToggle
}: ProductCardProps) {
  const linkHref = href || `/marketplace/${id}`;
  
  return (
    <Link href={linkHref} className="bg-white rounded-xl border border-gray-200 shadow-sm group overflow-hidden block h-full hover:border-secondary-container hover:shadow-md transition-all">
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img 
          src={image || FALLBACK_IMG} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold tracking-widest text-primary shadow-sm uppercase">
          {location}
        </div>
        {onFavoriteToggle && (
          <button
            onClick={onFavoriteToggle}
            className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:text-red-500 transition-colors z-10"
          >
            <span 
              className="material-symbols-outlined text-[18px] md:text-[20px]" 
              style={{ 
                fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0", 
                color: isFavorite ? '#ef4444' : 'inherit' 
              }}
            >
              favorite
            </span>
          </button>
        )}
      </div>
      
      <div className="p-4 flex flex-col justify-between h-[130px]">
        <div>
          <h4 className="text-primary font-bold mb-1 line-clamp-1" title={title}>{title}</h4>
          <div className="flex items-center gap-2 mb-2">
            {exportReady ? (
              <div className="text-primary text-[10px] font-bold tracking-widest flex items-center gap-1 uppercase bg-primary-fixed-dim/30 px-1.5 py-0.5 rounded">
                <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
                EXPORT READY
              </div>
            ) : (
              <div className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                DOMESTIC
              </div>
            )}
            {langs.length > 0 && (
              <div className="text-gray-400 text-[10px] font-bold uppercase truncate" title={langs.join(', ')}>
                • {langs.join(', ')}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-secondary-container font-bold text-lg">${price.toLocaleString('en-US')}</span>
          <div 
            className="text-primary p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" 
            aria-label="Tindakan"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
