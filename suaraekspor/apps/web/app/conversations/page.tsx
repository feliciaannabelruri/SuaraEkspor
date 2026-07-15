'use client';
// PATH: suaraekspor/apps/web/app/conversations/page.tsx
// Halaman daftar percakapan SELLER — semua chat dari buyer (wired to real API)

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';
import apiClient from '@/lib/api-client';
import { useMiddleman } from "../context/middleman-context";
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import MobileBottomNav from '../../components/layout/MobileBottomNav';

interface ConversationMessage {
  id: string;
  senderRole: 'buyer' | 'seller';
  originalText: string;
  translatedText?: string;
  aiGenerated: boolean;
  createdAt: string;
}

interface ConversationListItem {
  id: string;
  productId: string;
  sellerId: string;
  buyerId: string | null;
  buyerName: string;
  buyerLang: string;
  createdAt: string;
  updatedAt: string;
  product: { id: string; listings?: { title: string }[] } | null;
  seller: { id: string; name: string; businessName?: string } | null;
  buyer: { id: string; name: string } | null;
  messages: ConversationMessage[];
}

function relativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}h`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function ConversationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient.get('/conversations');
        if (!cancelled) setConversations(res.data?.data ?? []);
      } catch (err) {
        if (!cancelled) setError('Gagal memuat percakapan.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [router, isMiddleman, activeUMKM]);

  const withMessages = conversations.filter(c => c.messages?.length > 0).length;
  const aiReplied = conversations.filter(c => c.messages?.[0]?.aiGenerated).length;

  const filtered = conversations.filter(c => {
    if (!searchQuery) return true;
    const buyerName = c.buyer?.name || c.buyerName || '';
    const productTitle = c.product?.listings?.[0]?.title || '';
    const q = searchQuery.toLowerCase();
    return buyerName.toLowerCase().includes(q) || productTitle.toLowerCase().includes(q);
  });

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">

      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-background flex flex-col relative pb-24 md:pb-10">

        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">Pesan</h1>
            <p className="text-xs text-gray-500">Kotak Masuk</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/notifications')} className="relative p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-gray-500 text-[18px]">notifications</span>
            </button>
            <MobileProfileMenu />
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="px-4 md:px-8 max-w-[1440px] w-full mx-auto pt-4 md:pt-8 pb-20 md:pb-12">

          {/* Top App Bar (Header) */}
          <header className="flex justify-between items-start pb-4 text-gray-900 sticky top-0 z-30">
            <div className="flex-1">
              <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Pesan</div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Pesan dari Buyer</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">AI menangani terjemahan & balasan otomatis</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 mt-1">
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:border-primary transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed-dim/30 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">forum</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{conversations.length}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Total Percakapan</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:border-primary transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/10 flex items-center justify-center text-secondary-container">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{withMessages}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Ada Pesan</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:border-primary transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{aiReplied}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Dibalas AI</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-1">
            {/* Search */}
            <div className="relative w-full md:max-w-xs md:ml-auto">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 shadow-sm rounded-full py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Cari buyer atau produk..."
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="space-y-3">
            {loading && (
              <div className="py-10 bg-white rounded-xl border border-gray-200">
                <LoadingSpinner label="Memuat percakapan..." />
              </div>
            )}

            {!loading && error && (
              <div className="py-10 bg-white rounded-xl border border-gray-200">
                <ErrorState title="Gagal Memuat" message={error} />
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <EmptyState
                icon="forum"
                title="Belum ada percakapan"
                description={searchQuery ? 'Tidak ada percakapan yang cocok dengan pencarian Anda.' : 'Pesan dari buyer akan muncul di sini.'}
              />
            )}

            {!loading && !error && filtered.map(c => {
              const buyerName = c.buyer?.name || c.buyerName || 'Buyer';
              const productTitle = c.product?.listings?.[0]?.title || 'Produk';
              const lastMessage = c.messages?.[0];
              const lastMsgText = lastMessage
                ? (lastMessage.translatedText || lastMessage.originalText)
                : 'Belum ada pesan';
              const lastMsgTime = lastMessage?.createdAt || c.updatedAt;

              return (
                <div key={c.id}
                  onClick={() => router.push(`/conversations/${c.id}`)}
                  className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 cursor-pointer hover:border-primary hover:shadow-md transition-all shadow-sm group">

                  <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-5">
                    <div className="flex gap-3 flex-1">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-background border border-gray-100 flex items-center justify-center text-sm md:text-base font-bold text-primary flex-shrink-0 relative">
                        {buyerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[14px] md:text-[16px] text-gray-900 leading-tight group-hover:text-primary transition-colors">{buyerName}</h3>
                          <span className="md:hidden ml-auto text-[9px] text-gray-400 font-medium">{relativeTime(lastMsgTime)}</span>
                        </div>
                        <p className="text-secondary-container font-bold text-[10px] md:text-[11px] mb-1.5 truncate">{productTitle}</p>
                        <p className="text-gray-600 text-xs md:text-sm line-clamp-2 italic mb-3 leading-relaxed">"{lastMsgText}"</p>
                      </div>
                    </div>

                    {/* Desktop Right Column */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:min-w-[100px] pt-3 md:pt-0 border-t border-gray-100 md:border-none mt-2 md:mt-0">
                      <div className="hidden md:block mt-auto text-right">
                        <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase mb-0.5">TERAKHIR AKTIF</p>
                        <p className="text-gray-900 font-bold text-xs">{relativeTime(lastMsgTime)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM NAV (MOBILE ONLY) */}
        <MobileBottomNav unreadMessagesCount={withMessages} />
      </main>
    </div>
  );
}
