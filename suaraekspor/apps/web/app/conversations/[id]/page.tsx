'use client';
// PATH: suaraekspor/apps/web/app/conversations/[id]/page.tsx
// Chat detail seller — READ-ONLY inbox: AI menangani seluruh balasan & terjemahan

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Sparkles } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useMiddleman } from "../../context/middleman-context";

interface Message {
  id: string;
  conversationId: string;
  senderRole: 'buyer' | 'seller';
  originalText: string;
  originalLang: string;
  translatedText?: string;
  aiGenerated: boolean;
  summaryForSeller?: string;
  summaryAudioUrl?: string;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  productId: string;
  sellerId: string;
  buyerId: string | null;
  buyerName: string;
  buyerLang: string;
  product: { id: string; listings?: { title: string }[] } | null;
  seller: { id: string; name: string; businessName?: string } | null;
  buyer: { id: string; name: string } | null;
  messages: Message[];
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function ConversationDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!id) return;

    let cancelled = false;
    async function load() {
      try {
        const res = await apiClient.get(`/conversations/${id}`);
        if (!cancelled) setConversation(res.data?.data ?? null);
      } catch (err) {
        if (!cancelled) setError('Gagal memuat percakapan.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, router]);

  const buyerName = conversation?.buyer?.name || conversation?.buyerName || 'Buyer';
  const productTitle = conversation?.product?.listings?.[0]?.title || 'Produk';
  const messages = conversation?.messages ?? [];

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">

      {/* MAIN CONTENT */}
      <main className="w-full h-screen bg-background flex flex-col relative">

        {/* HEADER */}
        <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-outline-variant/20 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setShowProfile(!showProfile)}>
              <button onClick={(e) => { e.stopPropagation(); router.back() }} className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors mr-2">
                <ChevronLeft size={20} />
              </button>

              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-200 shadow-sm">
                {buyerName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-primary font-bold text-sm md:text-base flex items-center gap-1">
                  {buyerName}
                  <span className="material-symbols-outlined text-[16px] opacity-70">{showProfile ? 'expand_less' : 'expand_more'}</span>
                </h1>
                <p className="text-gray-500 text-[10px] font-medium leading-none mt-0.5">Produk: {productTitle}</p>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 ml-2 sm:ml-4">
              <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-sm border bg-[#7EE8BC] text-primary border-transparent">
                <Sparkles size={10} className="mr-0.5" />
                AI ON
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-white border border-[#6eae78]/30 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#6eae78] animate-pulse"></span>
                <p className="text-[#6eae78] text-[9px] font-bold tracking-widest uppercase">AI MENANGANI BALASAN & TERJEMAHAN</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-colors ${showProfile ? 'bg-gray-100 text-primary' : 'text-gray-600'}`}
            >
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </button>
          </div>
        </header>

        {/* CONTENT LAYOUT */}
        <div className="flex-1 flex overflow-hidden">

          {/* LEFT: CHAT AREA */}
          <div className="flex-1 flex flex-col min-w-0 bg-background">
            {/* MESSAGES */}
            <div className="flex-1 px-8 py-6 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
              {loading && <p className="text-gray-400 text-sm text-center mt-10">Memuat percakapan...</p>}
              {!loading && error && <p className="text-red-500 text-sm text-center mt-10">{error}</p>}
              {!loading && !error && messages.length === 0 && (
                <p className="text-gray-400 text-sm text-center mt-10">Belum ada pesan di percakapan ini.</p>
              )}

              {!loading && !error && messages.map(m => (
                <div key={m.id}>
                  {m.senderRole === 'buyer' ? (
                    /* Buyer Bubble (Received - Left) */
                    <div className="flex flex-col items-start max-w-[85%] md:max-w-[70%]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-gray-700 font-bold text-xs">{buyerName} (Buyer)</span>
                        <span className="text-gray-400 text-[10px] ml-1">{m.originalLang?.toUpperCase()}</span>
                        <span className="text-gray-400 text-[10px] ml-1.5">{formatTime(m.createdAt)}</span>
                      </div>
                      <div className="bg-white border border-outline-variant/30 rounded-2xl rounded-tl-none p-4 shadow-sm text-gray-800 text-[14px] leading-relaxed">
                        {m.originalText}
                      </div>
                      {m.translatedText && (
                        <p className="text-gray-500 text-[11px] italic mt-1.5 px-1">Terjemahan: {m.translatedText}</p>
                      )}
                    </div>
                  ) : (
                    /* AI/Seller Bubble (Sent - Right) */
                    <div className="flex flex-col items-end w-full">
                      <div className="max-w-[85%] md:max-w-[70%] flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-gray-400 text-[10px]">{formatTime(m.createdAt)}</span>
                          <span className="text-primary font-bold text-xs">AI Assistant</span>
                        </div>
                        <div className="bg-primary text-white rounded-2xl rounded-tr-none p-4 shadow-md w-full text-[14px] leading-relaxed relative">
                          {m.originalText}
                          <div className="flex items-center gap-1 mt-2 justify-end opacity-90">
                            <span className="text-[9px] text-[#7EE8BC] font-medium">✓ Terkirim</span>
                          </div>
                        </div>

                        {/* AI SUMMARY BOX */}
                        {m.summaryForSeller && (
                          <div className="mt-3 w-full bg-[#FFF9C4] border border-[#FBC02D]/30 rounded-xl p-4 flex items-center justify-between shadow-sm gap-3">
                            <div className="flex items-start gap-3">
                              <Sparkles size={16} className="text-secondary-container mt-0.5 flex-shrink-0" />
                              <p className="text-gray-800 text-[13px] leading-relaxed">
                                <span className="font-bold text-secondary-container">Ringkasan AI:</span> {m.summaryForSeller}
                              </p>
                            </div>
                            {m.summaryAudioUrl && (
                              <audio controls src={m.summaryAudioUrl} className="h-8 flex-shrink-0" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* READ-ONLY NOTICE (replaces fake send box) */}
            <footer className="bg-white px-4 md:px-8 py-5 md:py-6 border-t border-outline-variant/30">
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-2xl px-4 py-4">
                <Sparkles size={18} className="text-primary flex-shrink-0" />
                <p className="text-primary text-[12px] md:text-[13px] font-semibold leading-relaxed">
                  Balasan otomatis dikirim oleh AI — mode manual balas belum tersedia.
                </p>
              </div>
            </footer>
          </div>

          {/* Backdrop overlay */}
          {showProfile && (
            <div
              className="absolute inset-0 bg-black/20 z-40 transition-opacity"
              onClick={() => setShowProfile(false)}
            />
          )}

          {/* RIGHT PANEL: BUYER PROFILE (Drawer) */}
          <div className={`absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-outline-variant/20 flex-col overflow-y-auto shrink-0 z-50 shadow-2xl transition-transform duration-300 ${showProfile ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Profil Pembeli</h3>
                <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-md">
                  {buyerName.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{buyerName}</h2>
                <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[16px]">language</span> {conversation?.buyerLang?.toUpperCase() || '-'}
                </p>
              </div>

              <div className="mb-8">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Produk</h4>
                <div className="bg-white border border-outline-variant/30 rounded-xl p-3 flex gap-4 items-center shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate">{productTitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
