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
import { ShoppingBag, ChevronRight, CheckCircle, CreditCard, Shield, Clock, FileText, Trash } from 'lucide-react';


const TXN_STEPS = ['order_placed', 'payment_simulated', 'escrow_held', 'released', 'completed'] as const;

interface Transaction {
  id: string;
  status: string;
  totalUsd: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    photoUrls: string[];
    listings?: { title: string; description: string }[];
  } | null;
  seller?: {
    name: string;
    businessName: string;
  } | null;
}

export default function BuyerTransactionsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  function getTxnLabel(status: string): string {
    const map: Record<string, string> = {
      order_placed: t('btStatusOrderPlaced'),
      payment_simulated: t('btStatusPaymentSimulated'),
      escrow_held: t('btStatusEscrowHeld'),
      released: t('btStatusReleased'),
      completed: t('btStatusCompleted'),
      cancelled: t('btStatusCancelled'),
    };
    return map[status] || status;
  }

  function getStepDesc(step: string): string {
    const map: Record<string, string> = {
      order_placed: t('btStepOrderPlaced'),
      payment_simulated: t('btStepPaymentSimulated'),
      escrow_held: t('btStepEscrowHeld'),
      released: t('btStepReleased'),
      completed: t('btStepCompleted'),
    };
    return map[step] || '';
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccessName, setDeleteSuccessName] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    if (!token) {
      router.replace('/login?role=buyer');
      return;
    }

    let cancelled = false;
    async function loadTxns() {
      try {
        const res = await apiClient.get('/transactions');
        if (!cancelled) {
          const list = res.data?.data ?? [];
          setTransactions(list);
          if (list.length > 0) {
            setSelectedTxn(list[0]);
          }
        }
      } catch (err) {
        if (!cancelled) setError(t('btErrLoad'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadTxns();
    return () => { cancelled = true; };
  }, [router, t]);

  async function handleSimulatePayment(txnId: string) {
    setAdvancing(true);
    try {
      const res = await apiClient.patch(`/transactions/${txnId}/status`, {});
      const updated = res.data?.data;
      setTransactions(prev => prev.map(t => t.id === txnId ? { ...t, status: updated.status } : t));
      setSelectedTxn(updated);
      if (updated.status === 'payment_simulated') {
        setPaymentSuccess(true);
        setTimeout(() => setPaymentSuccess(false), 4000);
      }
    } catch (err) {
      alert(t('btErrPayment'));
    } finally {
      setAdvancing(false);
    }
  }
  async function handleDeleteTransaction(txnId: string) {
    setDeleteLoading(true);
    try {
      const target = transactions.find(t => t.id === txnId);
      const title = target?.product?.listings?.[0]?.title || 'Transaksi';
      await apiClient.delete(`/transactions/${txnId}`);
      setTransactions(prev => {
        const next = prev.filter(t => t.id !== txnId);
        if (selectedTxn?.id === txnId) {
          setSelectedTxn(next[0] || null);
        }
        return next;
      });
      setDeleteTargetId(null);
      setDeleteSuccessName(title);
      setTimeout(() => setDeleteSuccessName(null), 3000);
    } catch (err) {
      alert(t('btErrDelete'));
    } finally {
      setDeleteLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md">
      <Navbar />

      {/* Modal: Delete Success */}
      {deleteSuccessName && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <CheckCircle size={36} className="text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t('btDeleteSuccessTitle')}</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {t('btDeleteSuccessDesc')} <span className="font-semibold text-gray-700">&ldquo;{deleteSuccessName}&rdquo;</span> {t('btDeleteSuccessDesc') ? 'berhasil dibersihkan.' : ''}
            </p>
            <button
              onClick={() => setDeleteSuccessName(null)}
              className="w-full bg-gray-800 text-white font-bold text-sm py-3 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
            >
              {t('btDeleteSuccessClose')}
            </button>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus */}
      {deleteTargetId && (() => {
        const target = transactions.find(t => t.id === deleteTargetId);
        const title = target?.product?.listings?.[0]?.title || 'transaksi ini';
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Trash className="text-red-500" size={30} />
              </div>
              <h2 className="text-base font-bold text-gray-800 mb-1.5">{t('btDeleteModalTitle')}</h2>
              <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                {t('btDeleteModalDesc')} <span className="font-semibold text-gray-700">&ldquo;{title}&rdquo;</span>
              </p>
              <p className="text-xs text-red-500 font-semibold mb-5">{t('btDeleteModalWarn')}</p>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => handleDeleteTransaction(deleteTargetId)}
                  disabled={deleteLoading}
                  className="w-full bg-red-500 text-white font-bold text-sm py-3 rounded-xl hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? t('btDeleteModalDeleting') : t('btDeleteModalConfirm')}
                </button>
                <button
                  onClick={() => setDeleteTargetId(null)}
                  disabled={deleteLoading}
                  className="w-full bg-gray-50 text-gray-700 font-semibold text-sm py-3 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all disabled:opacity-60"
                >
                  {t('btDeleteModalCancel')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <main className="flex-1 max-w-[1280px] mx-auto px-4 md:px-16 py-8 md:py-12 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-container mb-1">{t('nvMyTransactions')}</h1>
            <p className="text-xs md:text-sm text-gray-500">{t('btSubtitle')}</p>
          </div>
          <Link
            href="/marketplace"
            className="text-xs font-bold text-secondary-container hover:underline flex items-center gap-1"
          >
            {t('btBackToMarket')}
          </Link>
        </div>

        {loading ? (
          <div className="py-24">
            <LoadingSpinner label="Memuat data transaksi..." />
          </div>
        ) : error ? (
          <div className="py-24">
            <ErrorState title="Oops!" message={error} onRetry={() => window.location.reload()} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-24 max-w-md mx-auto">
            <EmptyState
              icon="receipt_long"
              title={t('btEmptyTitle')}
              description={t('btEmptyDesc')}
              cta={{ label: t('btEmptyCta'), onClick: () => router.push('/marketplace') }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 items-start">
            
            {/* LEFT: Transactions List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
               {transactions.map(txn => {
                const title = txn.product?.listings?.[0]?.title || 'Produk';
                const seller = txn.seller?.businessName || txn.seller?.name || 'UMKM Indonesia';
                const active = selectedTxn?.id === txn.id;
                return (
                  <div
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      active
                        ? 'bg-white border-primary-container shadow-md ring-1 ring-primary-container'
                        : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] font-bold text-gray-400">ID: {txn.id.slice(-8).toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        txn.status === 'completed' ? 'bg-green-50 text-green-700' :
                        txn.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-secondary-container/10 text-secondary-container'
                      }`}>
                        {getTxnLabel(txn.status)}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1 mb-1">{title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{t('btSellerLabel')}: <span className="font-medium text-gray-700">{seller}</span></p>
                    <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                      <span className="text-xs text-gray-400">{formatDate(txn.createdAt)}</span>
                      <span className="font-bold text-primary-container text-sm">${txn.totalUsd.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Transaction Detail & Checkout Simulation */}
            {selectedTxn && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6 relative text-left">
                {/* Confetti Overlay for Successful Payment */}
                {paymentSuccess && (
                  <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center text-center p-8 animate-[fadeIn_0.3s_ease]">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 text-green-600">
                      <CheckCircle size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('btPaymentSuccess')}</h2>
                    <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                      {t('btPaymentSuccessDesc')} <span className="font-semibold text-gray-700">${selectedTxn.totalUsd.toFixed(2)}</span> {t('btPaymentEscrowNote')}
                    </p>
                    <p className="text-xs text-gray-400 mt-4">{t('btAutoClose')}</p>
                  </div>
                )}

                 {/* Section Header */}
                 <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                   <div>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('btDetailHeader')}</span>
                     <h2 className="font-bold text-lg text-primary mt-1">Invoice #{selectedTxn.id.toUpperCase()}</h2>
                   </div>
                   <div className="flex items-center gap-3">
                     <button
                       onClick={() => setDeleteTargetId(selectedTxn.id)}
                       className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center border border-transparent hover:border-red-100"
                       title={t('btDeleteBtn')}
                     >
                       <Trash size={16} />
                     </button>
                     <span className="text-xs text-gray-400">{formatDate(selectedTxn.createdAt)}</span>
                   </div>
                 </div>


                {/* Seller & Product Info */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-background p-4 rounded-xl border border-outline-variant/30">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    <img
                      src={selectedTxn.product?.photoUrls?.[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200'}
                      alt={t('btProductAlt')}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-base leading-snug">{selectedTxn.product?.listings?.[0]?.title || t('btDefaultTitle')}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{t('btSellerLabel')}: <span className="font-semibold text-primary">{selectedTxn.seller?.businessName || selectedTxn.seller?.name || t('btDefaultSeller')}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t('btTotalPrice')}</p>
                    <p className="font-bold text-primary-container text-lg">${selectedTxn.totalUsd.toFixed(2)}</p>
                  </div>
                </div>

                {/* Interactive Status Timeline */}
                <div>
                  <h3 className="font-bold text-primary-container text-sm mb-4 flex items-center gap-1.5">
                    <Clock size={16} /> {t('btEscrowFlow')}
                  </h3>
                  <div className="relative border-l border-gray-200 ml-3 pl-6 space-y-5 text-left">
                    {TXN_STEPS.map((step, idx) => {
                      const currentIdx = TXN_STEPS.indexOf(selectedTxn.status as any);
                      const isCompleted = idx <= currentIdx;
                      const isActive = idx === currentIdx;
                      return (
                        <div key={step} className="relative">
                          <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isCompleted ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300'
                          }`}>
                            {isCompleted && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </span>
                          <h4 className={`text-xs font-bold ${isActive ? 'text-secondary-container' : isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                            {getTxnLabel(step)}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{getStepDesc(step)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Payment Area */}
                {selectedTxn.status === 'order_placed' && (
                  <div className="bg-secondary-container/5 border border-secondary-container/20 rounded-xl p-5 space-y-4">
                    <div className="flex gap-2 items-start text-secondary-container">
                      <CreditCard size={20} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold">{t('btSimPaymentTitle')}</h4>
                        <p className="text-[11px] text-gray-600 mt-1">{t('btSimPaymentDesc')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSimulatePayment(selectedTxn.id)}
                        disabled={advancing}
                        className="py-3 px-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-white text-xs font-bold text-gray-700 bg-gray-50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        {t('btBankTransfer')}
                      </button>
                      <button
                        onClick={() => handleSimulatePayment(selectedTxn.id)}
                        disabled={advancing}
                        className="py-3 px-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-white text-xs font-bold text-gray-700 bg-gray-50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        {t('btCreditCard')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Intermediate Advance Buttons for Simulation */}
                {selectedTxn.status !== 'order_placed' && selectedTxn.status !== 'completed' && selectedTxn.status !== 'cancelled' && (
                  <div className="bg-primary-container/5 border border-primary-container/20 rounded-xl p-5 space-y-3">
                    <div className="flex gap-2 items-start text-primary">
                      <Shield size={20} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold">{t('btSimAdvanceTitle')}</h4>
                        <p className="text-[11px] text-gray-600 mt-1">{t('btSimAdvanceDesc')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSimulatePayment(selectedTxn.id)}
                      disabled={advancing}
                      className="w-full bg-primary-container text-white font-bold py-3 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {advancing ? t('btSimProcessing') : `${t('btSimAdvanceBtn')} ${getTxnLabel(TXN_STEPS[TXN_STEPS.indexOf(selectedTxn.status as any) + 1])}`}
                    </button>
                  </div>
                )}

                {/* Final State Details */}
                {selectedTxn.status === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center flex flex-col items-center">
                    <CheckCircle size={32} className="text-green-600 mb-2" />
                    <h4 className="text-sm font-bold text-green-800">{t('btCompletedTitle')}</h4>
                    <p className="text-[11px] text-green-700 mt-1 max-w-md leading-relaxed">
                      {t('btCompletedDesc')}
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
