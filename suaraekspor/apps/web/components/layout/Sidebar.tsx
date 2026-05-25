'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMiddleman } from '../../app/context/middleman-context';

export default function Sidebar() {
  const pathname = usePathname();
  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();

  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/product');
  const isUpload = pathname === '/upload';
  const isPesan = pathname.startsWith('/conversations');
  const isPanduan = pathname === '/panduan';
  const isWhatsapp = pathname === '/whatsapp';

  return (
    <aside className="hidden md:flex w-56 bg-[#01261f] text-on-primary fixed h-screen flex-col py-6 px-4 z-40">
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
          {isMiddleman && activeUMKM ? activeUMKM.name.charAt(0) : 'PB'}
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-white text-sm leading-tight truncate">
            {isMiddleman && activeUMKM ? activeUMKM.name : 'Pak Budi'}
          </p>
          <p className="text-[11px] text-on-primary/70 font-label-caps truncate">
            {isMiddleman && activeUMKM ? activeUMKM.category : 'Batik Pekalongan'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isDashboard ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <span className={`material-symbols-outlined text-[20px] ${!isDashboard ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isDashboard ? "'FILL' 1" : "'FILL' 0" }}>inventory_2</span>
          <span className="text-sm">Dashboard</span>
        </Link>
        <Link href="/upload" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isUpload ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <span className={`material-symbols-outlined text-[20px] ${!isUpload ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isUpload ? "'FILL' 1" : "'FILL' 0" }}>upload_file</span>
          <span className="text-sm">Upload Produk</span>
        </Link>
        <Link href="/conversations" className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${isPesan ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-[20px] ${!isPesan ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isPesan ? "'FILL' 1" : "'FILL' 0" }}>forum</span>
            <span className="text-sm">Pesan</span>
          </div>
          <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
            3
          </span>
        </Link>
        <Link href="/panduan" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isPanduan ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <span className={`material-symbols-outlined text-[20px] ${!isPanduan ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isPanduan ? "'FILL' 1" : "'FILL' 0" }}>menu_book</span>
          <span className="text-sm">Panduan Ekspor</span>
        </Link>
        <Link href="/whatsapp" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isWhatsapp ? 'bg-secondary-container text-white font-semibold' : 'text-on-primary/70 hover:bg-white/10'}`}>
          <span className={`material-symbols-outlined text-[20px] ${!isWhatsapp ? 'group-hover:text-white' : ''}`} style={{ fontVariationSettings: isWhatsapp ? "'FILL' 1" : "'FILL' 0" }}>chat</span>
          <span className="text-sm">WhatsApp Integration</span>
        </Link>
      </nav>

      {/* Bottom CTA (Middleman Toggle) */}
      <div className="mt-auto">
        <button
          onClick={handleToggleMiddleman}
          className={`w-full border py-2.5 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${isMiddleman ? 'bg-secondary-container text-white border-secondary-container' : 'border-on-primary/30 text-on-primary hover:bg-white/5'
            }`}
        >
          <span className="material-symbols-outlined text-[18px]">support_agent</span>
          {isMiddleman ? 'Mode Middleman' : 'Coba Middleman'}
        </button>
      </div>
    </aside>
  );
}
