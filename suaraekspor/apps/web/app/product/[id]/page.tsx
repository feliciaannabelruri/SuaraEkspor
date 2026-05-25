'use client';
// PATH: suaraekspor/apps/web/app/product/[id]/page.tsx

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useMiddleman } from "../../context/middleman-context";
import Sidebar from '../../../components/layout/Sidebar';
import MobileProfileMenu from '../../../components/layout/MobileProfileMenu';
const PRODUCT = {
  id: '1',
  title: 'Batik Tulis Pekalongan — Motif Parang Klasik',
  province: 'Pekalongan, Jawa Tengah',
  transcript: '"Iki batik tulisan tangan saking Pekalongan, motif parang, nganggo pewarna alami, apik banget kualitase, regane 150 ewu rupiah siji..."',
  transcriptLang: 'Bahasa Jawa',
  vision: {
    type: 'Batik Tulis Pekalongan',
    condition: 'Baru',
    features: ['Motif parang klasik', 'Pewarna alami', 'Kain mori premium', 'Ukuran 2m x 1.15m'],
    category: 'Tekstil & Batik',
  },
  price: 45,
  priceRange: { min: 38, max: 52 },
  priceRationale: 'Berdasarkan harga batik tulis sejenis di Etsy dan Amazon Handmade. Produk artisan Indonesia premium umumnya dijual $38–65 di pasar USA dan Eropa.',
  score: 87,
  markets: ['USA', 'Japan', 'Germany', 'Australia', 'UAE', 'Netherlands'],
  listings: [
    { code: 'EN', lang: 'English', flag: '🇺🇸', title: 'Handwoven Batik Pekalongan — Classic Parang Motif', desc: 'Authentic hand-drawn batik from Pekalongan, Indonesia. Features the classic Parang motif using natural dyes on premium mori fabric. Each piece is unique, crafted by skilled artisans with generations of expertise.', keywords: ['batik', 'indonesian textile', 'handmade', 'natural dye', 'parang motif'] },
    { code: 'ZH', lang: '中文', flag: '🇨🇳', title: '手工蜡染布 — 经典巴朗图案', desc: '来自印度尼西亚梭罗的正宗手工蜡染布，采用天然染料，经典巴朗图案，高级莫里布料，每件独一无二。', keywords: ['蜡染', '印尼纺织品', '手工', '天然染料'] },
    { code: 'AR', lang: 'العربية', flag: '🇸🇦', title: 'باتيك مصنوع يدويًا من باكالونغان', desc: 'باتيك أصيل مرسوم باليد من باكالونغان مع نقوش باران الكلاسيكية والأصباغ الطبيعية.', keywords: ['باتيك', 'نسيج إندونيسي', 'يدوي الصنع'] },
    { code: 'JA', lang: '日本語', flag: '🇯🇵', title: 'パカロンガン手描きバティック — クラシックパラン柄', desc: 'インドネシア・パカロンガン産の本物の手描きバティック。天然染料を使用したクラシックなパラン模様。', keywords: ['バティック', 'インドネシア', '手作り', '天然染料'] },
    { code: 'DE', lang: 'Deutsch', flag: '🇩🇪', title: 'Handgezeichneter Batik aus Pekalongan — Klassisches Parang-Motiv', desc: 'Authentischer handgezeichneter Batik aus Pekalongan, Indonesien. Mit klassischem Parang-Motiv und Naturfarben auf hochwertigem Mori-Stoff.', keywords: ['Batik', 'indonesisches Textil', 'handgemacht', 'Naturfarbe'] },
    { code: 'ID', lang: 'Bahasa Indonesia', flag: '🇮🇩', title: 'Batik Tulis Pekalongan — Motif Parang Klasik', desc: 'Batik tulis asli dari Pekalongan dengan motif parang klasik menggunakan pewarna alami pada kain mori premium. Setiap lembar dikerjakan oleh pengrajin berpengalaman.', keywords: ['batik tulis', 'pekalongan', 'motif parang', 'pewarna alami'] },
  ],
};

