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
import { TRANSLATIONS } from '@/lib/translations';
import { useTranslation } from '@/hooks/useTranslation';
import { useMiddleman } from '../../app/context/middleman-context';
import { Trash, CheckCircle, TrendingUp, Calendar, ShoppingBag } from 'lucide-react';
import LegalDocumentsPanel from '../../components/transactions/LegalDocumentsPanel';


const TXN_STEPS = ['order_placed', 'payment_simulated', 'escrow_held', 'released', 'completed'] as const;
const TXN_LABELS: Record<string, string> = {
  order_placed: 'Pesanan Dibuat',
  payment_simulated: 'Pembayaran Diterima (Simulasi)',
  escrow_held: 'Dana Ditahan Escrow',
  released: 'Dana Dilepas ke Penjual',
  completed: 'Transaksi Selesai',
  cancelled: 'Dibatalkan',
};

interface Transaction {
  id: string;
  status: string;
  totalUsd: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  buyer?: { id: string; name: string } | null;
  product?: { id: string; listings?: { title: string }[] } | null;
}

export default function TransactionsPage() {
  const router = useRouter();
  const { isMiddleman, activeUMKM } = useMiddleman();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [expandedLegalId, setExpandedLegalId] = useState<string | null>(null);

  // Filter & Delete States
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccessName, setDeleteSuccessName] = useState<string | null>(null);


  const { t } = useTranslation();

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
        const res = await apiClient.get('/transactions');
        if (!cancelled) setTransactions(res.data?.data ?? []);
      } catch (err) {
        if (!cancelled) setError('Gagal memuat transaksi.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [router, isMiddleman, activeUMKM]);

  async function handleAdvanceTransaction(txnId: string) {
    setAdvancingId(txnId);
    try {
      const { data } = await apiClient.patch(`/transactions/${txnId}/status`, {});
      setTransactions((prev) => prev.map((t) => (t.id === txnId ? { ...t, status: data.data.status } : t)));
    } catch {
      // biarkan status apa adanya jika gagal, tombol tetap bisa dicoba lagi
    } finally {
      setAdvancingId(null);
    }
  }

  async function handleDeleteTransaction(txnId: string) {
    setDeleteLoading(true);
    try {
      const target = transactions.find(t => t.id === txnId);
      const title = target?.product?.listings?.[0]?.title || 'Transaksi';
      await apiClient.delete(`/transactions/${txnId}`);
      setTransactions(prev => prev.filter(t => t.id !== txnId));
      setDeleteTargetId(null);
      setDeleteSuccessName(title);
      setTimeout(() => setDeleteSuccessName(null), 3000);
    } catch (err) {
      alert('Gagal menghapus transaksi.');
    } finally {
      setDeleteLoading(false);
    }
  }

  // Filter & Recap Calculations
  const filteredTransactions = transactions.filter(t => {
    if (timeFilter === 'all') return true;
    const tDate = new Date(t.createdAt);
    const now = new Date();
    
    if (timeFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return tDate >= oneWeekAgo;
    }
    if (timeFilter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return tDate >= oneMonthAgo;
    }
    if (timeFilter === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return tDate >= oneYearAgo;
    }
    return true;
  });

  const totalRevenue = filteredTransactions
    .filter(t => t.status !== 'cancelled')
    .reduce((acc, t) => acc + t.totalUsd, 0);

  const totalUnits = filteredTransactions
    .filter(t => t.status !== 'cancelled')
    .reduce((acc, t) => acc + t.quantity, 0);

  const transactionCount = filteredTransactions.length;

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">
      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* ── MODAL: Hapus Berhasil ── */}
      {deleteSuccessName && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <CheckCircle size={36} className="text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Transaksi Dihapus</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Catatan transaksi untuk <span className="font-semibold text-gray-700">&ldquo;{deleteSuccessName}&rdquo;</span> berhasil dihapus dari dashboard.
            </p>
            <button
              onClick={() => setDeleteSuccessName(null)}
              className="w-full bg-gray-800 text-white font-bold text-sm py-3 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Konfirmasi Hapus ── */}
      {deleteTargetId && (() => {
        const target = transactions.find(t => t.id === deleteTargetId);
        const title = target?.product?.listings?.[0]?.title || 'transaksi ini';
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Trash className="text-red-500" size={30} />
              </div>
              <h2 className="text-base font-bold text-gray-800 mb-1.5">Hapus Transaksi Dari Dashboard?</h2>
              <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                Catatan pembelian untuk produk <span className="font-semibold text-gray-700">&ldquo;{title}&rdquo;</span> akan dihapus dari dashboard Anda.
              </p>
              <p className="text-xs text-red-500 font-semibold mb-5">Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => handleDeleteTransaction(deleteTargetId)}
                  disabled={deleteLoading}
                  className="w-full bg-red-500 text-white font-bold text-sm py-3 rounded-xl hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? 'Menghapus...' : 'Ya, Hapus Transaksi'}
                </button>
                <button
                  onClick={() => setDeleteTargetId(null)}
                  disabled={deleteLoading}
                  className="w-full bg-gray-50 text-gray-700 font-semibold text-sm py-3 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all disabled:opacity-60"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        );
      })()}


      {/* MAIN CONTENT */}
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-background flex flex-col relative pb-24 md:pb-10">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">{t('sbTransactions')}</h1>
            <p className="text-xs text-gray-500">{t('txSubtitle')}</p>
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
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Transaksi</div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">{t('txTitle')}</h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">{t('txSubtitle')}</p>
            </div>
          </div>

          {/* Recap Statistics Cards */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-primary-container text-white p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <TrendingUp size={24} className="text-secondary-container" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-on-primary-container">{t('txOmset')} ({timeFilter === 'all' ? t('txFilterAll') : timeFilter === 'week' ? 'Mgu Ini' : timeFilter === 'month' ? 'Bln Ini' : 'Thn Ini'})</p>
                  <p className="text-2xl font-bold mt-0.5">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="p-3 bg-secondary-container/10 rounded-xl">
                  <ShoppingBag size={24} className="text-secondary-container" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{t('txVolume')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-0.5">{totalUnits} Unit</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Calendar size={24} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{t('txOrders')}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-0.5">{transactionCount} Pesanan</p>
                </div>
              </div>
            </div>
          )}

          {/* Time Filter Tabs */}
          {!loading && !error && (
            <div className="flex bg-[#F5E6DD] p-1 rounded-xl mb-6 border border-outline-variant/20 max-w-md">
              {(['all', 'week', 'month', 'year'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTimeFilter(filter)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    timeFilter === filter 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-primary/65 hover:text-primary hover:bg-white/40'
                  }`}
                >
                  {filter === 'all' ? t('txFilterAll') : filter === 'week' ? t('txFilterWeek') : filter === 'month' ? t('txFilterMonth') : t('txFilterYear')}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 bg-gray-50/50">
              <h2 className="font-bold text-primary text-lg">{t('sbTransactions')}</h2>
              <span className="bg-secondary-container/10 text-secondary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Simulasi</span>
            </div>

            <div className="p-4 md:p-6">
              {loading && (
                <div className="py-16">
                  <LoadingSpinner label={t('loading')} />
                </div>
              )}

              {!loading && error && (
                <div className="py-16">
                  <ErrorState title="Gagal Memuat" message={error} onRetry={() => window.location.reload()} />
                </div>
              )}

              {!loading && !error && filteredTransactions.length === 0 && (
                <div className="py-16">
                  <EmptyState 
                    icon="receipt_long" 
                    title={t('emptyTitle')} 
                    description={t('txNoTx')}
                  />
                </div>
              )}

              {!loading && !error && filteredTransactions.length > 0 && (
                <div className="space-y-4">
                  {filteredTransactions.map(t => {
                    const stepIdx = TXN_STEPS.indexOf(t.status as any);
                    const isCancelled = t.status === 'cancelled';
                    const isFinal = t.status === 'completed' || isCancelled;
                    const productName = t.product?.listings?.[0]?.title || 'Produk';
                    const buyerName = t.buyer?.name || 'Buyer Anonim';

                    return (
                      <div key={t.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                        <div className="p-4 md:p-5 bg-white">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">ID: {t.id.slice(-8).toUpperCase()}</span>
                                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">• {formatDate(t.createdAt)}</span>
                                </div>
                                <button
                                  onClick={() => setDeleteTargetId(t.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-red-100"
                                  title="Hapus Transaksi"
                                >
                                  <Trash size={15} />
                                </button>
                              </div>
                              <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1 leading-tight">{productName}</h3>
                              <p className="text-xs text-gray-500 mb-4">Dibeli oleh <span className="font-semibold text-gray-700">{buyerName}</span></p>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Jumlah</p>
                                  <p className="font-semibold text-gray-800">{t.quantity} unit</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                                  <p className="font-semibold text-secondary-container">${t.totalUsd.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>

                            <div className="md:w-[280px] flex flex-col justify-between pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-5">
                              <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Status Saat Ini</p>
                                {isCancelled ? (
                                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-100">
                                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                                    Dibatalkan
                                  </span>
                                ) : (
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                                    isFinal ? 'bg-green-50 text-green-700 border-green-200' : 'bg-primary/5 text-primary border-primary/20'
                                  }`}>
                                    <span className="material-symbols-outlined text-[16px]">{isFinal ? 'check_circle' : 'pending'}</span>
                                    {TXN_LABELS[t.status] || t.status}
                                  </span>
                                )}
                              </div>
                              
                              <div className="mt-6 md:mt-0 space-y-2">
                                {!isFinal && (
                                  <button
                                    onClick={() => handleAdvanceTransaction(t.id)}
                                    disabled={advancingId === t.id}
                                    className="w-full bg-primary text-white font-bold text-xs py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-sm"
                                  >
                                    {advancingId === t.id ? 'Memproses...' : `Lanjut ke: ${TXN_LABELS[TXN_STEPS[stepIdx + 1]] || '-'}`}
                                  </button>
                                )}
                                <button
                                  onClick={() => setExpandedLegalId(expandedLegalId === t.id ? null : t.id)}
                                  className="w-full border border-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-lg hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                                  {expandedLegalId === t.id ? 'Tutup Dokumen Legal' : 'Dokumen Legal'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {!isCancelled && (
                          <div className="bg-gray-50 px-4 md:px-5 py-3 border-t border-gray-100 flex items-center gap-1">
                            {TXN_STEPS.map((step, i) => (
                              <div key={step} className="flex-1 flex items-center gap-1">
                                <div className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? 'bg-primary' : 'bg-gray-300'}`} />
                              </div>
                            ))}
                          </div>
                        )}

                        {expandedLegalId === t.id && (
                          <div className="border-t border-gray-100 px-4 md:px-5 py-4 bg-white">
                            <LegalDocumentsPanel transactionId={t.id} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM NAV MOBILE */}
        <MobileBottomNav />
      </main>
    </div>
  );
}
