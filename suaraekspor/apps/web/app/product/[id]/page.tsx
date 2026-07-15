'use client';
// PATH: suaraekspor/apps/web/app/product/[id]/page.tsx

import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMiddleman } from "../../context/middleman-context";
import Sidebar from '../../../components/layout/Sidebar';
import MobileProfileMenu from '../../../components/layout/MobileProfileMenu';
import apiClient from '../../../lib/api-client';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ErrorState from '../../../components/ui/ErrorState';
import MobileBottomNav from '../../../components/layout/MobileBottomNav';

interface ProductListing {
  languageCode: string;
  languageName: string;
  title: string;
  description: string;
  keywords: string[];
}

interface ApiProduct {
  id: string;
  status: string;
  photoUrls: string[];
  originalAudioUrl?: string | null;
  originalTranscript?: string | null;
  detectedLanguage?: string | null;
  visionAnalysis?: {
    estimatedCategory?: string;
    condition?: string;
    features?: string[];
    [key: string]: unknown;
  } | null;
  recommendedPriceUsd?: number | null;
  priceRangeMin?: number | null;
  priceRangeMax?: number | null;
  targetMarkets?: string[];
  category?: string | null;
  exportReadinessScore?: number | null;
  aiPipelineStage?: string | null;
  createdAt: string;
  listings: ProductListing[];
  seller?: { name?: string | null; province?: string | null; businessName?: string | null } | null;
}