export default function ProductDetail() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMiddleman, setIsMiddleman, activeUMKM } = useMiddleman();
  const [playingAudio, setPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'keywords'>('listings');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedListing, setExpandedListing] = useState<string | null>('EN');

  function handlePlayAudio() {
    setPlayingAudio(true);
    setTimeout(() => setPlayingAudio(false), 3000);
  }

  function handleCopy(text: string, code: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const scoreBar = PRODUCT.score >= 80 ? 'bg-green-500' : PRODUCT.score >= 60 ? 'bg-amber-500' : 'bg-red-400';

  const [shared, setShared] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: PRODUCT.title,
        text: `Cek produk ini di SuaraEkspor: ${PRODUCT.title}`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => { });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-56 bg-[#fdf0e8] min-h-screen flex flex-col overflow-y-auto pb-24 md:pb-0">
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
                <span className="text-base font-bold text-[#0F4A33]">{PRODUCT.score}</span>
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
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-0.5 truncate">{PRODUCT.title}</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span>{PRODUCT.province}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-bold text-[10px] tracking-wide">Aktif · {PRODUCT.listings.length} bahasa</span>
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
                  <span className="text-4xl font-extrabold text-secondary-container leading-tight">${PRODUCT.price}</span>
                  <span className="text-on-surface-variant text-xs font-medium">Harga Rekomendasi</span>
                </div>
                <div className="flex-grow space-y-4">
                  <div className="flex justify-between text-xs font-bold text-label-caps text-on-surface-variant">
                    <span>Range: ${PRODUCT.priceRange.min} — ${PRODUCT.priceRange.max}</span>
                    <span className="text-primary">Target Global</span>
                  </div>
                  <div className="relative h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-secondary-container to-on-tertiary-container rounded-full transition-all duration-500" style={{ width: `${PRODUCT.score}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-label-caps uppercase text-on-surface-variant opacity-70">
                    <span>Kurang kompetitif</span>
                    <span className="text-primary font-extrabold text-xs">Score: {PRODUCT.score}/100</span>
                    <span>Sangat kompetitif</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-tertiary-fixed/10 border border-tertiary-fixed-dim/30 rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-on-tertiary-fixed-variant" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>lightbulb</span>
                <p className="text-sm text-on-tertiary-fixed-variant">{PRODUCT.priceRationale}</p>
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
                    <p className="text-on-primary-container text-xs">Dalam {PRODUCT.transcriptLang} · ~20 detik</p>
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
                <span className="text-[10px] font-bold text-on-tertiary-fixed-variant bg-tertiary-fixed px-2 py-0.5 rounded">Terdeteksi: {PRODUCT.transcriptLang}</span>
              </div>
              <blockquote className="text-on-surface italic text-sm border-l-2 border-secondary-container/30 pl-4 py-1 leading-relaxed">
                {PRODUCT.transcript}
              </blockquote>
              <div className="mt-6 flex gap-2">
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>translate</span> Lihat Terjemahan Inggris
                </button>
              </div>
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
              <div className="grid grid-cols-2 gap-4 flex-grow">
                {[
                  { label: 'JENIS PRODUK', value: PRODUCT.vision.type },
                  { label: 'KONDISI', value: PRODUCT.vision.condition },
                  { label: 'KATEGORI', value: PRODUCT.vision.category },
                ].map(item => (
                  <div key={item.label} className="bg-background p-4 rounded-lg border border-outline-variant/20">
                    <span className="block text-[10px] text-on-surface-variant text-label-caps font-bold mb-2">{item.label}</span>
                    <span className="text-primary font-bold">{item.value}</span>
                  </div>
                ))}
                <div className="bg-background p-4 rounded-lg border border-outline-variant/20">
                  <span className="block text-[10px] text-on-surface-variant text-label-caps font-bold mb-2">FITUR VISUAL</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {PRODUCT.vision.features.map(f => (
                      <span key={f} className="text-primary text-[10px] font-bold px-2 py-0.5 rounded-sm bg-primary/10">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Target Pasar & Listing Multibahasa Column */}
            <div className="col-span-12 lg:col-span-12 grid grid-cols-12 gap-4">
              
              {/* Target Pasar */}
              <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-label-caps text-on-surface-variant mb-4">REKOMENDASI TARGET PASAR</h3>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT.markets.map(m => (
                      <span key={m} className="bg-secondary/10 text-secondary font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 border-t border-outline-variant/20 pt-4">
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    Negara di atas ditentukan berdasarkan kecocokan kategori dan minat pembeli global tertinggi untuk produk {PRODUCT.vision.type}.
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
                  {activeTab === 'listings' && (
                    <div className="space-y-4">
                      {PRODUCT.listings.map(l => (
                        <div key={l.code} className="border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                          <div
                            onClick={() => setExpandedListing(expandedListing === l.code ? null : l.code)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low/50 transition-colors bg-surface-container-lowest"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{l.flag}</span>
                              <div>
                                <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded text-label-caps">{l.code}</span>
                                <span className="text-xs font-bold text-on-surface ml-2">{l.lang}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-bold text-primary">Score: 95/100</span>
                              <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-300" style={{ transform: expandedListing === l.code ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                keyboard_arrow_down
                              </span>
                            </div>
                          </div>
                          {expandedListing === l.code && (
                            <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/30 space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-[9px] font-bold text-on-surface-variant text-label-caps">JUDUL LISTING</label>
                                  <button onClick={() => handleCopy(l.title, l.code + 'title')} className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">{copiedCode === l.code + 'title' ? 'check' : 'content_copy'}</span>
                                    {copiedCode === l.code + 'title' ? 'Tersalin' : 'Salin'}
                                  </button>
                                </div>
                                <p className="text-xs font-bold text-on-surface leading-normal">{l.title}</p>
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-[9px] font-bold text-on-surface-variant text-label-caps">DESKRIPSI LISTING</label>
                                  <button onClick={() => handleCopy(l.desc, l.code + 'desc')} className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">{copiedCode === l.code + 'desc' ? 'check' : 'content_copy'}</span>
                                    {copiedCode === l.code + 'desc' ? 'Tersalin' : 'Salin'}
                                  </button>
                                </div>
                                <p className="text-xs text-on-surface leading-relaxed mt-3">{l.desc}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'keywords' && (
                    <div className="flex flex-col gap-3">
                      {PRODUCT.listings.map(l => (
                        <div key={l.code} className="p-4 border border-outline-variant/30 rounded-xl shadow-sm bg-surface-container-lowest">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-lg text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>translate</span>
                            <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded text-label-caps">{l.code}</span>
                            <span className="text-[10px] text-on-surface-variant text-label-caps">{l.lang}</span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {l.keywords.map(k => (
                              <span key={k}
                                className="bg-surface-container-high text-on-surface text-xs font-bold px-4 py-2 rounded-full cursor-pointer hover:bg-outline-variant transition-colors"
                                onClick={() => handleCopy(k, l.code + k)}>
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
            </div>

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
                onClick={() => router.push(`/marketplace/${PRODUCT.id ?? '1'}`)}
                className="flex items-center justify-center gap-2 bg-primary text-on-primary font-bold px-5 py-2.5 rounded-lg text-sm active:scale-95 transition-all shadow-md hover:brightness-110 w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>open_in_new</span> Lihat di Marketplace
              </button>
            </div>

          </div>
        </section>

        {/* MOBILE BOTTOM NAV */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#01261f] border-t border-[#83a69c]/10 flex z-50 pb-safe shadow-lg">
          {[
            { label: 'Produk', href: '/dashboard', icon: 'inventory_2' },
            { label: 'Upload', href: '/upload', icon: 'upload_file' },
            { label: 'Pesan', href: '/conversations', icon: 'forum' },
            { label: 'WhatsApp', href: '/whatsapp', icon: 'chat' },
            { label: 'Panduan', href: '/panduan', icon: 'menu_book' }
          ].map((item) => {
            const isActive = item.href === '/dashboard' 
              ? (pathname === '/dashboard' || (pathname && pathname.startsWith('/product')))
              : (pathname === item.href || (pathname && pathname.startsWith(item.href)));
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex-1 flex flex-col items-center py-2.5 transition-colors relative ${
                  isActive ? 'text-[#fe802f]' : 'text-[#83a69c] opacity-80 hover:opacity-100'
                }`}
              >
                <span 
                  className="material-symbols-outlined text-[20px]" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label === 'Pesan' && (
                  <span className="absolute top-2.5 right-6 w-2 h-2 bg-red-500 rounded-full border border-[#01261f]"></span>
                )}
                <span className={`text-[9px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}