'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import apiClient from '@/lib/api-client';
import { useTranslation } from '@/hooks/useTranslation';
import { MessageSquare, ChevronRight, Clock, Store } from 'lucide-react';

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
  product: { 
    id: string; 
    photoUrls: string[]; 
    listings?: { title: string }[] 
  } | null;
  seller: { 
    id: string; 
    name: string; 
    businessName?: string 
  } | null;
  messages: ConversationMessage[];
}

function relativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}hari yang lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function BuyerConversationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    if (!token) {
      router.replace('/login?role=buyer');
      return;
    }

    let cancelled = false;
    async function loadChats() {
      try {
        const res = await apiClient.get('/conversations');
        if (!cancelled) {
          // Filter to only conversations that have at least one message
          const list = (res.data?.data ?? []).filter((c: any) => c.messages?.length > 0);
          setConversations(list);
        }
      } catch (err) {
        if (!cancelled) setError('Gagal memuat percakapan Anda.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadChats();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/10 text-secondary-container rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare size={12} />
            Negosiasi Ekspor
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
            {t('nvMyChats') || 'Pesan Saya'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Lakukan negosiasi secara langsung dengan produsen UMKM Indonesia. Pesan diterjemahkan secara otomatis seketika.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 flex items-center justify-center">
            <LoadingSpinner label="Memuat percakapan..." />
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon="forum"
            title="Belum ada chat aktif"
            description="Jelajahi marketplace kami dan klik 'Hubungi Penjual' pada produk untuk mulai bernegosiasi dengan produsen lokal Indonesia."
            cta={{ label: "Buka Marketplace", href: "/marketplace" }}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
            {conversations.map((chat) => {
              const latestMsg = chat.messages?.[0];
              const productPhoto = chat.product?.photoUrls?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100';
              const productTitle = chat.product?.listings?.[0]?.title || 'Informasi Produk';
              const sellerName = chat.seller?.businessName || chat.seller?.name || 'UMKM Indonesia';

              return (
                <Link
                  key={chat.id}
                  href={`/marketplace/conversations/${chat.id}`}
                  className="p-5 flex items-center justify-between hover:bg-gray-50/70 transition-colors group text-left"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                    {/* Product / Seller Image */}
                    <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                      <img
                        src={productPhoto}
                        alt={productTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Chat Text Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Store size={14} className="text-secondary-container" />
                        <h3 className="font-bold text-gray-800 text-sm truncate leading-tight">
                          {sellerName}
                        </h3>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[11px] text-gray-500 font-medium truncate max-w-[150px] sm:max-w-[250px]">
                          {productTitle}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate font-medium">
                        {latestMsg?.senderRole === 'buyer' ? 'Anda: ' : ''}
                        {latestMsg?.originalText || 'Memulai negosiasi.'}
                      </p>
                    </div>
                  </div>

                  {/* Date and Navigation Arrow */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                        <Clock size={10} />
                        {relativeTime(chat.updatedAt)}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
