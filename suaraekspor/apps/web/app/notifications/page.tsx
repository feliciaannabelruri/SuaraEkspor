'use client';
// PATH: suaraekspor/apps/web/app/notifications/page.tsx
// Halaman notifikasi suara untuk penjual — ringkasan pesan buyer dalam bahasa daerah

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Volume2, ChevronLeft, MessageCircle, Clock, CheckCircle2, BellRing } from 'lucide-react';

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
    time: '2 menit lalu',
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
    summary: 'Sarah dari Jerman mau pesan batik untuk koleksi fashion musim dingin. Dia tertarik motif mega mendung dan parang. AI sudah balas dengan info harga dan waktu pengiriman.',
    summaryLang: 'Bahasa Indonesia',
    time: '3 jam lalu',
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
    time: 'Kemarin',
    read: true,
    conversationId: '4',
    audioDuration: '30 detik',
  },
];

export default function NotificationsPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-[#F7F7F5] pb-24">
      {/* HEADER */}
      <div className="bg-[#0F4A33] px-5 py-5">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#7EE8BC] text-sm mb-3">
          <ChevronLeft size={16} /> Kembali
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-xl font-bold">Notifikasi Suara</h1>
            <p className="text-[#A8D5C2] text-xs mt-1">Ringkasan pesan buyer dalam bahasa Anda</p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {unreadCount} baru
            </div>
          )}
        </div>

        {/* Info banner */}
        <div className="mt-3 bg-white/10 rounded-xl p-3 flex items-start gap-2.5">
          <BellRing size={16} className="text-[#7EE8BC] flex-shrink-0 mt-0.5" />
          <p className="text-[#A8D5C2] text-xs leading-relaxed">
            AI merangkum setiap pesan buyer ke dalam bahasa Anda. Ketuk tombol suara untuk mendengar ringkasan.
          </p>
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-3">
        {notifications.map(notif => (
          <div key={notif.id}
            className={`bg-white rounded-xl border overflow-hidden transition-all ${
              !notif.read ? 'border-[#0F4A33]/30 shadow-sm' : 'border-gray-100'
            }`}>
            {/* Unread indicator */}
            {!notif.read && (
              <div className="h-1 bg-gradient-to-r from-[#0F4A33] to-[#7EE8BC]" />
            )}

            <div className="p-4">
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    !notif.read ? 'bg-[#0F4A33] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {notif.buyerName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{notif.buyerName}</p>
                    <p className="text-xs text-gray-400">{notif.buyerCountry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {notif.read && <CheckCircle2 size={14} className="text-green-500" />}
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock size={10} />
                    <span className="text-[10px]">{notif.time}</span>
                  </div>
                </div>
              </div>

              {/* Product tag */}
              <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1 mb-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-[10px] font-semibold text-green-800">{notif.product}</span>
              </div>

              {/* Summary card */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-600 text-xs">📋</span>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Ringkasan · {notif.summaryLang}
                    </p>
                  </div>

                  {/* Play audio button */}
                  <button
                    onClick={() => playAudio(notif.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[10px] font-bold ${
                      playingId === notif.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                    }`}>
                    <Volume2 size={11} className={playingId === notif.id ? 'animate-pulse' : ''} />
                    {playingId === notif.id ? `Memutar... (${notif.audioDuration})` : `▶ Dengar · ${notif.audioDuration}`}
                  </button>
                </div>

                {/* Audio wave visualization when playing */}
                {playingId === notif.id && (
                  <div className="flex gap-0.5 items-end h-5 mb-2">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const heights = [3, 6, 4, 8, 5, 7, 3, 9, 6, 4, 8, 5, 7, 3, 6, 4, 8, 5, 3, 7];
                      return (
                        <div key={i} className="flex-1 bg-amber-500 rounded-full animate-pulse"
                          style={{ height: `${heights[i] * 2}px`, animationDelay: `${i * 0.05}s` }} />
                      );
                    })}
                  </div>
                )}

                <p className="text-xs text-amber-800 leading-relaxed">{notif.summary}</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/conversations/${notif.conversationId}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0F4A33] text-white font-bold py-2.5 rounded-xl text-xs">
                  <MessageCircle size={14} /> Lihat Percakapan
                </button>
                {!notif.read && (
                  <button
                    onClick={() => setNotifications(prev =>
                      prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                    )}
                    className="px-3 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl text-xs">
                    Tandai Dibaca
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty state hint */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">Notifikasi baru muncul saat ada pesan dari buyer</p>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-white border-t border-gray-200 flex">
        <a href="/dashboard" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 7v-4m2 2h-4" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span className="text-xs mt-1">Produk</span>
        </a>
        <a href="/upload" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="1.5" /><line x1="12" y1="8" x2="12" y2="16" strokeWidth="1.5" strokeLinecap="round" /><line x1="8" y1="12" x2="16" y2="12" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span className="text-xs mt-1">Upload</span>
        </a>
        <a href="/conversations" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <MessageCircle size={20} />
          <span className="text-xs mt-1">Pesan</span>
        </a>
        <a href="/notifications" className="flex-1 flex flex-col items-center py-3 text-[#0F4A33] relative">
          <BellRing size={20} />
          {unreadCount > 0 && (
            <div className="absolute top-2 right-6 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">{unreadCount}</span>
            </div>
          )}
          <span className="text-xs mt-1">Notif</span>
        </a>
      </nav>
    </div>
  );
}