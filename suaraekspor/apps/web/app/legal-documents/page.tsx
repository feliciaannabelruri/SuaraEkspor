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
import LegalDocumentsPanel from '../../components/transactions/LegalDocumentsPanel';

interface Transaction {
  id: string;
  totalUsd: number;
  quantity: number;
  createdAt: string;
  seller?: { id: string; name?: string | null; businessName?: string | null } | null;
  buyer?: { id: string; name?: string | null } | null;
  product?: { id: string; listings?: { title: string }[] } | null;
}

export default function LegalDocumentsListPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
        const userStr = localStorage.getItem('se_user');
        const myId = userStr ? JSON.parse(userStr).id : null;

        const res = await apiClient.get('/transactions');
        if (cancelled) return;
        const all: Transaction[] = res.data?.data ?? [];
        // Dokumen legal adalah aksi penjual — hanya tampilkan transaksi di mana
        // user saat ini adalah penjualnya, bukan pembeli.
        setTransactions(all.filter((t) => t.seller?.id === myId));
      } catch {
        if (!cancelled) setError('Gagal memuat transaksi.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [router]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
      <Sidebar />
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-background flex flex-col relative pb-24 md:pb-10">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">Dokumen Legal</h1>
            <p className="text-xs text-gray-500">Invoice, packing list, & certificate of origin per transaksi</p>
          </div>
          <div className="flex items-center gap-4">
            <MobileProfileMenu />
          </div>
        </header>

        <div className="px-4 md:px-8 max-w-[1440px] w-full mx-auto pt-4 md:pt-8 pb-20 md:pb-12">
          <div className="mb-6">
            <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Dokumen Legal</div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Dokumen Legal Ekspor</h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium">Pilih transaksi untuk membuat dokumen ekspor dengan AI.</p>
          </div>

          {loading && (
            <div className="py-16"><LoadingSpinner label="Memuat transaksi..." /></div>
          )}

          {!loading && error && (
            <div className="py-16"><ErrorState title="Gagal Memuat" message={error} onRetry={() => window.location.reload()} /></div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <EmptyState
              icon="gavel"
              title="Belum Ada Transaksi"
              description="Dokumen legal bisa dibuat setelah ada transaksi penjualan."
              cta={{ label: 'Lihat Transaksi', href: '/transactions' }}
            />
          )}

          {!loading && !error && transactions.length > 0 && (
            <div className="space-y-4">
              {transactions.map((t) => {
                const title = t.product?.listings?.[0]?.title || 'Produk';
                const buyerName = t.buyer?.name || 'Buyer Anonim';
                const isOpen = expandedId === t.id;
                return (
                  <div key={t.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : t.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate">{title}</h3>
                        <p className="text-[11px] text-gray-500">Dibeli oleh {buyerName} • {formatDate(t.createdAt)} • ${t.totalUsd.toFixed(2)}</p>
                      </div>
                      <span className="material-symbols-outlined text-gray-400 text-[20px]">
                        {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-gray-100 px-4 py-4">
                        <LegalDocumentsPanel transactionId={t.id} />
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
