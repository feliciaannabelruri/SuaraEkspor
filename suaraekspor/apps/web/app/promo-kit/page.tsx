'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';
import MobileBottomNav from '../../components/layout/MobileBottomNav';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import apiClient from '@/lib/api-client';
import PromoKitPanel from '../../components/products/PromoKitPanel';

interface Product {
  id: string;
  photoUrls: string[];
  status: string;
  listings?: { title: string }[];
}

export default function PromoKitListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        const res = await apiClient.get('/products');
        if (!cancelled) setProducts(res.data?.data ?? []);
      } catch {
        if (!cancelled) setError('Gagal memuat produk.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
      <Sidebar />
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-background flex flex-col relative pb-24 md:pb-10">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">Promo Kit</h1>
            <p className="text-xs text-gray-500">Caption & gambar promosi siap pakai untuk media sosial</p>
          </div>
          <div className="flex items-center gap-4">
            <MobileProfileMenu />
          </div>
        </header>

        <div className="px-4 md:px-8 max-w-[1440px] w-full mx-auto pt-4 md:pt-8 pb-20 md:pb-12">
          <div className="mb-6">
            <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Promo Kit</div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Promo Kit</h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium">Pilih produk untuk membuat caption dan gambar promosi dengan AI.</p>
          </div>

          {loading && (
            <div className="py-16"><LoadingSpinner label="Memuat produk..." /></div>
          )}

          {!loading && error && (
            <div className="py-16"><ErrorState title="Gagal Memuat" message={error} onRetry={() => window.location.reload()} /></div>
          )}

          {!loading && !error && products.length === 0 && (
            <EmptyState
              icon="campaign"
              title="Belum Ada Produk"
              description="Upload produk dulu untuk bisa membuat promo kit."
              cta={{ label: 'Upload Produk', href: '/upload' }}
            />
          )}

          {!loading && !error && products.length > 0 && (
            <div className="space-y-4">
              {products.map((p) => {
                const title = p.listings?.[0]?.title || 'Produk';
                const isOpen = expandedId === p.id;
                return (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : p.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      {p.photoUrls?.[0] ? (
                        <img src={p.photoUrls[0]} alt={title} className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate">{title}</h3>
                        <p className="text-[11px] text-gray-500">{p.status === 'active' ? 'Aktif' : p.status}</p>
                      </div>
                      <span className="material-symbols-outlined text-gray-400 text-[20px]">
                        {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-gray-100 px-4 py-4">
                        <PromoKitPanel productId={p.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <MobileBottomNav />
      </main>
    </div>
  );
}
