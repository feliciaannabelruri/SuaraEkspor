'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useMiddleman } from '../../app/context/middleman-context';

export default function MobileProfileMenu() {
  const { isMiddleman, activeUMKM } = useMiddleman();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initial = isMiddleman && activeUMKM 
    ? activeUMKM.name.charAt(0).toUpperCase() 
    : 'PB';
  const name = isMiddleman && activeUMKM ? activeUMKM.name : 'Pak Budi';
  const category = isMiddleman && activeUMKM
    ? (activeUMKM.businessName || activeUMKM.province || 'Mode Kelola Aktif')
    : 'Batik Pekalongan';

  const drawerContent = isOpen && (
    <div
      className="md:hidden fixed inset-0 bg-black/60 flex justify-end backdrop-blur-sm"
      style={{ zIndex: 9999 }}
      onClick={() => setIsOpen(false)}
    >
      {/* Drawer Panel */}
      <div
        className="bg-primary w-72 h-full p-6 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header with Logo & Close */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <img
              src="/images/SuaraEksporLogo.png"
              alt="SuaraEkspor"
              className="w-36 h-auto brightness-0 invert object-contain"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Profile Card */}
          <div className="flex items-center gap-3 mb-8 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#fe802f] text-white flex items-center justify-center font-extrabold text-sm shadow-inner">
              {initial}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-white text-sm leading-tight truncate">
                {name}
              </p>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mt-0.5 truncate">
                {category}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3 mt-auto pt-6">
          <Link
            href="/kelola-umkm"
            onClick={() => setIsOpen(false)}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
              isMiddleman
                ? 'bg-[#fe802f] text-white hover:bg-[#e06c20]'
                : 'bg-transparent border border-white/20 text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            {isMiddleman ? 'Mode Kelola Aktif' : 'Kelola UMKM Lain'}
          </Link>

          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-[#fe802f] text-white hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            Edit Profil Saya
          </Link>

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-all flex items-center justify-center gap-2 border border-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Ke Homepage
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem('se_token');
              localStorage.removeItem('se_user');
              localStorage.removeItem('se_active_umkm');
              window.location.href = '/';
            }}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Keluar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-xs shadow-sm border border-gray-100 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
      >
        {initial}
      </button>

      {/* Render drawer via portal to break out of top header sticky z-index context */}
      {mounted && typeof window !== 'undefined' && drawerContent
        ? createPortal(drawerContent, document.body)
        : null}
    </>
  );
}
