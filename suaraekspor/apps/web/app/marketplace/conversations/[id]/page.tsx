'use client';
// PATH: suaraekspor/apps/web/app/marketplace/conversations/[id]/page.tsx
// Halaman percakapan BUYER dengan seller — setelah mengirim pesan dari product page

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, CheckCheck } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Message {
  id: string;
  senderRole: 'buyer' | 'seller';
  originalText: string;
  translatedText?: string;
  originalLang: string;
  aiGenerated: boolean;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  productId: string;
  buyerLang: string;
  product: { id: string; listings?: { title: string }[] } | null;
  seller: { id: string; name: string; businessName?: string } | null;
  buyer: { id: string; name: string } | null;
  messages: Message[];
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function BuyerConversationPage() {
  const router = useRouter();
  const params = useParams();
  const routeId = (params?.id as string) || '';

  const [conversationId, setConversationId] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!routeId) return;

    let cancelled = false;
    async function init() {
      try {
        try {
          const res = await apiClient.get(`/conversations/${routeId}`);
          if (cancelled) return;
          setConversationId(routeId);
          setConversation(res.data?.data ?? null);
        } catch (err: any) {
          // routeId is not an existing conversation id — treat it as a productId
          const createRes = await apiClient.post('/conversations', {
            productId: routeId,
            buyerLang: 'en',
          });
          const newId = createRes.data?.data?.id;
          if (cancelled || !newId) return;
          setConversationId(newId);
          const detailRes = await apiClient.get(`/conversations/${newId}`);
          if (cancelled) return;
          setConversation(detailRes.data?.data ?? null);
          router.replace(`/marketplace/conversations/${newId}`);
        }
      } catch (err) {
        if (!cancelled) setError('Gagal memuat percakapan.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [routeId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  async function refetch() {
    if (!conversationId) return;
    const res = await apiClient.get(`/conversations/${conversationId}`);
    setConversation(res.data?.data ?? null);
  }

  async function handleSend() {
    if (!replyText.trim() || !conversationId || sending) return;
    setSending(true);
    const text = replyText;
    setReplyText('');
    try {
      await apiClient.post(`/conversations/${conversationId}/messages`, {
        message: text,
        buyerLanguage: conversation?.buyerLang || 'en',
      });
      await refetch();
    } catch (err) {
      setError('Gagal mengirim pesan.');
      setReplyText(text);
    } finally {
      setSending(false);
    }
  }

  const productTitle = conversation?.product?.listings?.[0]?.title || 'Produk';
  const sellerName = conversation?.seller?.businessName || conversation?.seller?.name || 'Seller';
  const messages = conversation?.messages ?? [];

  return (
    <div className="flex flex-col h-screen bg-background text-on-background font-body-md overflow-hidden">

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Header Bar */}
          <header className="h-20 bg-white flex items-center justify-between px-4 md:px-8 border-b border-outline-variant/20 z-10">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors mr-2">
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setShowProfile(!showProfile)}>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-200 shadow-sm">
                  {sellerName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h1 className="text-primary font-bold text-sm md:text-base flex items-center gap-1">
                    {sellerName}
                    <span className="material-symbols-outlined text-[16px] opacity-70">{showProfile ? 'expand_less' : 'expand_more'}</span>
                  </h1>
                  <p className="text-gray-500 text-[10px] font-medium leading-none mt-0.5">Produk: {productTitle}</p>
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

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-4 md:space-y-8">
            {loading && <p className="text-gray-400 text-sm text-center mt-10">Memuat percakapan...</p>}
            {!loading && error && <p className="text-red-500 text-sm text-center mt-10">{error}</p>}
            {!loading && !error && messages.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-10">Belum ada pesan. Mulai percakapan di bawah.</p>
            )}

            {!loading && messages.map(m => (
              <div key={m.id} className="w-full flex flex-col">
                {m.senderRole === 'buyer' ? (
                  /* Buyer messages (Sent) -> Right side */
                  <div className="flex flex-col items-end w-full">
                    <div className="max-w-[85%] md:max-w-[70%] flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-gray-400 text-[10px]">{formatTime(m.createdAt)}</span>
                        <span className="text-primary font-bold text-xs">You</span>
                      </div>
                      <div className="bg-primary text-white rounded-2xl rounded-tr-none p-4 text-[14px] leading-relaxed shadow-md">
                        {m.originalText}
                        <div className="flex items-center gap-1 mt-2 justify-end opacity-70">
                          <CheckCheck size={14} className="text-[#7EE8BC]" />
                          <span className="text-[9px] text-[#7EE8BC] font-medium capitalize">Terkirim</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Seller messages (Received) -> Left side */
                  <div className="flex flex-col items-start max-w-[85%] md:max-w-[70%]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-gray-700 font-bold text-xs">{sellerName} (Seller)</span>
                      <span className="text-gray-400 text-[10px]">{formatTime(m.createdAt)}</span>
                    </div>
                    <div className="bg-white border border-outline-variant/30 rounded-2xl rounded-tl-none p-4 text-gray-800 text-[14px] leading-relaxed shadow-sm">
                      {m.translatedText || m.originalText}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Area */}
          <footer className="bg-white px-4 md:px-8 py-4 md:py-6 border-t border-outline-variant/30">
            {/* Input Area */}
            <div className="flex items-end gap-3">
              <div className="flex-1 bg-[#f6f3f2] rounded-2xl border border-outline-variant/50 focus-within:border-secondary-container transition-colors px-3 md:px-4 py-2 md:py-3 flex flex-col">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="bg-transparent border-none focus:ring-0 text-on-background placeholder:text-gray-600/50 resize-none w-full text-body-md py-1 outline-none"
                  placeholder={sending ? 'Mengirim...' : 'Ketik pesan...'}
                  rows={1}
                  disabled={sending || !conversationId}
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/10">
                  <div className="flex items-center gap-4 text-gray-500">
                    <button className="hover:text-secondary-container transition-colors"><span className="material-symbols-outlined text-xl">attach_file</span></button>
                    <button className="hover:text-secondary-container transition-colors"><span className="material-symbols-outlined text-xl">image</span></button>
                  </div>
                  <span className="text-[10px] text-gray-400">SHIFT + ENTER for new line</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim() || sending || !conversationId}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-fixed-dim text-white shadow-lg hover:bg-[#43655c] active:scale-95 transition-all disabled:opacity-40"
                >
                  <span className="material-symbols-outlined">{sending ? 'hourglass_empty' : 'send'}</span>
                </button>
              </div>
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

        {/* Right Panel: Profil Penjual (Drawer) */}
        <div className={`absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-outline-variant/20 overflow-y-auto custom-scrollbar z-50 shadow-2xl transition-transform duration-300 ${showProfile ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Seller Profile</h3>
              <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-outline-variant/30 mb-3 bg-primary text-white flex items-center justify-center text-2xl font-bold">
                {sellerName.charAt(0).toUpperCase()}
              </div>
              <h4 className="font-bold text-lg leading-tight text-gray-900">{sellerName}</h4>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Product of Interest</p>
                <div className="border border-outline-variant/30 rounded-xl p-3 flex gap-3 items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{productTitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
