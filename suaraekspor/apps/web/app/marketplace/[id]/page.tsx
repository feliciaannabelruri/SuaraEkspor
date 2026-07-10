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
  const [orderPlaced, setOrderPlaced] = useState(false);

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
        setActiveImage(data.photoUrls?.[0] || null);
        const codes = (data.listings || []).map(l => l.languageCode.toLowerCase());
        setLang(codes.includes('en') ? 'en' : (codes[0] || 'en'));
      } catch (err) {
        if (!cancelled) setLoadError('Produk tidak ditemukan atau gagal dimuat.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) fetchProduct();
    return () => { cancelled = true; };
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
      await apiClient.post('/transactions', { productId: id, quantity: 1 });
      setOrderPlaced(true);
    } catch (err) {
      setOrderError('Gagal membuat simulasi pesanan. Silakan coba lagi.');
    } finally {
      setOrdering(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b] flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-[#c1c8c4] border-t-[#1A3C34] rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b] flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4 text-[#414846]">
          <span className="material-symbols-outlined text-6xl text-[#c1c8c4]">inventory_2</span>
          <p className="text-lg font-semibold">{loadError || 'Produk tidak ditemukan'}</p>
          <Link href="/marketplace" className="mt-2 px-6 py-2 bg-[#fe802f] text-white font-bold rounded-lg hover:brightness-110 transition-all">
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
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />

      <main className="pt-6 md:pt-16 pb-20 md:pb-[120px] px-4 md:px-16 max-w-[1280px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-[12px] font-bold text-[#414846] uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
          <Link href="/marketplace" className="hover:text-[#1A3C34] transition-colors">Marketplace</Link>
          <ChevronLeft size={14} className="rotate-180" />
          <span className="hover:text-[#1A3C34] transition-colors cursor-pointer capitalize">{category}</span>
          <ChevronLeft size={14} className="rotate-180" />
          <span className="text-[#1A3C34]">{title}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 md:gap-12 items-start">
          {/* Left: Product Images */}
          <div className="space-y-4 md:space-y-6">
            <div className="relative group aspect-square md:aspect-[4/3] rounded-xl overflow-hidden border border-[#c1c8c4]/30 bg-white">
              {heroImage ? (
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={heroImage}
                  alt={title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#c1c8c4]">
                  <Package size={64} />
                </div>
              )}
              {exportReady && (
                <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-[#E76F1E] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-[12px] flex items-center gap-2 shadow-lg tracking-widest uppercase">
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
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-colors border-2 ${heroImage === img ? 'border-[#1A3C34] ring-offset-2' : 'border-[#c1c8c4]/30 hover:border-[#1A3C34]'}`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="bg-white p-4 md:p-8 rounded-xl border border-[#c1c8c4]/30 shadow-sm md:sticky md:top-24">
            <p className="text-[12px] font-bold text-[#E76F1E] tracking-[0.2em] mb-2 capitalize">{category}</p>
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#1A3C34] mb-6 leading-tight tracking-[-0.02em]">{title}</h1>

            {/* Export Readiness Score */}
            {typeof product.exportReadinessScore === 'number' && (
              <div className="mb-6 p-4 bg-[#f0eded] rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[16px] font-semibold text-[#1A3C34]">Export Readiness Score</span>
                  <span className="text-[16px] font-bold text-[#1A3C34]">{product.exportReadinessScore}%</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-[#E76F1E] rounded-full" style={{ width: `${product.exportReadinessScore}%` }}></div>
                </div>
              </div>
            )}

            <div className="mb-6">
              {product.recommendedPriceUsd != null ? (
                <p className="text-[28px] md:text-[36px] font-bold text-[#E76F1E] flex items-baseline gap-2 flex-wrap">
                  ${product.recommendedPriceUsd.toFixed(2)} USD
                </p>
              ) : (
                <p className="text-[20px] font-bold text-[#414846]">Harga belum tersedia</p>
              )}
              {(product.priceRangeMin != null && product.priceRangeMax != null) && (
                <p className="text-[14px] text-[#414846] mt-1">
                  Estimasi kisaran harga: ${product.priceRangeMin.toFixed(2)} – ${product.priceRangeMax.toFixed(2)} (bukan harga tetap)
                </p>
              )}
            </div>

            {/* Language Switcher */}
            {availableLangs.length > 0 && (
              <div className="mb-8">
                <p className="text-[12px] font-bold text-[#414846] tracking-widest uppercase mb-3">LISTING LANGUAGES</p>
                <div className="flex flex-wrap gap-2">
                  {availableLangs.map(l => (
                    <button
                      key={l.languageCode}
                      onClick={() => setLang(l.languageCode.toLowerCase())}
                      className={`px-4 py-2 rounded-lg text-[16px] font-semibold transition-colors ${
                        lang === l.languageCode.toLowerCase()
                          ? 'bg-[#1A3C34] text-white'
                          : 'bg-[#f0eded] text-[#414846] hover:bg-[#c1c8c4]/30'
                      }`}
                    >
                      {l.languageCode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Card */}
            <div className="p-4 border border-[#c1c8c4]/20 bg-[#f6f3f2] rounded-lg flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white border border-[#c1c8c4]/30 flex-shrink-0 flex items-center justify-center text-[#1A3C34] font-bold text-xl">
                {sellerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#1A3C34] text-[18px] leading-tight">{sellerName}</h4>
                <p className="text-[16px] text-[#414846]">{sellerProvince}</p>
              </div>
            </div>

            {/* AI-Powered Communication Feature Badge */}
            <div className="bg-[#c5eadf]/30 border border-[#c5eadf] rounded-xl p-4 flex items-center gap-3 mb-6">
              <ShieldCheck size={24} className="text-[#105226] flex-shrink-0" />
              <div>
                <p className="text-[14px] font-bold text-[#00210a]">AI-Powered Communication</p>
                <p className="text-[12px] text-[#105226] leading-relaxed mt-0.5">Your message will be instantly translated. Seller receives a voice notification in their local language.</p>
              </div>
            </div>

            {/* CONTACT SELLER */}
            <div className="bg-[#fcf9f8] rounded-xl p-4 md:p-6 border border-[#c1c8c4]/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} className="text-[#1A3C34]" />
                  <p className="text-[16px] font-bold text-[#1A3C34]">Hubungi Penjual</p>
                </div>
              </div>

              {contactError && (
                <p className="text-[12px] text-red-500 font-semibold mb-3">{contactError}</p>
              )}

              <button
                onClick={handleContactSeller}
                disabled={sending}
                className="w-full bg-[#E76F1E] text-white font-bold py-4 rounded-xl text-[16px] disabled:opacity-50 transition-all hover:opacity-90 shadow-lg shadow-[#E76F1E]/20 flex items-center justify-center gap-2"
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

            {/* SIMULASI PESANAN — belum ada payment gateway/escrow asli, ini simulasi status transaksi */}
            <div className="mt-4 bg-[#fcf9f8] rounded-xl p-4 md:p-6 border border-[#c1c8c4]/30">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart size={18} className="text-[#1A3C34]" />
                <p className="text-[16px] font-bold text-[#1A3C34]">Simulasi Pesanan</p>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#f0eded] text-[#414846] px-2 py-0.5 rounded">Simulasi</span>
              </div>
              <p className="text-[12px] text-[#414846] mb-3 leading-relaxed">
                Belum ada payment gateway/escrow sungguhan — tombol ini membuat catatan transaksi simulasi supaya alur pesanan bisa didemokan.
              </p>
              {orderError && <p className="text-[12px] text-red-500 font-semibold mb-3">{orderError}</p>}
              {orderPlaced ? (
                <p className="text-[14px] font-semibold text-[#105226]">Pesanan simulasi berhasil dibuat. Lihat status di halaman Pesan/Transaksi Anda.</p>
              ) : (
                <button
                  onClick={handleSimulateOrder}
                  disabled={ordering || product.recommendedPriceUsd == null}
                  className="w-full bg-[#1A3C34] text-white font-bold py-3.5 rounded-xl text-[14px] disabled:opacity-50 transition-all hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {ordering ? 'Memproses...' : 'Simulasikan Pesanan'}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Detail Sections */}
        <section className="mt-20 md:mt-[160px] grid grid-cols-1 gap-8 md:gap-16">
          <div className="space-y-16">

            {/* Deskripsi & Detail Produk */}
            <div>
              <h3 className="text-[24px] font-bold text-[#1A3C34] mb-6 border-b border-[#c1c8c4]/30 pb-3">Product Description</h3>
              <p className="text-[16px] text-[#414846] leading-relaxed mb-6">{description || 'Belum ada deskripsi.'}</p>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {keywords.map(k => (
                    <span key={k} className="bg-[#f0eded] text-[#414846] text-[12px] px-3 py-1.5 rounded-full capitalize">{k}</span>
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
