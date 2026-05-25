'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useMiddleman } from "../context/middleman-context";
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';

interface Notification {
  id: number;
  buyerName: string;
  buyerCountry: string;
  product: string;
  summary: string;
  summaryLang: string;
  time: string;
  read: boolean;
  conversationId: string;
  audioDuration: string;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    buyerName: 'John Smith',
    buyerCountry: 'USA 🇺🇸',
    product: 'Batik Tulis Pekalongan',
    summary: 'John soko Amerika mau pesan 5 lembar batik. Tawaro harga $200, kita counter $210. Saiki nunggu konfirmasi soko John.',
    summaryLang: 'Bahasa Jawa',
    time: 'Tadi, 10:45',
    read: false,
    conversationId: '1',
    audioDuration: '18 detik',
  },
  {
    id: 2,
    buyerName: 'Tanaka Hiroshi',
    buyerCountry: 'Japan 🇯🇵',
    product: 'Kopi Arabika Toraja',
    summary: 'Tanaka ti Jepang menta kopi 10 kg pikeun order grosir. Nanya ngeunaan sertifikat organik jeung kualitas ekspor. Perlu dikirim dokumen sertifikasi.',
    summaryLang: 'Bahasa Sunda',
    time: '1 jam lalu',
    read: false,
    conversationId: '2',
    audioDuration: '22 detik',
  },
  {
    id: 3,
    buyerName: 'Sarah Mueller',
    buyerCountry: 'Germany 🇩🇪',
    product: 'Batik Tulis Pekalongan',
    summary: 'Mbak Sarah sampun nampi kiriman batik soko sasi wingi. Dheweke matur nuwun amarga kualitase apik banget lan pengen pesen meneh sasi ngarep.',
    summaryLang: 'Bahasa Jawa',
    time: 'Kemarin, 14:20',
    read: true,
    conversationId: '3',
    audioDuration: '25 detik',
  },
  {
    id: 4,
    buyerName: 'Ahmed Al-Rashid',
    buyerCountry: 'UAE 🇦🇪',
    product: 'Kerajinan Rotan',
    summary: 'Ahmed dari Dubai mau order furniture rotan besar untuk hotel baru. Minta katalog lengkap dan harga grosir minimum 50 set. Peluang besar! Perlu follow up segera.',
    summaryLang: 'Bahasa Indonesia',
    time: 'Kemarin, 09:15',
    read: true,
    conversationId: '4',
    audioDuration: '30 detik',
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMiddleman, handleToggleMiddleman, activeUMKM } = useMiddleman();
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  function playAudio(id: number) {
    setPlayingId(id);
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    const notif = notifications.find(n => n.id === id);
    const durationMs = parseInt(notif?.audioDuration ?? '20') * 1000;
    setTimeout(() => setPlayingId(null), durationMs);
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-[#FDF0E8] text-[#1c1b1b] font-body-md overflow-x-hidden">
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-[#FDF0E8] flex flex-col relative pb-24 md:pb-10">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">Notifikasi</h1>
            <p className="text-xs text-gray-500">Ringkasan Suara</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Kembali
            </button>
            <button onClick={() => router.back()} className="md:hidden relative p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-gray-500 text-[18px]">arrow_back</span>
            </button>
            <MobileProfileMenu />
          </div>
        </header>

        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-20 md:pb-12 max-w-[1000px] mx-auto w-full flex-1 space-y-6">
          
          {/* HEADER SECTION */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
            <div>
              <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Notifikasi</div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">Notifikasi Suara</h1>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">{unreadCount} baru</span>
                )}
              </div>
              <p className="text-xs md:text-sm text-gray-500">Ringkasan pesan buyer dalam bahasa Anda</p>
            </div>
          </header>

          {/* INFO BANNER */}
          <div className="mb-6 p-4 bg-[#0F4A33] rounded-xl flex items-start gap-3 text-white shadow-sm">
            <span className="material-symbols-outlined bg-white/20 p-1.5 rounded-lg text-white text-[20px]">auto_awesome</span>
            <p className="text-sm leading-relaxed mt-0.5">
              AI merangkum setiap pesan buyer ke dalam bahasa Anda. Ketuk tombol suara untuk mendengar ringkasan.
            </p>
          </div>

          {/* NOTIFICATIONS LIST */}
          <div className="space-y-4">
            {notifications.map(notif => (
              <div key={notif.id} className={`bg-white rounded-xl ${!notif.read ? 'border-l-[6px] border-[#0F4A33] shadow-sm hover:shadow-md border-[#c1c8c4]/30' : 'border border-[#c1c8c4]/30 opacity-60 grayscale-[0.3]'} p-4 md:p-5 transition-all`}>
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#c5eadf] flex items-center justify-center text-[#01261f] font-bold text-lg flex-shrink-0">
                      {notif.buyerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0F4A33] flex items-center gap-1.5">
                        {notif.buyerName}
                        <span className="text-sm text-[#414846] font-normal">({notif.buyerCountry.replace(/[^A-Za-z\s]/g, '').trim()})</span>
                      </h3>
                      <p className="text-[10px] font-bold text-[#9c4400] uppercase tracking-widest mt-0.5">Produk: {notif.product}</p>
                    </div>
                  </div>
                  <span className="text-[#414846] text-xs">{notif.time}</span>
                </div>

                {/* AI Summary Box */}
                <div className={`${!notif.read ? 'bg-[#ffdbca]/40 border-[#ffdbca]' : 'bg-[#f6f3f2] border-[#c1c8c4]'} p-4 rounded-lg mb-4 border`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-bold ${!notif.read ? 'text-[#331100]' : 'text-[#414846]'} uppercase tracking-widest`}>RINGKASAN {notif.summaryLang.toUpperCase()}</span>
                    
                    <button onClick={() => playAudio(notif.id)} disabled={notif.read && playingId !== notif.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-transform ${playingId === notif.id ? 'bg-[#0F4A33] text-white scale-105' : (!notif.read ? 'bg-[#0F4A33] text-white hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60')}`}>
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>volume_up</span>
                      Dengar
                    </button>
                  </div>

                  {/* Audio wave visualization when playing */}
                  {playingId === notif.id && (
                    <div className="flex gap-1 items-end h-5 mb-2 px-1">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const heights = [3, 6, 4, 8, 5, 7, 3, 9, 6, 4, 8, 5, 7, 3, 6, 4, 8, 5, 3, 7, 4, 6, 8, 5, 9, 4, 6, 3, 5, 7];
                        return (
                          <div key={i} className="flex-1 bg-[#0F4A33] rounded-full animate-pulse"
                            style={{ height: `${heights[i] * 2}px`, animationDelay: `${i * 0.05}s` }} />
                        );
                      })}
                    </div>
                  )}

                  <p className={`text-sm italic leading-relaxed ${!notif.read ? 'text-[#331100]' : 'text-[#414846]'}`}>
                    "{notif.summary}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/conversations/${notif.conversationId}`)} className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 text-sm ${!notif.read ? 'bg-[#0F4A33] text-white hover:brightness-110' : 'bg-transparent border border-[#717976] text-[#414846] hover:bg-gray-100'}`}>
                    Lihat {notif.read ? 'Riwayat' : 'Percakapan'}
                  </button>
                  {!notif.read && (
                    <button onClick={() => {
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                      }} className="bg-white border border-[#717976] text-[#414846] px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-all text-sm">
                      Tandai Dibaca
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More Hint */}
          <div className="mt-12 flex justify-center">
            <button className="text-[#0F4A33] font-bold flex items-center gap-2 hover:underline">
              Lihat notifikasi terdahulu
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>

        </div>

        {/* BOTTOM NAV MOBILE */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#01261f] border-t border-[#83a69c]/10 flex z-50 pb-safe shadow-lg">
          {[
            { label: 'Produk', href: '/dashboard', icon: 'inventory_2' },
            { label: 'Upload', href: '/upload', icon: 'upload_file' },
            { label: 'Pesan', href: '/conversations', icon: 'forum' },
            { label: 'WhatsApp', href: '/whatsapp', icon: 'chat' },
            { label: 'Panduan', href: '/panduan', icon: 'menu_book' }
          ].map((item) => {
            const isActive = item.href === '/dashboard' 
              ? (pathname === '/dashboard' || (pathname && pathname.startsWith('/product')))
              : (pathname === item.href || (pathname && pathname.startsWith(item.href)));
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex-1 flex flex-col items-center py-2.5 transition-colors relative ${
                  isActive ? 'text-[#fe802f]' : 'text-[#83a69c] opacity-80 hover:opacity-100'
                }`}
              >
                <span 
                  className="material-symbols-outlined text-[20px]" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label === 'Pesan' && (
                  <span className="absolute top-2.5 right-6 w-2 h-2 bg-red-500 rounded-full border border-[#01261f]"></span>
                )}
                <span className={`text-[9px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}