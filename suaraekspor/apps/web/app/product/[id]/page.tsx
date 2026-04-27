'use client';
// PATH: suaraekspor/apps/web/app/product/[id]/page.tsx

import { useRouter } from 'next/navigation';
import { Volume2, TrendingUp, Globe, Copy, CheckCircle, ChevronLeft, Share2, ExternalLink } from 'lucide-react';
import { useState } from 'react';

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

export default function ProductDetailPage() {
  const router = useRouter();
  const [playingAudio, setPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'keywords'>('listings');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedListing, setExpandedListing] = useState<string | null>('EN');

  function handlePlayAudio() {
    setPlayingAudio(true);
    setTimeout(() => setPlayingAudio(false), 3500);
  }

  function handleCopy(text: string, code: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const scoreBar = PRODUCT.score >= 80 ? 'bg-green-500' : PRODUCT.score >= 60 ? 'bg-amber-500' : 'bg-red-400';

  // Tambah di dalam component, setelah deklarasi state yang sudah ada
const [shared, setShared] = useState(false);

async function handleShare() {
  if (navigator.share) {
    await navigator.share({
      title: PRODUCT.title,
      text: `Cek produk ini di SuaraEkspor: ${PRODUCT.title}`,
      url: window.location.href,
    }).catch(() => {});
  } else {
    await navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }
}

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-10">
      {/* HEADER */}
      <div className="bg-[#0F4A33] px-5 py-5">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#7EE8BC] text-sm mb-3">
          <ChevronLeft size={16} /> Dashboard
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold leading-tight">{PRODUCT.title}</h1>
            <p className="text-[#A8D5C2] text-xs mt-1">{PRODUCT.province}</p>
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-2 text-center flex-shrink-0 border border-white/20">
            <p className="text-[#7EE8BC] text-[10px] font-semibold">Export Score</p>
            <p className="text-2xl font-extrabold text-white">{PRODUCT.score}</p>
            <p className="text-white/50 text-[9px]">/ 100</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#7EE8BC] rounded-full animate-pulse" />
          <span className="text-[#7EE8BC] text-xs font-semibold">Aktif di marketplace · 6 bahasa tersedia</span>
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">

        {/* HARGA */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} className="text-green-700" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rekomendasi Harga AI</p>
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <p className="text-4xl font-extrabold text-[#0F4A33]">${PRODUCT.price}</p>
            <p className="text-sm text-gray-400">/ lembar</p>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-gray-500">Rentang:</span>
            <span className="text-xs font-semibold text-gray-700">${PRODUCT.priceRange.min} – ${PRODUCT.priceRange.max}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
            <div className={`${scoreBar} h-2 rounded-full transition-all`} style={{ width: `${PRODUCT.score}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Kurang kompetitif</span>
            <span className="font-semibold text-green-600">Score: {PRODUCT.score}/100</span>
            <span>Sangat kompetitif</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mt-3 bg-gray-50 rounded-lg p-2.5">{PRODUCT.priceRationale}</p>
        </div>

        {/* VOICE NOTIFICATION */}
        <button onClick={handlePlayAudio}
          className={`w-full rounded-xl p-4 flex items-center gap-3 transition-all active:scale-95 ${
            playingAudio ? 'bg-green-700' : 'bg-[#0F4A33]'
          }`}>
          <div className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 ${playingAudio ? 'animate-pulse' : ''}`}>
            <Volume2 size={22} className="text-white" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-sm">{playingAudio ? 'Memutar ringkasan...' : 'Dengar Ringkasan Suara'}</p>
            <p className="text-white/60 text-xs">Ringkasan dalam Bahasa Jawa · ~20 detik</p>
          </div>
          {playingAudio ? (
            <div className="flex gap-0.5 items-end h-7">
              {[3, 5, 4, 7, 3, 6, 4, 5].map((h, i) => (
                <div key={i} className="w-1 bg-[#7EE8BC] rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : (
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">▶</span>
            </div>
          )}
        </button>

        {/* TRANSCRIPT */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transkripsi Suara</p>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">Whisper AI</span>
          </div>
          <p className="text-xs text-gray-400 mb-2">Terdeteksi: <span className="font-semibold text-gray-600">{PRODUCT.transcriptLang}</span></p>
          <p className="text-sm text-gray-700 italic leading-relaxed bg-gray-50 rounded-lg p-3">{PRODUCT.transcript}</p>
        </div>

        {/* VISION ANALYSIS */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Analisis Foto</p>
            <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200">GPT-4o Vision</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: 'Jenis Produk', value: PRODUCT.vision.type },
              { label: 'Kondisi', value: PRODUCT.vision.condition },
              { label: 'Kategori', value: PRODUCT.vision.category },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-2">
                <p className="text-[9px] text-gray-400 uppercase">{item.label}</p>
                <p className="text-xs font-semibold text-gray-800 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mb-1.5 uppercase font-semibold">Fitur Visual Terdeteksi</p>
          <div className="flex flex-wrap gap-1.5">
            {PRODUCT.vision.features.map(f => (
              <span key={f} className="bg-green-50 text-green-800 text-[10px] font-semibold px-2 py-1 rounded-full border border-green-200">{f}</span>
            ))}
          </div>
        </div>

        {/* TARGET PASAR */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={15} className="text-green-700" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Pasar</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT.markets.map(m => (
              <span key={m} className="bg-[#0F4A33] text-white text-xs font-semibold px-3 py-1.5 rounded-full">{m}</span>
            ))}
          </div>
        </div>

        {/* LISTING MULTIBAHASA */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['listings', 'keywords'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold transition-colors ${
                  activeTab === tab
                    ? 'text-[#0F4A33] border-b-2 border-[#0F4A33] bg-green-50/50'
                    : 'text-gray-400'
                }`}>
                {tab === 'listings' ? '🌍 Listing Multibahasa' : '🔍 Keywords SEO'}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === 'listings' && (
              <div className="flex flex-col gap-3">
                {PRODUCT.listings.map(l => (
                  <div key={l.code} className="border border-gray-100 rounded-xl overflow-hidden">
                    {/* ✅ FIX: outer wrapper pakai div, bukan button */}
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedListing(expandedListing === l.code ? null : l.code)}>
                      <span className="text-xl">{l.flag}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#0F4A33] text-white text-[10px] font-bold px-2 py-0.5 rounded">{l.code}</span>
                          <span className="text-xs text-gray-400">{l.lang}</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 mt-1 line-clamp-1">{l.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* ✅ FIX: copy button pakai div + role="button", bukan button dalam button */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); handleCopy(l.title + '\n\n' + l.desc, l.code); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleCopy(l.title + '\n\n' + l.desc, l.code); }}}
                          className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          {copiedCode === l.code
                            ? <CheckCircle size={12} className="text-green-600" />
                            : <Copy size={12} className="text-gray-500" />
                          }
                        </div>
                        <span className="text-gray-400 text-sm">{expandedListing === l.code ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {expandedListing === l.code && (
                      <div className="px-3 pb-3 bg-gray-50/50 border-t border-gray-100">
                        <p className="text-xs text-gray-600 leading-relaxed mt-2">{l.desc}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'keywords' && (
              <div className="flex flex-col gap-3">
                {PRODUCT.listings.map(l => (
                  <div key={l.code}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{l.flag}</span>
                      <span className="bg-[#0F4A33] text-white text-[10px] font-bold px-2 py-0.5 rounded">{l.code}</span>
                      <span className="text-xs text-gray-400">{l.lang}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {l.keywords.map(k => (
                        <span key={k}
                          className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
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

          {/* SHARE BUTTONS */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-all"
            >
              {shared ? <CheckCircle size={16} className="text-green-600" /> : <Share2 size={16} />}
              {shared ? 'Link Disalin!' : 'Bagikan'}
            </button>
            <button
              onClick={() => router.push(`/marketplace/${PRODUCT.id ?? '1'}`)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0F4A33] text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-all"
            >
              <ExternalLink size={16} /> Lihat di Marketplace
            </button>
          </div>

      </div>
    </div>
  );
}