const TXN_STEPS = ['order_placed', 'payment_simulated', 'escrow_held', 'released', 'completed'] as const;
const TXN_LABELS: Record<string, string> = {
  order_placed: 'Pesanan Dibuat',
  payment_simulated: 'Pembayaran (Simulasi)',
  escrow_held: 'Dana Ditahan Escrow',
  released: 'Dana Dilepas',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

interface Transaction {
  id: string;
  productId: string;
  status: string;
  totalUsd: number;
  quantity: number;
  buyer?: { name?: string | null } | null;
}

const LANG_FLAGS: Record<string, string> = {
  en: '🇺🇸', zh: '🇨🇳', ar: '🇸🇦', ja: '🇯🇵', de: '🇩🇪', id: '🇮🇩',
};
const LANG_NAMES: Record<string, string> = {
  en: 'English', zh: '中文', ar: 'العربية', ja: '日本語', de: 'Deutsch', id: 'Bahasa Indonesia',
};

export default function ProductDetail() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const id = (params?.id as string) || '';
  const { isMiddleman, setIsMiddleman, activeUMKM } = useMiddleman();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'listings' | 'keywords'>('listings');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  function handlePlayAudio() {
    if (!product?.originalAudioUrl) return;
    const audio = new Audio(product.originalAudioUrl);
    setPlayingAudio(true);
    audio.play().catch(() => setPlayingAudio(false));
    audio.onended = () => setPlayingAudio(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchProduct() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await apiClient.get(`/products/${id}`);
        if (cancelled) return;
        const data: ApiProduct = res.data?.data;
        setProduct(data);
        setExpandedListing(data.listings?.[0]?.languageCode ?? null);
      } catch (err) {
        if (!cancelled) setLoadError('Produk tidak ditemukan atau gagal dimuat.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) fetchProduct();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    apiClient.get('/transactions').then(({ data }) => {
      if (cancelled) return;
      const all: Transaction[] = data?.data ?? [];
      setTransactions(all.filter((t) => t.productId === id));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

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

  function handleCopy(text: string, code: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function handleShare() {
    if (!product) return;
    const title = product.listings?.[0]?.title || 'Produk';
    if (navigator.share) {
      await navigator.share({
        title,
        text: `Cek produk ini di SuaraEkspor: ${title}`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => { });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-24">
        <LoadingSpinner label="Memuat produk..." size="lg" />
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen bg-background py-24">
        <ErrorState 
          title="Produk Tidak Ditemukan" 
          message={loadError || 'Produk tidak ditemukan.'} 
          onRetry={() => router.push('/dashboard')}
        />
      </div>
    );
  }

  const title = product.listings?.[0]?.title || 'Produk Tanpa Judul';
  const province = product.seller?.province || '-';
  const category = product.category || product.visionAnalysis?.estimatedCategory || '-';
  const score = product.exportReadinessScore ?? 0;
  const price = product.recommendedPriceUsd;
  const priceRange = { min: product.priceRangeMin, max: product.priceRangeMax };
  const markets = product.targetMarkets || [];
  const vision = product.visionAnalysis;

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-56 bg-background min-h-screen flex flex-col overflow-y-auto pb-24 md:pb-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">Produk</h1>
            <p className="text-xs text-gray-500">Detail & Listing</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Export Score */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 shadow-sm">
              <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase">Export Score</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-bold text-primary">{score}</span>
                <span className="text-[10px] text-gray-400 font-bold">/ 100</span>
              </div>
            </div>
            <button onClick={() => router.back()} className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Dashboard
            </button>
            <MobileProfileMenu />
          </div>
        </header>

        {/* Insights Bento Grid */}
        <section className="px-4 md:px-8 pt-4 md:pt-8 pb-20 md:pb-12 max-w-[1440px] mx-auto flex-1 w-full">
          <div className="mb-4">
            <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Produk</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-0.5 truncate">{title}</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span>{province}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-bold text-[10px] tracking-wide">Aktif · {product.listings.length} bahasa</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            
            {/* Card 1: AI Pricing Recommendation */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>monitoring</span>
                  <h3 className="text-label-caps text-on-surface-variant">REKOMENDASI HARGA AI</h3>
                </div>
                <span className="bg-primary-container/10 text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold">Powered by Market Engine</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 mb-8">
                <div className="flex flex-col shrink-0">
                  <span className="text-4xl font-extrabold text-secondary-container leading-tight">{price != null ? `$${price.toFixed(2)}` : '—'}</span>
                  <span className="text-on-surface-variant text-xs font-medium">Harga Rekomendasi</span>
                </div>
                <div className="flex-grow space-y-4">
                  <div className="flex justify-between text-xs font-bold text-label-caps text-on-surface-variant">
                    <span>Estimasi Range: {priceRange.min != null && priceRange.max != null ? `$${priceRange.min} — $${priceRange.max}` : 'Belum tersedia'}</span>
                    <span className="text-primary">Target Global</span>
                  </div>
                  <div className="relative h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-secondary-container to-on-tertiary-container rounded-full transition-all duration-500" style={{ width: `${score}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-label-caps uppercase text-on-surface-variant opacity-70">
                    <span>Kurang kompetitif</span>
                    <span className="text-primary font-extrabold text-xs">Score: {score}/100</span>
                    <span>Sangat kompetitif</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Voice Summary */}
            <div className="col-span-12 lg:col-span-4 bg-primary-container text-on-primary rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-on-primary-container/10 rounded-full blur-3xl"></div>
              <div>
                <h3 className="text-[10px] font-bold tracking-wider text-on-primary-container mb-4">DENGAR RINGKASAN SUARA</h3>
                <div className="flex items-center gap-4">
                  <button onClick={handlePlayAudio} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${playingAudio ? 'bg-secondary-container animate-pulse' : 'bg-secondary-container hover:scale-105'}`}>
                    <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>volume_up</span>
                  </button>
                  <div>
                    <p className="text-lg font-bold leading-tight text-white mb-0.5">Ringkasan Narasi</p>
                    <p className="text-on-primary-container text-xs">Dalam {product.detectedLanguage || '-'}{product.originalAudioUrl ? '' : ' · Audio tidak tersedia'}</p>
                  </div>
                </div>
              </div>
              {playingAudio ? (
                <div className="mt-6 flex items-center justify-between bg-white/10 rounded-full p-1.5 pl-5">
                  <span className="text-[11px] font-medium text-white/80">Sedang diputar...</span>
                  <div className="flex gap-1 items-center h-5 mr-3">
                    {[3, 5, 4, 7, 3, 6, 4, 5].map((h, i) => (
                      <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex items-center justify-between bg-white/10 rounded-full p-1.5 pl-5 cursor-pointer hover:bg-white/20 transition-colors active:scale-[0.98]" onClick={handlePlayAudio}>
                  <span className="text-[11px] font-medium text-white/80">Siap diputar</span>
                  <button className="w-8 h-8 bg-white text-primary-container rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>play_arrow</span>
                  </button>
                </div>
              )}
            </div>

            {/* Card 3: Voice Transcription */}
            <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-label-caps text-on-surface-variant">TRANSKRIPSI SUARA</h3>
                </div>
                <div className="flex items-center gap-2 bg-surface-container px-2.5 py-1 rounded-md">
                  <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>auto_awesome</span>
                  <span className="text-[9px] font-bold text-label-caps text-on-surface-variant">WHISPER AI</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-on-tertiary-fixed-variant bg-tertiary-fixed px-2 py-0.5 rounded">Terdeteksi: {product.detectedLanguage || '-'}</span>
              </div>
              <blockquote className="text-on-surface italic text-sm border-l-2 border-secondary-container/30 pl-4 py-1 leading-relaxed">
                {product.originalTranscript || 'Transkripsi tidak tersedia.'}
              </blockquote>
            </div>

            {/* Card 4: Photo Analysis */}
            <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-label-caps text-on-surface-variant">ANALISIS FOTO</h3>
                </div>
                <div className="flex items-center gap-2 bg-surface-container px-2.5 py-1 rounded-md">
                  <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>visibility</span>
                  <span className="text-[9px] font-bold text-label-caps text-on-surface-variant uppercase">GPT-4o Vision</span>
                </div>
              </div>
              {vision ? (
                <div className="grid grid-cols-2 gap-4 flex-grow">
                  {[
                    { label: 'JENIS PRODUK', value: (vision.estimatedCategory as string) || category },
                    { label: 'KONDISI', value: (vision.condition as string) || '-' },
                    { label: 'KATEGORI', value: category },
                  ].map(item => (
                    <div key={item.label} className="bg-background p-4 rounded-lg border border-outline-variant/20">
                      <span className="block text-[10px] text-on-surface-variant text-label-caps font-bold mb-2">{item.label}</span>
                      <span className="text-primary font-bold">{item.value}</span>
                    </div>
                  ))}
                  {Array.isArray(vision.features) && vision.features.length > 0 && (
                    <div className="bg-background p-4 rounded-lg border border-outline-variant/20">
                      <span className="block text-[10px] text-on-surface-variant text-label-caps font-bold mb-2">FITUR VISUAL</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(vision.features as string[]).map(f => (
                          <span key={f} className="text-primary text-[10px] font-bold px-2 py-0.5 rounded-sm bg-primary/10">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant flex-grow flex items-center">Analisis foto belum tersedia.</p>
              )}
            </div>

            {/* Target Pasar & Listing Multibahasa Column */}
            <div className="col-span-12 lg:col-span-12 grid grid-cols-12 gap-4">
              
              {/* Target Pasar */}
              <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-label-caps text-on-surface-variant mb-4">REKOMENDASI TARGET PASAR</h3>
                  <div className="flex flex-wrap gap-2">
                    {markets.length > 0 ? markets.map(m => (
                      <span key={m} className="bg-secondary/10 text-secondary font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        {m}
                      </span>
                    )) : <p className="text-xs text-on-surface-variant">Belum ada rekomendasi pasar.</p>}
                  </div>
                </div>
                <div className="mt-6 border-t border-outline-variant/20 pt-4">
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    Negara di atas ditentukan berdasarkan kecocokan kategori dan minat pembeli global tertinggi untuk produk {category}.
                  </p>
                </div>
              </div>

              {/* Listing Multibahasa */}
              <div className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest">
                  <div>
                    <h3 className="text-label-caps text-on-surface-variant">LISTING MULTIBAHASA AI</h3>
                    <p className="text-xs text-on-surface-variant mt-1">Gunakan terjemahan teroptimasi untuk e-commerce global.</p>
                  </div>
                  <div className="flex gap-1.5 bg-surface-container p-1 rounded-lg border border-outline-variant/20 self-start sm:self-auto">
                    <button
                      onClick={() => setActiveTab('listings')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'listings' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      Draft Listing
                    </button>
                    <button
                      onClick={() => setActiveTab('keywords')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'keywords' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      Keywords AI
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-grow">
                  {product.listings.length === 0 && (
                    <p className="text-sm text-on-surface-variant">Belum ada listing yang dihasilkan.</p>
                  )}
                  {activeTab === 'listings' && (
                    <div className="space-y-4">
                      {product.listings.map(l => {
                        const code = l.languageCode.toUpperCase();
                        const flag = LANG_FLAGS[l.languageCode.toLowerCase()] || '🌐';
                        const langName = l.languageName || LANG_NAMES[l.languageCode.toLowerCase()] || code;
                        return (
                        <div key={l.languageCode} className="border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                          <div
                            onClick={() => setExpandedListing(expandedListing === l.languageCode ? null : l.languageCode)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low/50 transition-colors bg-surface-container-lowest"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{flag}</span>
                              <div>
                                <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded text-label-caps">{code}</span>
                                <span className="text-xs font-bold text-on-surface ml-2">{langName}</span>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-300" style={{ transform: expandedListing === l.languageCode ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              keyboard_arrow_down
                            </span>
                          </div>
                          {expandedListing === l.languageCode && (
                            <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/30 space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-[9px] font-bold text-on-surface-variant text-label-caps">JUDUL LISTING</label>
                                  <button onClick={() => handleCopy(l.title, code + 'title')} className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">{copiedCode === code + 'title' ? 'check' : 'content_copy'}</span>
                                    {copiedCode === code + 'title' ? 'Tersalin' : 'Salin'}
                                  </button>
                                </div>
                                <p className="text-xs font-bold text-on-surface leading-normal">{l.title}</p>
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-[9px] font-bold text-on-surface-variant text-label-caps">DESKRIPSI LISTING</label>
                                  <button onClick={() => handleCopy(l.description, code + 'desc')} className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">{copiedCode === code + 'desc' ? 'check' : 'content_copy'}</span>
                                    {copiedCode === code + 'desc' ? 'Tersalin' : 'Salin'}
                                  </button>
                                </div>
                                <p className="text-xs text-on-surface leading-relaxed mt-3">{l.description}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'keywords' && (
                    <div className="flex flex-col gap-3">
                      {product.listings.map(l => {
                        const code = l.languageCode.toUpperCase();
                        const langName = l.languageName || LANG_NAMES[l.languageCode.toLowerCase()] || code;
                        return (
                        <div key={l.languageCode} className="p-4 border border-outline-variant/30 rounded-xl shadow-sm bg-surface-container-lowest">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-lg text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>translate</span>
                            <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded text-label-caps">{code}</span>
                            <span className="text-[10px] text-on-surface-variant text-label-caps">{langName}</span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {l.keywords.map(k => (
                              <span key={k}
                                className="bg-surface-container-high text-on-surface text-xs font-bold px-4 py-2 rounded-full cursor-pointer hover:bg-outline-variant transition-colors"
                                onClick={() => handleCopy(k, code + k)}>
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
            </div>

            {/* Simulasi Transaksi — belum ada payment gateway/escrow asli */}
            {transactions.length > 0 && (
              <div className="col-span-12 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <h3 className="text-label-caps text-on-surface-variant">SIMULASI TRANSAKSI</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-surface-container text-on-surface-variant px-2 py-0.5 rounded">Belum Ada Payment Gateway Asli</span>
                </div>
                <div className="space-y-6">
                  {transactions.map((t) => {
                    const stepIdx = TXN_STEPS.indexOf(t.status as any);
                    const isCancelled = t.status === 'cancelled';
                    const isFinal = t.status === 'completed' || isCancelled;
                    return (
                      <div key={t.id} className="border border-outline-variant/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <p className="text-sm font-bold text-on-surface">
                            {t.buyer?.name || 'Buyer'} · {t.quantity}x · ${t.totalUsd.toFixed(2)}
                          </p>
                          {!isFinal && (
                            <button
                              onClick={() => handleAdvanceTransaction(t.id)}
                              disabled={advancingId === t.id}
                              className="text-xs font-bold bg-primary text-on-primary px-4 py-2 rounded-lg disabled:opacity-50"
                            >
                              {advancingId === t.id ? 'Memproses...' : `Lanjutkan ke: ${TXN_LABELS[TXN_STEPS[stepIdx + 1]] ?? '-'}`}
                            </button>
                          )}
                        </div>
                        {isCancelled ? (
                          <p className="text-xs font-bold text-red-500">Dibatalkan</p>
                        ) : (
                          <div className="flex items-center gap-1">
                            {TXN_STEPS.map((step, i) => (
                              <div key={step} className="flex-1 flex items-center gap-1">
                                <div className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? 'bg-primary' : 'bg-surface-container-high'}`} />
                              </div>
                            ))}
                          </div>
                        )}
                        {!isCancelled && (
                          <p className="text-[10px] text-on-surface-variant mt-2">{TXN_LABELS[t.status] ?? t.status}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Share Buttons - Normal size */}
            <div className="col-span-12 flex flex-col sm:flex-row gap-3 mt-2 justify-end pb-8">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant/80 text-on-surface font-bold px-5 py-2.5 rounded-lg text-sm active:scale-95 transition-all shadow-sm hover:bg-surface-container-low w-full sm:w-auto"
              >
                {shared ? <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>check_circle</span> : <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>share</span>}
                {shared ? 'Tersalin!' : 'Bagikan'}
              </button>
              <button
                onClick={() => router.push(`/marketplace/${product.id}`)}
                className="flex items-center justify-center gap-2 bg-primary text-on-primary font-bold px-5 py-2.5 rounded-lg text-sm active:scale-95 transition-all shadow-md hover:brightness-110 w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>open_in_new</span> Lihat di Marketplace
              </button>
            </div>

          </div>
        </section>

        {/* MOBILE BOTTOM NAV */}
        <MobileBottomNav />
      </main>
    </div>
  );
}