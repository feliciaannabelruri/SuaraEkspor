'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useMiddleman } from "../context/middleman-context";
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import apiClient from '@/lib/api-client';

interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  conversationId: string | null;
  audioUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Notification {
  id: string;
  buyerName: string;
  product: string;
  summary: string;
  time: string;
  read: boolean;
  conversationId: string | null;
  audioUrl: string | null;
}

function toViewModel(n: ApiNotification): Notification {
  return {
    id: n.id,
    buyerName: n.title,
    product: n.type === 'new_order' ? 'Pesanan Baru' : 'Pesan Baru',
    summary: n.message,
    time: new Date(n.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    read: n.isRead,
    conversationId: n.conversationId,
    audioUrl: n.audioUrl,
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMiddleman, handleToggleMiddleman, activeUMKM } = useMiddleman();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get('/notifications')
      .then((res) => {
        if (cancelled) return;
        const data: ApiNotification[] = res.data?.data ?? [];
        setNotifications(data.map(toViewModel));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function playAudio(id: string) {
    setPlayingId(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    apiClient.patch(`/notifications/${id}/read`).catch(() => {});

    const notif = notifications.find(n => n.id === id);
    if (notif?.audioUrl) {
      const audio = new Audio(notif.audioUrl);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => setPlayingId(null);
    } else {
      setTimeout(() => setPlayingId(null), 4000);
    }
  }

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    apiClient.patch(`/notifications/${id}/read`).catch(() => {});
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-background flex flex-col relative pb-24 md:pb-10">
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
          <div className="mb-6 p-4 bg-primary rounded-xl flex items-start gap-3 text-white shadow-sm">
            <span className="material-symbols-outlined bg-white/20 p-1.5 rounded-lg text-white text-[20px]">auto_awesome</span>
            <p className="text-sm leading-relaxed mt-0.5">
              AI merangkum setiap pesan buyer ke dalam bahasa Anda. Ketuk tombol suara untuk mendengar ringkasan.
            </p>
          </div>

          {/* NOTIFICATIONS LIST */}
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10">
              <LoadingSpinner label="Memuat notifikasi..." />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon="notifications_off"
              title="Belum ada notifikasi"
              description="Notifikasi akan muncul saat ada pesan atau pesanan baru dari buyer."
            />
          ) : (
          <div className="space-y-4">
            {notifications.map(notif => (
              <div key={notif.id} className={`bg-white rounded-xl ${!notif.read ? 'border-l-[6px] border-primary shadow-sm hover:shadow-md border-outline-variant/30' : 'border border-outline-variant/30 opacity-60 grayscale-[0.3]'} p-4 md:p-5 transition-all`}>
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                      {notif.buyerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary flex items-center gap-1.5">
                        {notif.buyerName}
                      </h3>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-0.5">{notif.product}</p>
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs">{notif.time}</span>
                </div>

                {/* AI Summary Box */}
                <div className={`${!notif.read ? 'bg-secondary-fixed/40 border-secondary-fixed' : 'bg-surface-container-low border-outline-variant'} p-4 rounded-lg mb-4 border`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-bold ${!notif.read ? 'text-on-secondary-fixed' : 'text-gray-600'} uppercase tracking-widest`}>RINGKASAN</span>

                    {notif.audioUrl && (
                      <button onClick={() => playAudio(notif.id)} disabled={notif.read && playingId !== notif.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-transform ${playingId === notif.id ? 'bg-primary text-white scale-105' : (!notif.read ? 'bg-primary text-white hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60')}`}>
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>volume_up</span>
                        Dengar
                      </button>
                    )}
                  </div>

                  {/* Audio wave visualization when playing */}
                  {playingId === notif.id && (
                    <div className="flex gap-1 items-end h-5 mb-2 px-1">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const heights = [3, 6, 4, 8, 5, 7, 3, 9, 6, 4, 8, 5, 7, 3, 6, 4, 8, 5, 3, 7, 4, 6, 8, 5, 9, 4, 6, 3, 5, 7];
                        return (
                          <div key={i} className="flex-1 bg-primary rounded-full animate-pulse"
                            style={{ height: `${heights[i] * 2}px`, animationDelay: `${i * 0.05}s` }} />
                        );
                      })}
                    </div>
                  )}

                  <p className={`text-sm italic leading-relaxed ${!notif.read ? 'text-[#331100]' : 'text-gray-600'}`}>
                    "{notif.summary}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {notif.conversationId && (
                    <button onClick={() => router.push(`/conversations/${notif.conversationId}`)} className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 text-sm ${!notif.read ? 'bg-primary text-white hover:brightness-110' : 'bg-transparent border border-[#717976] text-gray-600 hover:bg-gray-100'}`}>
                      Lihat {notif.read ? 'Riwayat' : 'Percakapan'}
                    </button>
                  )}
                  {!notif.read && (
                    <button onClick={() => markRead(notif.id)} className="bg-white border border-[#717976] text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-all text-sm">
                      Tandai Dibaca
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}

        </div>

        {/* BOTTOM NAV MOBILE */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-primary border-t border-primary-fixed-dim/10 flex z-50 pb-safe shadow-lg">
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
                  isActive ? 'text-secondary-container' : 'text-primary-fixed-dim opacity-80 hover:opacity-100'
                }`}
              >
                <span 
                  className="material-symbols-outlined text-[20px]" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label === 'Pesan' && (
                  <span className="absolute top-2.5 right-6 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
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