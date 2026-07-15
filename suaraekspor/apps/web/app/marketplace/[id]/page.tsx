'use client';
// PATH: suaraekspor/apps/web/app/marketplace/[id]/page.tsx
// Halaman detail produk untuk BUYER — include Contact Seller + send message
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Send, ChevronLeft, Package, MessageCircle, ShieldCheck, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import apiClient from '@/lib/api-client';

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
  recommendedPriceUsd?: number | null;
  priceRangeMin?: number | null;
  priceRangeMax?: number | null;
  category?: string | null;
  exportReadinessScore?: number | null;
  createdAt: string;
  listings: ProductListing[];
  seller?: { name?: string | null; province?: string | null; businessName?: string | null } | null;
}

export default function BuyerProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [lang, setLang] = useState<string>('en');
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [activeTxn, setActiveTxn] = useState<any | null>(null);
  const [advancingTxn, setAdvancingTxn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchProduct() {
      // Don't show full-screen spinner if product is already loaded to keep UI smooth on language switch
      if (!product) setLoading(true);
      setLoadError(null);
      try {
        const res = await apiClient.get(`/products/${id}`, { params: { lang } });
        if (cancelled) return;
        const data: ApiProduct = res.data?.data;
        setProduct(data);
        setActiveImage(prev => prev || data.photoUrls?.[0] || null);
        
        const codes = (data.listings || []).map(l => l.languageCode.toLowerCase());
        // Only set default language on initial load
        setLang(prev => {
          if (prev && prev !== 'en' && codes.includes(prev)) return prev;
          return codes.includes('en') ? 'en' : (codes[0] || 'en');
        });
      } catch (err) {
        if (!cancelled) setLoadError('Produk tidak ditemukan atau gagal dimuat.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) fetchProduct();
    return () => { cancelled = true; };
  }, [id, lang]);

  // Catat 1 kunjungan produk saat halaman pertama kali dibuka (bukan tiap ganti bahasa)
  useEffect(() => {
    if (id) apiClient.post(`/products/${id}/view`).catch(() => {});
  }, [id]);

  async function handleContactSeller() {
    setContactError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    if (!token) {
      router.push('/login?role=buyer');
      return;
    }
    setSending(true);
    try {
      const res = await apiClient.post('/conversations', { productId: id, buyerLang: lang });
      const conversation = res.data?.data;
      if (conversation?.id) {
        router.push(`/marketplace/conversations/${conversation.id}`);
      }
    } catch (err) {
      setContactError('Gagal menghubungi penjual. Silakan coba lagi.');
    } finally {
      setSending(false);
    }
  }

  async function handleSimulateOrder() {
    setOrderError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('se_token') : null;
    if (!token) {
      router.push('/login?role=buyer');
      return;
    }
    setOrdering(true);
    try {
      const res = await apiClient.post('/transactions', { productId: id, quantity: 1 });
      setActiveTxn(res.data?.data);
    } catch (err) {
      setOrderError('Gagal membuat simulasi pesanan. Silakan coba lagi.');
    } finally {
      setOrdering(false);
    }
  }

  async function handleAdvanceTxn() {
    if (!activeTxn) return;
    setAdvancingTxn(true);
    setOrderError(null);
    try {
      const res = await apiClient.patch(`/transactions/${activeTxn.id}/status`, {});
      setActiveTxn(res.data?.data);
    } catch (err) {
      setOrderError('Gagal memperbarui status transaksi.');
    } finally {
      setAdvancingTxn(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif"}}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-outline-variant border-t-primary-container rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] text-on-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4 text-gray-600">
          <span className="material-symbols-outlined text-6xl text-outline-variant">inventory_2</span>
          <p className="text-lg font-semibold">{loadError || 'Produk tidak ditemukan'}</p>
          <Link href="/marketplace" className="mt-2 px-6 py-2 bg-secondary-container text-white font-bold rounded-lg hover:brightness-110 transition-all">
            Kembali ke Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const availableLangs = product.listings || [];
  const currentListing = availableLangs.find(l => l.languageCode.toLowerCase() === lang) || availableLangs[0];
  const title = currentListing?.title || 'Produk Tanpa Judul';
  const description = currentListing?.description || '';
  const keywords = currentListing?.keywords || [];
  const category = product.category || 'Lainnya';
  const exportReady = (product.exportReadinessScore ?? 0) >= 70;
  const gallery = product.photoUrls || [];
  const heroImage = activeImage || gallery[0] || null;
  const sellerName = product.seller?.businessName || product.seller?.name || 'Penjual';
  const sellerProvince = product.seller?.province || '-';

  return (
    <div className="min-h-screen bg-background text-on-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />

      <main className="pt-6 md:pt-16 pb-20 md:pb-[120px] px-4 md:px-16 max-w-[1280px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-[12px] font-bold text-gray-600 uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
          <Link href="/marketplace" className="hover:text-primary-container transition-colors">Marketplace</Link>
          <ChevronLeft size={14} className="rotate-180" />
          <span className="hover:text-primary-container transition-colors cursor-pointer capitalize">{category}</span>
          <ChevronLeft size={14} className="rotate-180" />
          <span className="text-primary-container">{title}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 md:gap-12 items-start">
          {/* Left: Product Images */}
          <div className="space-y-4 md:space-y-6">
            <div className="relative group aspect-square md:aspect-[4/3] rounded-xl overflow-hidden border border-outline-variant/30 bg-white">
              {heroImage ? (
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={heroImage}
                  alt={title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-outline-variant">
                  <Package size={64} />
                </div>
              )}
              {exportReady && (
                <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-secondary-container text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-[12px] flex items-center gap-2 shadow-lg tracking-widest uppercase">
                  <ShieldCheck size={16} />
                  EXPORT READY
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-1.5 md:gap-4">
                {gallery.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-colors border-2 ${heroImage === img ? 'border-primary-container ring-offset-2' : 'border-outline-variant/30 hover:border-primary-container'}`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="bg-white p-4 md:p-8 rounded-xl border border-outline-variant/30 shadow-sm md:sticky md:top-24">
            <p className="text-[12px] font-bold text-secondary-container tracking-[0.2em] mb-2 capitalize">{category}</p>
            <h1 className="text-[32px] md:text-[40px] font-bold text-primary-container mb-6 leading-tight tracking-[-0.02em]">{title}</h1>

            {/* Export Readiness Score */}
            {typeof product.exportReadinessScore === 'number' && (
              <div className="mb-6 p-4 bg-surface-variant rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[16px] font-semibold text-primary-container">Export Readiness Score</span>
                  <span className="text-[16px] font-bold text-primary-container">{product.exportReadinessScore}%</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container rounded-full" style={{ width: `${product.exportReadinessScore}%` }}></div>
                </div>
              </div>
            )}

            <div className="mb-6">
              {product.recommendedPriceUsd != null ? (
                <p className="text-[28px] md:text-[36px] font-bold text-secondary-container flex items-baseline gap-2 flex-wrap">
                  ${product.recommendedPriceUsd.toFixed(2)} USD
                </p>
              ) : (
                <p className="text-[20px] font-bold text-gray-600">Harga belum tersedia</p>
              )}
              {(product.priceRangeMin != null && product.priceRangeMax != null) && (
                <p className="text-[14px] text-gray-600 mt-1">
                  Estimasi kisaran harga: ${product.priceRangeMin.toFixed(2)} – ${product.priceRangeMax.toFixed(2)} (bukan harga tetap)
                </p>
              )}
            </div>

            {/* Language Switcher */}
            {availableLangs.length > 0 && (
              <div className="mb-8">
                <p className="text-[12px] font-bold text-gray-600 tracking-widest uppercase mb-3">LISTING LANGUAGES</p>
                <div className="flex flex-wrap gap-2">
                  {availableLangs.map(l => (
                    <button
                      key={l.languageCode}
                      onClick={() => setLang(l.languageCode.toLowerCase())}
                      className={`px-4 py-2 rounded-lg text-[16px] font-semibold transition-colors ${
                        lang === l.languageCode.toLowerCase()
                          ? 'bg-primary-container text-white'
                          : 'bg-surface-variant text-gray-600 hover:bg-outline-variant/30'
                      }`}
                    >
                      {l.languageCode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Card */}
            <div className="p-4 border border-outline-variant/20 bg-[#f6f3f2] rounded-lg flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white border border-outline-variant/30 flex-shrink-0 flex items-center justify-center text-primary-container font-bold text-xl">
                {sellerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary-container text-[18px] leading-tight">{sellerName}</h4>
                <p className="text-[16px] text-gray-600">{sellerProvince}</p>
              </div>
            </div>

            {/* AI-Powered Communication Feature Badge */}
            <div className="bg-primary-fixed/30 border border-primary-fixed rounded-xl p-4 flex items-center gap-3 mb-6">
              <ShieldCheck size={24} className="text-[#105226] flex-shrink-0" />
              <div>
                <p className="text-[14px] font-bold text-[#00210a]">AI-Powered Communication</p>
                <p className="text-[12px] text-[#105226] leading-relaxed mt-0.5">Your message will be instantly translated. Seller receives a voice notification in their local language.</p>
              </div>
            </div>

            {/* CONTACT SELLER */}
            <div className="bg-background rounded-xl p-4 md:p-6 border border-outline-variant/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} className="text-primary-container" />
                  <p className="text-[16px] font-bold text-primary-container">Hubungi Penjual</p>
                </div>
              </div>

              {contactError && (
                <p className="text-[12px] text-red-500 font-semibold mb-3">{contactError}</p>
              )}

              <button
                onClick={handleContactSeller}
                disabled={sending}
                className="w-full bg-secondary-container text-white font-bold py-4 rounded-xl text-[16px] disabled:opacity-50 transition-all hover:opacity-90 shadow-lg shadow-[var(--color-secondary-container)]/20 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Contact Seller
                  </>
                )}
              </button>
            </div>

            {/* SIMULASI PESANAN & PEMBAYARAN */}
            <div className="mt-4 bg-background rounded-xl p-4 md:p-6 border border-outline-variant/30">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart size={18} className="text-primary-container" />
                <p className="text-[16px] font-bold text-primary-container">Simulasi Transaksi Buyer</p>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary-container/10 text-secondary-container px-2 py-0.5 rounded">Simulasi</span>
              </div>

              {orderError && <p className="text-[12px] text-red-500 font-semibold mb-3">{orderError}</p>}

              {!activeTxn ? (
                <>
                  <p className="text-[12px] text-gray-600 mb-4 leading-relaxed">
                    Karena pembeli tidak memiliki dashboard, Anda dapat mensimulasikan proses pembelian, pembayaran escrow, hingga penyelesaian transaksi secara langsung di sini.
                  </p>
                  <button
                    onClick={handleSimulateOrder}
                    disabled={ordering || product.recommendedPriceUsd == null}
                    className="w-full bg-primary-container text-white font-bold py-3.5 rounded-xl text-[14px] disabled:opacity-50 transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    {ordering ? 'Memproses...' : 'Simulasikan Pembelian (Beli)'}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Status Steps Tracker */}
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                      <span className="text-xs text-gray-500 font-medium">Status Transaksi:</span>
                      <span className="text-xs font-bold text-secondary-container bg-secondary-container/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {activeTxn.status === 'order_placed' && 'Pesanan Dibuat'}
                        {activeTxn.status === 'payment_simulated' && 'Pembayaran Sukses'}
                        {activeTxn.status === 'escrow_held' && 'Dana di Escrow'}
                        {activeTxn.status === 'released' && 'Dana Dilepas'}
                        {activeTxn.status === 'completed' && 'Selesai'}
                        {activeTxn.status === 'cancelled' && 'Dibatalkan'}
                      </span>
                    </div>

                    <div className="space-y-2 pt-1 text-left">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${activeTxn.status !== 'cancelled' ? 'bg-primary' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-700">1. Pesanan dibuat oleh buyer</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${['payment_simulated', 'escrow_held', 'released', 'completed'].includes(activeTxn.status) ? 'bg-primary' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-700">2. Pembayaran disimulasikan</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${['escrow_held', 'released', 'completed'].includes(activeTxn.status) ? 'bg-primary' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-700">3. Dana aman ditahan Escrow</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${['released', 'completed'].includes(activeTxn.status) ? 'bg-primary' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-700">4. Dana dilepas ke UMKM</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${activeTxn.status === 'completed' ? 'bg-primary' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-700">5. Transaksi selesai</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions depending on status */}
                  {activeTxn.status === 'order_placed' && (
                    <button
                      onClick={handleAdvanceTxn}
                      disabled={advancingTxn}
                      className="w-full bg-primary-container text-white font-bold py-3 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {advancingTxn ? 'Memproses...' : 'Simulasikan Bayar Sekarang (Buyer)'}
                    </button>
                  )}

                  {activeTxn.status === 'payment_simulated' && (
                    <button
                      onClick={handleAdvanceTxn}
                      disabled={advancingTxn}
                      className="w-full bg-secondary-container text-white font-bold py-3 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {advancingTxn ? 'Memproses...' : 'Simulasikan Tahan di Escrow'}
                    </button>
                  )}

                  {activeTxn.status === 'escrow_held' && (
                    <button
                      onClick={handleAdvanceTxn}
                      disabled={advancingTxn}
                      className="w-full bg-primary-container text-white font-bold py-3 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {advancingTxn ? 'Memproses...' : 'Simulasikan Lepas Dana ke UMKM'}
                    </button>
                  )}

                  {activeTxn.status === 'released' && (
                    <button
                      onClick={handleAdvanceTxn}
                      disabled={advancingTxn}
                      className="w-full bg-green-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {advancingTxn ? 'Memproses...' : 'Selesaikan Transaksi (Simulasi)'}
                    </button>
                  )}

                  {activeTxn.status === 'completed' && (
                    <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 text-center">
                      <p className="text-xs font-bold mb-1">🎉 Transaksi Selesai!</p>
                      <p className="text-[11px] leading-relaxed">Seluruh alur ekspor & pembayaran escrow berhasil disimulasikan.</p>
                      <button
                        onClick={() => setActiveTxn(null)}
                        className="mt-3 text-[11px] font-bold underline hover:opacity-85"
                      >
                        Mulai Simulasi Baru
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Detail Sections */}
        <section className="mt-20 md:mt-[160px] grid grid-cols-1 gap-8 md:gap-16">
          <div className="space-y-16">

            {/* Deskripsi & Detail Produk */}
            <div>
              <h3 className="text-[24px] font-bold text-primary-container mb-6 border-b border-outline-variant/30 pb-3">Product Description</h3>
              <p className="text-[16px] text-gray-600 leading-relaxed mb-6">{description || 'Belum ada deskripsi.'}</p>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {keywords.map(k => (
                    <span key={k} className="bg-surface-variant text-gray-600 text-[12px] px-3 py-1.5 rounded-full capitalize">{k}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
