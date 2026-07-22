'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMiddleman } from '../../app/context/middleman-context';
import apiClient from '@/lib/api-client';
import { TRANSLATIONS } from '@/lib/translations';
import { useTranslation } from '@/hooks/useTranslation';

export default function Sidebar() {
  const pathname = usePathname();
  const { isMiddleman, activeUMKM } = useMiddleman();

  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/product');
  const isUpload = pathname === '/upload';
  const isTransaksi = pathname.startsWith('/transactions');
  const isPesan = pathname.startsWith('/conversations');
  const isPanduan = pathname === '/panduan';
  const isWhatsapp = pathname === '/whatsapp';
  const isProfile = pathname === '/profile';

  const [unreadCount, setUnreadCount] = useState(0);
  const [waPendingCount, setWaPendingCount] = useState(0);
  const [user, setUser] = useState<{ name?: string; businessName?: string; localLanguage?: string } | null>(null);

  const { t } = useTranslation(isMiddleman && activeUMKM ? 'id' : undefined);

  useEffect(() => {
    try {
      const u = localStorage.getItem('se_user');
      if (u) setUser(JSON.parse(u));
    } catch (_) {}

    apiClient.get('/conversations').then(res => {
      const list = res.data?.data || [];
      const withMessages = list.filter((c: any) => c.messages?.length > 0).length;
      setUnreadCount(withMessages);
    }).catch(() => {});

    apiClient.get('/whatsapp/messages').then(res => {
      const list = res.data?.data || [];
      setWaPendingCount(list.filter((m: any) => m.status === 'pending').length);
    }).catch(() => {});
  }, [pathname]);

  return (
    <aside className="hidden md:flex w-56 bg-primary text-on-primary fixed h-screen flex-col py-6 px-4 z-40">
      {/* Brand Logo */}
      <div className="mb-8">
        <Link href="/">
          <img
            src="/images/SuaraEksporLogo.png"
            alt="SuaraEkspor"
            className="w-44 h-auto brightness-0 invert object-contain -my-2 -ml-1 hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>

      {/* Seller Profile */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-on-primary/10">
        <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-container font-bold text-sm">
          {isMiddleman && activeUMKM 
            ? activeUMKM.name.charAt(0) 
            : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-white text-sm leading-tight truncate">
            {isMiddleman && activeUMKM ? activeUMKM.name : (user?.name || 'UMKM Baru')}
          </p>
          <p className="text-[11px] text-on-primary/70 font-label-caps truncate">
            {isMiddleman && activeUMKM 
              ? (activeUMKM.businessName || activeUMKM.province || 'Mode Middleman') 
              : (user?.businessName || 'Profil Belum Lengkap')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isDashboard ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <span className={`material-symbols-outlined text-[20px] ${!isDashboard ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isDashboard ? "'FILL' 1" : "'FILL' 0" }}>inventory_2</span>
          <span className="text-sm">{t('sbDashboard')}</span>
        </Link>
        <Link href="/upload" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isUpload ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <span className={`material-symbols-outlined text-[20px] ${!isUpload ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isUpload ? "'FILL' 1" : "'FILL' 0" }}>upload_file</span>
          <span className="text-sm">{t('sbUpload')}</span>
        </Link>
        <Link href="/transactions" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isTransaksi ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <span className={`material-symbols-outlined text-[20px] ${!isTransaksi ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isTransaksi ? "'FILL' 1" : "'FILL' 0" }}>receipt_long</span>
          <span className="text-sm">{t('sbTransactions')}</span>
        </Link>
        <Link href="/conversations" className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${isPesan ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-[20px] ${!isPesan ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isPesan ? "'FILL' 1" : "'FILL' 0" }}>forum</span>
            <span className="text-sm">{t('sbPesan')}</span>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link href="/panduan" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isPanduan ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <span className={`material-symbols-outlined text-[20px] ${!isPanduan ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isPanduan ? "'FILL' 1" : "'FILL' 0" }}>menu_book</span>
          <span className="text-sm">{t('sbPanduan')}</span>
        </Link>
        <Link href="/whatsapp" className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${isWhatsapp ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-[20px] ${!isWhatsapp ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isWhatsapp ? "'FILL' 1" : "'FILL' 0" }}>chat</span>
            <span className="text-sm">{t('sbWhatsapp')}</span>
          </div>
          {waPendingCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
              {waPendingCount}
            </span>
          )}
        </Link>
        <Link href="/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isProfile ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <span className={`material-symbols-outlined text-[20px] ${!isProfile ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isProfile ? "'FILL' 1" : "'FILL' 0" }}>person</span>
          <span className="text-sm">{t('sbProfile')}</span>
        </Link>
      </nav>

      {/* Bottom CTA (Kelola UMKM Lain + Logout) */}
      <div className="mt-auto space-y-2">
        <Link
          href="/kelola-umkm"
          className={`w-full border py-2.5 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${isMiddleman ? 'bg-secondary-container text-white border-secondary-container' : 'border-on-primary/30 text-on-primary hover:bg-white/5'
            }`}
        >
          <span className="material-symbols-outlined text-[18px]">support_agent</span>
          {isMiddleman ? t('sbMiddlemanMode') : t('sbMiddlemanTry')}
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('se_token');
            localStorage.removeItem('se_user');
            localStorage.removeItem('se_active_umkm');
            window.location.href = '/';
          }}
          className="w-full py-2.5 px-3 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white font-bold transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          {t('nvLogout')}
        </button>
      </div>
    </aside>
  );
}
