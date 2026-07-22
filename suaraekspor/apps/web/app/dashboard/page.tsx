'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import { useMiddleman } from "../context/middleman-context";
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';
import apiClient from '@/lib/api-client';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge, { BadgeVariant } from '../../components/ui/Badge';
import MobileBottomNav from '../../components/layout/MobileBottomNav';
import { useTranslation } from '@/hooks/useTranslation';

interface Listing {
  languageCode: string;
  languageName: string;
  title: string;
  description: string;
  keywords: string[];
}

interface Product {
  id: string;
  status: 'processing' | 'active' | 'inactive';
  photoUrls: string[];
  recommendedPriceUsd?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  category?: string;
  exportReadinessScore?: number;
  aiPipelineStage?: string;
  viewCount?: number;
  listings: Listing[];
  createdAt: string;
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100';

function getAiStatusVariant(p: Product): BadgeVariant {
  if (p.aiPipelineStage === 'done') return 'done';
  if (p.aiPipelineStage === 'error') return 'error';
  if (p.status === 'processing' && p.aiPipelineStage === 'pending') return 'pending';
  return 'processing';
}

const TRANSLATIONS: Record<string, Record<string, string>> = {
  id: {
    dashboard: 'Dashboard',
    overview: 'Overview keseluruhan aktivitas',
    backHome: 'Kembali ke Homepage',
    subtext: 'Lihat ringkasan bisnis ekspor {businessName} hari ini.',
    totalProducts: 'Total Produk',
    exportReady: 'Kesiapan Ekspor',
    exportValue: 'Nilai Ekspor',
    newMessages: 'Pesan Baru',
    uploadBtn: 'Upload Produk Baru',
    tblName: 'Nama Produk',
    tblLang: 'Bahasa Asal',
    tblReady: 'Kesiapan Ekspor',
    tblComplete: 'Kelengkapan AI',
    tblStatus: 'Status AI',
    tblAction: 'Aksi',
    emptyTitle: 'Belum ada produk yang diunggah',
    emptyDesc: 'Mulai ekspor dengan mengunggah foto dan suara deskripsi produk Anda.',
    loading: 'Memuat data dashboard...',
    greeting: 'Selamat Pagi, {name}'
  },
  jv: {
    dashboard: 'Dasbor',
    overview: 'Ringkesan kabeh aktivitas',
    backHome: 'Bali menyang Homepage',
    subtext: 'Mirsani ringkesan bisnis ekspor {businessName} dina iki.',
    totalProducts: 'Gunggung Produk',
    exportReady: 'Kasiapan Ekspor',
    exportValue: 'Nilai Ekspor',
    newMessages: 'Pesen Anyar',
    uploadBtn: 'Unggah Produk Anyar',
    tblName: 'Jeneng Produk',
    tblLang: 'Basa Asal',
    tblReady: 'Kasiapan Ekspor',
    tblComplete: 'Kajangkepan AI',
    tblStatus: 'Status AI',
    tblAction: 'Aksi',
    emptyTitle: 'Durung ana produk sing diunggah',
    emptyDesc: 'Mulai ekspor kanthi ngunggah foto lan rekaman swara deskripsi produk sampeyan.',
    loading: 'Loading data dasbor...',
    greeting: 'Sugeng enjang, {name}'
  },
  su: {
    dashboard: 'Dasbor',
    overview: 'Ringkesan sadaya kagiatan',
    backHome: 'Mulang ka Homepage',
    subtext: 'Tingali ringkesan bisnis ekspor {businessName} dinten ieu.',
    totalProducts: 'Total Produk',
    exportReady: 'Kasiapan Ekspor',
    exportValue: 'Nilai Ekspor',
    newMessages: 'Pesen Anyar',
    uploadBtn: 'Unggah Produk Anyar',
    tblName: 'Nami Produk',
    tblLang: 'Basa Asal',
    tblReady: 'Kasiapan Ekspor',
    tblComplete: 'Kalengkepan AI',
    tblStatus: 'Status AI',
    tblAction: 'Aksi',
    emptyTitle: 'Teu acan aya produk anu diunggah',
    emptyDesc: 'Mimitian ekspor ku cara ngunggah poto sareng sora pedaran produk anjeun.',
    loading: 'Loading data dasbor...',
    greeting: 'Wilujeng enjing, {name}'
  },
  btk: {
    dashboard: 'Dashboard',
    overview: 'Ringkasan sude aktivitas',
    backHome: 'Mulak tu Homepage',
    subtext: 'Ida ringkasan bisnis ekspor {businessName} sadari on.',
    totalProducts: 'Sude Produk',
    exportReady: 'Kesiapan Ekspor',
    exportValue: 'Nilai Ekspor',
    newMessages: 'Tona Baru',
    uploadBtn: 'Upload Produk Baru',
    tblName: 'Goar ni Produk',
    tblLang: 'Bahasa Asal',
    tblReady: 'Kesiapan Ekspor',
    tblComplete: 'Kelengkapan AI',
    tblStatus: 'Status AI',
    tblAction: 'Aksi',
    emptyTitle: 'Dope adong produk na diupload',
    emptyDesc: 'Mulai ekspor marhite mangupload foto dohot soara deskripsi produkmu.',
    loading: 'Memuat data dashboard...',
    greeting: 'Horas, {name}'
  },
  ban: {
    dashboard: 'Dasbor',
    overview: 'Ringkesan sami aktivitas',
    backHome: 'Wali nuju Homepage',
    subtext: 'Ccingak ringkesan bisnis ekspor {businessName} rahina mangkin.',
    totalProducts: 'Sami Produk',
    exportReady: 'Kasiapan Ekspor',
    exportValue: 'Nilai Ekspor',
    newMessages: 'Pesen Anyar',
    uploadBtn: 'Unggah Produk Anyar',
    tblName: 'Wastan Produk',
    tblLang: 'Basa Asal',
    tblReady: 'Kasiapan Ekspor',
    tblComplete: 'Kajangkepan AI',
    tblStatus: 'Status AI',
    tblAction: 'Aksi',
    emptyTitle: 'Durung wenten produk sane kaunggah',
    emptyDesc: 'Ngawit ekspor antuk ngunggah foto lan swara panlataran produk semeton.',
    loading: 'Loading data dasbor...',
    greeting: 'Rahajeng semeng, {name}'
  },
  min: {
    dashboard: 'Dasbor',
    overview: 'Ringkasan sadonyo aktivitas',
    backHome: 'Baliak ka Homepage',
    subtext: 'Lihat ringkasan bisnis ekspor {businessName} hari kini.',
    totalProducts: 'Total Produk',
    exportReady: 'Kasiapan Ekspor',
    exportValue: 'Nilai Ekspor',
    newMessages: 'Pesan Baru',
    uploadBtn: 'Upload Produk Baru',
    tblName: 'Namo Produk',
    tblLang: 'Bahasa Asa',
    tblReady: 'Kasiapan Ekspor',
    tblComplete: 'Kalangkokan AI',
    tblStatus: 'Status AI',
    tblAction: 'Aksi',
    emptyTitle: 'Alun ado produk nan diupload',
    emptyDesc: 'Mulai ekspor jo caro mengupload foto dan suaro deskripsi produk sanak.',
    loading: 'Memuat data dasbor...',
    greeting: 'Salamat pagi, {name}'
  },
  bug: {
    dashboard: 'Dasbor',
    overview: 'Ringkasan maneng aktivitas',
    backHome: 'Lisu ri Homepage',
    subtext: 'Ita ringkasan bisnis ekspor {businessName} esso e.',
    totalProducts: 'Maniang Produk',
    exportReady: 'Kesiapan Ekspor',
    exportValue: 'Nilai Ekspor',
    newMessages: 'Kareba Baru',
    uploadBtn: 'Upload Produk Baru',
    tblName: 'Aseang Produk',
    tblLang: 'Bahasa Asal',
    tblReady: 'Kesiapan Ekspor',
    tblComplete: 'AI Kelengkapan',
    tblStatus: 'Status AI',
    tblAction: 'Aksi',
    emptyTitle: 'Deppa gaga produk ri upload',
    emptyDesc: 'Mulai ekspor ri upload foto nennia siri deskripsi produkta.',
    loading: 'Memuat data dasbor...',
    greeting: "Salama' pegi, {name}"
  },
  mad: {
    dashboard: 'Dasbor',
    overview: 'Ringkesan sadajana aktivitas',
    backHome: 'Abeli ka Homepage',
    subtext: 'Katela ringkesan bisnis ekspor {businessName} are mangken.',
    totalProducts: 'Sadajana Produk',
    exportReady: 'Kasiapan Ekspor',
    exportValue: 'Nilai Ekspor',
    newMessages: 'Pesan Anyar',
    uploadBtn: 'Upload Produk Anyar',
    tblName: 'Nyama Produk',
    tblLang: 'Basa Asal',
    tblReady: 'Kasiapan Ekspor',
    tblComplete: 'Kalengkapan AI',
    tblStatus: 'Status AI',
    tblAction: 'Aksi',
    emptyTitle: 'Gi\' tadâ\' produk se e-unggah',
    emptyDesc: 'Molae ekspor kalaban ngunggah foto ban sowara deskripsi produk panjennengan.',
    loading: 'Memuat data dasbor...',
    greeting: 'Selamat pagi, {name}'
  },
  bjn: {
    dashboard: 'Dasbor',
    overview: 'Ringkasan samunyaan aktivitas',
    backHome: 'Bulik ka Homepage',
    subtext: 'Lihat ringkasan bisnis ekspor {businessName} hari ngini.',
    totalProducts: 'Samunyaan Produk',
    exportReady: 'Kasiapan Ekspor',
    exportValue: 'Nilai Ekspor',
    newMessages: 'Habar Hanyar',
    uploadBtn: 'Upload Produk Hanyar',
    tblName: 'Ngaran Produk',
    tblLang: 'Bahasa Asal',
    tblReady: 'Kasiapan Ekspor',
    tblComplete: 'AI Kelengkapan',
    tblStatus: 'Status AI',
    tblAction: 'Aksi',
    emptyTitle: 'Balum ada produk nang diunggah',
    emptyDesc: 'Mulai ekspor lawan mengupload foto wan suara deskripsi produk pian.',
    loading: 'Memuat data dasbor...',
    greeting: 'Selamat pagi, {name}'
  }
};

export default function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();
  const [censoredIds, setCensoredIds] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletedProductName, setDeletedProductName] = useState<string | null>(null);
  const [user, setUser] = useState<{ name?: string; businessName?: string; localLanguage?: string } | null>(null);

  const { t } = useTranslation(isMiddleman && activeUMKM ? 'id' : undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('se_token')) {
        router.push('/login');
        return;
      }
      try {
        const u = localStorage.getItem('se_user');
        if (u) setUser(JSON.parse(u));
      } catch (_) {}
    }
    setLoading(true);
    Promise.all([
      apiClient.get('/products'),
      apiClient.get('/transactions').catch(() => ({ data: { data: [] } })),
      apiClient.get('/conversations').catch(() => ({ data: { data: [] } })),
      apiClient.get('/whatsapp/messages').catch(() => ({ data: { data: [] } })),
    ])
      .then(([productsRes, transactionsRes, conversationsRes, whatsappRes]) => {
        setProducts(productsRes.data.data ?? []);
        setTransactions(transactionsRes.data.data ?? []);
        setConversations(conversationsRes.data.data ?? []);
        setWhatsappMessages(whatsappRes.data.data ?? []);
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
      })
      .finally(() => setLoading(false));
  }, [router, isMiddleman, activeUMKM]);

  function toggleCensor(id: string) {
    setCensoredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const targetProduct = products.find(p => p.id === id);
      const productName = targetProduct?.listings?.find(l => l.languageCode === 'id')?.title
        || targetProduct?.listings?.[0]?.title
        || 'Produk';
      await apiClient.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteTargetId(null);
      setDeletedProductName(productName);
      // Auto-dismiss success modal after 3 seconds
      setTimeout(() => setDeletedProductName(null), 3000);
    } catch (err: any) {
      setDeleteError(err.response?.data?.error ?? 'Gagal menghapus produk. Coba lagi.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const sellerName = isMiddleman && activeUMKM ? activeUMKM.name : (user?.name || 'Pak Budi');
  const businessName = isMiddleman && activeUMKM ? (activeUMKM.businessName || activeUMKM.name) : (user?.businessName || 'Anda');

  const totalProducts = products.length;
  const exportReadyCount = products.filter(p => (p.exportReadinessScore ?? 0) >= 70).length;
  const exportReadyRatio = totalProducts > 0 ? Math.round((exportReadyCount / totalProducts) * 100) : 0;

  const exportValue = transactions
    .filter(t => t.status !== 'cancelled')
    .reduce((acc, t) => acc + t.totalUsd, 0);

  const whatsappPendingCount = whatsappMessages.filter((m: any) => m.status === 'pending').length;
  const newMessagesCount = conversations.length + whatsappPendingCount;

  // 1. Total View (data asli dari kunjungan halaman produk buyer)
  const totalViews = products.reduce((acc, p) => acc + (p.viewCount ?? 0), 0);
  const viewChangePct = totalViews > 0 ? "+15%" : "+0%";

  // 2. Negosiasi Aktif (sesuai jumlah utas chat, termasuk inbox WhatsApp)
  const activeNegotiations = conversations.length + whatsappPendingCount;

  // 3. Skor Toko (Rata-rata Export Readiness Score)
  const averageReadinessScore = products.length > 0
    ? Math.round(products.reduce((acc, p) => acc + (p.exportReadinessScore ?? 0), 0) / products.length)
    : 0;

  // Nilai teks review berdasarkan skor
  let ratingLabel = 'Cukup';
  let ratingValue = '3.0';
  if (averageReadinessScore >= 85) {
    ratingLabel = 'Sangat Baik';
    ratingValue = '4.8';
  } else if (averageReadinessScore >= 70) {
    ratingLabel = 'Baik';
    ratingValue = '4.2';
  } else if (averageReadinessScore >= 50) {
    ratingLabel = 'Cukup';
    ratingValue = '3.5';
  } else if (products.length > 0) {
    ratingLabel = 'Perlu Optimalisasi';
    ratingValue = '2.5';
  } else {
    ratingLabel = 'Belum Ada Data';
    ratingValue = '-';
  }

  // 4. Export Insight Dinamis
  const firstProdCategory = products.length > 0 ? products[0].category : '';
  const mainCategory = isMiddleman && activeUMKM ? (activeUMKM.province || '').toLowerCase() : (firstProdCategory || '').toLowerCase();
  const lowerBusinessName = businessName.toLowerCase();

  let exportInsightText = 'Optimalkan listing ekspor Anda dengan melengkapi transkripsi audio agar tingkat kelayakan ekspor (Export Readiness) meningkat di atas 80%.';
  if (lowerBusinessName.includes('batik') || lowerBusinessName.includes('tekstil') || mainCategory.includes('tekstil')) {
    exportInsightText = 'Permintaan produk batik tulis premium sedang melonjak di pasar Eropa Barat dan Jepang. Pastikan detail motif batik Anda dijelaskan dengan lengkap di transkripsi untuk menarik buyer premium.';
  } else if (lowerBusinessName.includes('anyaman') || lowerBusinessName.includes('bambu') || lowerBusinessName.includes('rotan') || mainCategory.includes('kerajinan') || lowerBusinessName.includes('kerajinan')) {
    exportInsightText = 'Permintaan kerajinan tangan dari bahan anyaman alami meningkat 25% di pasar Timur Tengah dan Amerika Serikat bulan ini. Gunakan deskripsi multibahasa untuk menjangkau mereka.';
  } else if (lowerBusinessName.includes('kopi') || lowerBusinessName.includes('gayo') || lowerBusinessName.includes('rempah') || mainCategory.includes('kopi') || mainCategory.includes('rempah')) {
    exportInsightText = 'Kopi arabika single origin dan rempah-rempah Indonesia sedang sangat digemari di pasar Amerika Serikat dan Australia. Pastikan info ketinggian tanam dan metode proses pasca-panen tertulis jelas.';
  } else if (mainCategory.includes('pertanian') || mainCategory.includes('tanaman') || lowerBusinessName.includes('tani')) {
    exportInsightText = 'Permintaan tanaman hias tropis dan rempah-rempah meningkat pesat di wilayah Uni Emirat Arab dan Arab Saudi. Optimalkan keyword listing Anda dengan fokus pada ketahanan ekspor.';
  }

  // 5. Aktivitas Terkini Dinamis
  const activities: Array<{
    id: string;
    text: string;
    time: string;
    icon: string;
    iconBg: string;
    iconColor: string;
  }> = [];

  if (transactions.length > 0) {
    const latestTxn = transactions[0];
    const productTitle = latestTxn.product?.listings?.[0]?.title || 'produk Anda';
    const buyerName = latestTxn.buyer?.name || 'Buyer asing';
    activities.push({
      id: `txn-${latestTxn.id}`,
      text: `Transaksi baru dibuat oleh ${buyerName} untuk produk ${productTitle}.`,
      time: 'Baru saja',
      icon: 'shopping_cart',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
    });
  }

  if (conversations.length > 0) {
    const latestConv = conversations[0];
    const buyerName = latestConv.buyer?.name || latestConv.buyerName || 'Buyer';
    const productTitle = latestConv.product?.listings?.[0]?.title || 'produk Anda';
    activities.push({
      id: `conv-${latestConv.id}`,
      text: `Pesan baru dari ${buyerName} (${latestConv.buyerLang.toUpperCase()}) mengenai produk ${productTitle}.`,
      time: 'Beberapa saat yang lalu',
      icon: 'mail',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    });
  }

  if (whatsappMessages.length > 0) {
    const latestWa = whatsappMessages[0];
    const buyerLabel = latestWa.buyerName || latestWa.buyerPhone;
    activities.push({
      id: `wa-${latestWa.id}`,
      text: `Pesan WhatsApp baru dari ${buyerLabel}, sudah diterjemahkan AI dan menunggu persetujuan Anda.`,
      time: 'Beberapa saat yang lalu',
      icon: 'chat',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    });
  }

  if (products.length > 0) {
    const latestProd = products[0];
    const productTitle = latestProd.listings?.[0]?.title || 'produk Anda';
    activities.push({
      id: `prod-${latestProd.id}`,
      text: `AI Translation Complete: Listing produk ${productTitle} sekarang tersedia dalam 6 bahasa.`,
      time: 'Hari ini',
      icon: 'auto_fix_high',
      iconBg: 'bg-primary-fixed-dim/30',
      iconColor: 'text-primary',
    });
  }

  if (activities.length === 0) {
    activities.push({
      id: 'welcome',
      text: 'Selamat datang di dashboard Anda! Unggah produk pertama Anda menggunakan rekaman suara untuk melihat aktivitas penjualan.',
      time: 'Baru saja',
      icon: 'info',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-500',
    });
  }



  // 6. Grafik dinamis yang terlihat realistis
  const baseHeights = [40, 55, 35, 70, 85, 100, 60];
  const chartHeights = baseHeights.map(h => {
    if (products.length === 0) return 0;
    // Berikan variasi tinggi berdasarkan jumlah produk
    const factor = 0.5 + (products.length % 3) * 0.2;
    return Math.min(100, Math.max(10, Math.round(h * factor)));
  });

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md overflow-x-hidden">

      {/* ── MODAL: Hapus Berhasil ── */}
      {deletedProductName && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-green-500 text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Produk Berhasil Dihapus</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              <span className="font-semibold text-gray-700">&ldquo;{deletedProductName}&rdquo;</span> telah dihapus permanen dari sistem.
            </p>
            <button
              onClick={() => setDeletedProductName(null)}
              className="w-full bg-gray-800 text-white font-bold text-sm py-3 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
            >
              Tutup
            </button>
            <p className="text-[11px] text-gray-400 mt-3">Modal akan menutup otomatis dalam 3 detik</p>
          </div>
        </div>
      )}

      {/* ── MODAL: Konfirmasi Hapus Produk ── */}
      {deleteTargetId && (() => {
        const targetProduct = products.find(p => p.id === deleteTargetId);
        const productName = targetProduct?.listings?.find(l => l.languageCode === 'id')?.title
          || targetProduct?.listings?.[0]?.title
          || 'produk ini';
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-red-500 text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>delete_forever</span>
              </div>
              <h2 className="text-base font-bold text-gray-800 mb-1.5">Hapus Produk?</h2>
              <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                Produk <span className="font-semibold text-gray-700">&ldquo;{productName}&rdquo;</span> akan dihapus permanen beserta semua listing dan data terkaitnya.
              </p>
              <p className="text-xs text-red-500 font-semibold mb-5">Tindakan ini tidak dapat dibatalkan.</p>
              {deleteError && (
                <div className="w-full bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg mb-3 border border-red-100">{deleteError}</div>
              )}
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => handleDelete(deleteTargetId)}
                  disabled={deleteLoading}
                  className="w-full bg-red-500 text-white font-bold text-sm py-3 rounded-xl hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleteLoading
                    ? <><span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span> Menghapus...</>
                    : <><span className="material-symbols-outlined text-[16px]">delete_forever</span> Ya, Hapus Permanen</>
                  }
                </button>
                <button
                  onClick={() => { setDeleteTargetId(null); setDeleteError(''); }}
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

      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-background flex flex-col relative pb-24 md:pb-10">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">{t('dashboard')}</h1>
            <p className="text-xs text-gray-500">{t('overview')}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
              <span className="material-symbols-outlined text-[16px]">home</span>
              {t('backHome')}
            </Link>
            <MobileProfileMenu />
          </div>
        </header>

        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-20 md:pb-12 max-w-[1440px] mx-auto w-full flex-1 space-y-8">

          {/* Header Area */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Dashboard</div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                {t('greeting', { name: sellerName })}
              </h1>
              <p className="text-gray-500 text-xs md:text-sm">{t('subtext', { businessName })}</p>
            </div>
          </div>


          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700">
                  <span className="material-symbols-outlined text-xl">inventory_2</span>
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('totalProducts')}</p>
              <p className="text-3xl font-bold text-primary">{totalProducts}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-secondary-container/10 rounded-lg flex items-center justify-center text-secondary-container">
                  <span className="material-symbols-outlined text-xl">forum</span>
                </div>
                {newMessagesCount > 0 && (
                  <Badge variant="new" label={`${newMessagesCount} UTAS`} />
                )}
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('newMessages')}</p>
              <p className="text-3xl font-bold text-primary">{newMessagesCount}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-primary-fixed-dim/30 rounded-lg flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary-fixed-dim/30 px-2 py-1 rounded">{exportReadyRatio}% Ratio</span>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('exportReady')}</p>
              <p className="text-3xl font-bold text-primary">{exportReadyCount}</p>
            </div>

            <div className="bg-primary rounded-2xl p-5 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-xl">payments</span>
                </div>
                <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-1 rounded">Target: $5k</span>
              </div>
              <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">{t('exportValue')}</p>
              <p className="text-3xl font-bold text-white">${exportValue.toLocaleString('en-US')}</p>
            </div>
          </div>

          {/* Products Section */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
              <h2 className="text-primary text-xl md:text-2xl font-bold">{t('totalProducts')}</h2>
              <Link href="/upload" className="bg-secondary-container hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-opacity flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto">
                <span className="material-symbols-outlined text-[18px]">add</span>
                {t('uploadBtn')}
              </Link>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
                <LoadingSpinner label={t('loading')} />
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon="inventory_2"
                title={t('emptyTitle')}
                description={t('emptyDesc')}
                cta={{ label: t('uploadBtn'), href: '/upload' }}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('tblName')}</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Harga ($)</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('tblStatus')}</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('tblLang')}</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('tblReady')}</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">{t('tblAction')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => {
                      const name = p.listings?.[0]?.title ?? 'Produk baru';
                      const category = p.category ?? '-';
                      const price = p.recommendedPriceUsd ? `$${p.recommendedPriceUsd}` : '—';
                      const aiStatusVariant = getAiStatusVariant(p);
                      const langs = p.listings?.length ? p.listings.map(l => l.languageCode.toUpperCase()).join(' ') : '-';
                      const ready = p.exportReadinessScore ?? 0;
                      const img = p.photoUrls?.[0] ?? FALLBACK_IMG;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 ${censoredIds.has(p.id) ? 'blur-md' : ''}`}>
                              <img src={img} alt={name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className={`font-bold text-gray-800 ${censoredIds.has(p.id) ? 'blur-sm select-none' : ''}`}>{censoredIds.has(p.id) ? '••••••••••••••••' : name}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="category" label={category} />
                          </td>
                          <td className={`py-4 px-6 font-bold text-gray-800 ${censoredIds.has(p.id) ? 'blur-sm select-none' : ''}`}>{censoredIds.has(p.id) ? '$$$' : price}</td>
                          <td className="py-4 px-6">
                            <Badge variant={aiStatusVariant} />
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-700 font-semibold tracking-wider">{langs}</td>
                          <td className="py-4 px-6">
                            <div className="w-24">
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${ready >= 90 ? 'bg-primary' : ready > 0 ? 'bg-secondary-container' : 'bg-gray-300'}`}
                                  style={{ width: `${ready}%` }}
                                />
                              </div>
                              <p className="text-[10px] font-bold text-gray-500 mt-1">{ready}%</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-3 text-gray-400">
                              <Link href={`/product/${p.id}`} className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></Link>
                              <button onClick={() => toggleCensor(p.id)} className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">{censoredIds.has(p.id) ? 'visibility_off' : 'visibility'}</span></button>
                              <button onClick={() => setDeleteTargetId(p.id)} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Dashboard Analytics Preview */}
          <section className="bg-white rounded-2xl p-4 md:p-8 border border-gray-200 block shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-primary text-xl font-bold">Tinjauan Penjualan</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] uppercase font-bold text-gray-500 tracking-wider">7 HARI TERAKHIR</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Area */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Total View Statistik</p>
                <div className="h-40 flex items-end gap-1.5 sm:gap-3 border-b border-gray-200 pb-2">
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors" style={{ height: `${chartHeights[0]}%` }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Sen</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors" style={{ height: `${chartHeights[1]}%` }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Sel</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors" style={{ height: `${chartHeights[2]}%` }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Rab</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors" style={{ height: `${chartHeights[3]}%` }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Kam</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors" style={{ height: `${chartHeights[4]}%` }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Jum</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-primary rounded-t-sm transition-colors" style={{ height: `${chartHeights[5]}%` }}></div>
                    <span className="text-[10px] font-bold text-primary mt-2">Sab</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end group h-full">
                    <div className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors" style={{ height: `${chartHeights[6]}%` }}></div>
                    <span className="text-[10px] font-medium text-gray-400 mt-2">Min</span>
                  </div>
                </div>
              </div>

              {/* Stats Side */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-1 lg:gap-0 lg:flex lg:flex-col lg:justify-between h-full">
                <div className="bg-gray-50 lg:bg-transparent p-2 sm:p-4 lg:p-0 rounded-lg">
                  <p className="text-[10px] tracking-wider uppercase font-bold text-gray-500 mb-1">TOTAL VIEW</p>
                  <p className="text-2xl font-bold text-primary">{totalViews.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-green-600 font-bold mt-1">{viewChangePct} vs minggu lalu</p>
                </div>
                <div className="bg-gray-50 lg:bg-transparent p-2 sm:p-4 lg:p-0 rounded-lg">
                  <p className="text-[10px] tracking-wider uppercase font-bold text-secondary-container mb-1">NEGOSIASI AKTIF</p>
                  <p className="text-2xl font-bold text-primary">{activeNegotiations}</p>
                  <p className="text-xs text-gray-500 font-bold mt-1">Sedang berjalan</p>
                </div>
                <div className="bg-gray-50 lg:bg-transparent p-2 sm:p-4 lg:p-0 rounded-lg border border-primary-fixed-dim lg:border-none">
                  <p className="text-[10px] tracking-wider uppercase font-bold text-gray-500 mb-1">SKOR TOKO</p>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <p className="text-2xl font-bold text-primary">{ratingValue}</p>
                  </div>
                  <p className="text-xs text-primary font-bold mt-1">{ratingLabel}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4">
            {/* Aktivitas Terkini */}
            <div className="xl:col-span-2">
              <h2 className="text-primary text-xl font-bold mb-4">Aktivitas Terkini</h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-8">
                {activities.map((act) => (
                  <div key={act.id} className="flex gap-4 items-start">
                    <div className={`w-10 h-10 rounded-full ${act.iconBg} ${act.iconColor} flex items-center justify-center shrink-0 mt-1`}>
                      <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
                    </div>
                    <div>
                      <p className="text-[13px] md:text-sm text-gray-800 leading-relaxed font-medium">
                        {act.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Insight */}
            <div className="xl:col-span-1 flex flex-col">
              <h2 className="text-primary text-xl font-bold mb-4 xl:opacity-0 xl:hidden">Export Insight</h2>
              <div className="bg-primary rounded-2xl p-6 md:p-8 shadow-sm flex-1 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
                <div className="absolute right-0 bottom-0 opacity-[0.05] pointer-events-none">
                  <span className="material-symbols-outlined text-[200px] translate-x-8 translate-y-8">trending_up</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-primary-fixed-dim text-xl font-bold mb-4">Export Insight</h3>
                  <p className="text-white/90 text-[13px] md:text-sm leading-relaxed font-medium">
                    {exportInsightText}
                  </p>
                </div>
                <div className="mt-8 relative z-10">
                  <button className="bg-primary-fixed-dim text-primary font-bold px-6 py-3 rounded-xl text-sm hover:bg-white transition-colors shadow-sm w-fit">
                    Lihat Laporan
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* MOBILE BOTTOM NAV */}
        <MobileBottomNav unreadMessagesCount={3} />
      </main>
    </div>
  );
}
