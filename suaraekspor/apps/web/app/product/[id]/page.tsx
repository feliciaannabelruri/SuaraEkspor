'use client';
import { useRouter } from 'next/navigation';
import { Volume2, TrendingUp, Globe, Award } from 'lucide-react';
import { useState } from 'react';

const product = {
  title: 'Batik Tulis Pekalongan — Motif Parang Klasik',
  province: 'Pekalongan, Jawa Tengah',
  transcript: '"Iki batik tulisan tangan saking Pekalongan, motif parang, nganggo pewarna alami, apik banget kualitase..."',
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
    { code: 'EN', lang: 'English', title: 'Handwoven Batik Pekalongan — Classic Parang Motif', desc: 'Authentic hand-drawn batik from Pekalongan, Indonesia. Features the classic Parang motif using natural dyes on premium mori fabric. Each piece is unique, crafted by skilled artisans with generations of expertise.', keywords: ['batik', 'indonesian textile', 'handmade', 'natural dye', 'parang motif'] },
    { code: 'ZH', lang: '中文', title: '手工蜡染布 — 经典巴朗图案', desc: '来自印度尼西亚梭罗的正宗手工蜡染布，采用天然染料，经典巴朗图案，高级莫里布料，每件独一无二。', keywords: ['蜡染', '印尼纺织品', '手工', '天然染料'] },
    { code: 'AR', lang: 'العربية', title: 'باتيك مصنوع يدويًا من باكالونغان', desc: 'باتيك أصيل مرسوم باليد من باكالونغان مع نقوش باران الكلاسيكية والأصباغ الطبيعية.', keywords: ['باتيك', 'نسيج إندونيسي', 'يدوي الصنع'] },
    { code: 'JA', lang: '日本語', title: 'パカロンガン手描きバティック — クラシックパラン柄', desc: 'インドネシア・パカロンガン産の本物の手描きバティック。天然染料を使用したクラシックなパラン模様。', keywords: ['バティック', 'インドネシア', '手作り', '天然染料'] },
    { code: 'DE', lang: 'Deutsch', title: 'Handgezeichneter Batik aus Pekalongan — Klassisches Parang-Motiv', desc: 'Authentischer handgezeichneter Batik aus Pekalongan, Indonesien. Mit klassischem Parang-Motiv und Naturfarben auf hochwertigem Mori-Stoff.', keywords: ['Batik', 'indonesisches Textil', 'handgemacht', 'Naturfarbe'] },
    { code: 'ID', lang: 'Bahasa Indonesia', title: 'Batik Tulis Pekalongan — Motif Parang Klasik', desc: 'Batik tulis asli dari Pekalongan dengan motif parang klasik menggunakan pewarna alami pada kain mori premium. Setiap lembar dikerjakan oleh pengrajin berpengalaman.', keywords: ['batik tulis', 'pekalongan', 'motif parang', 'pewarna alami'] },
  ],
};

export default function ProductDetailPage() {
  const router = useRouter();
  const [playingAudio, setPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');

  function handlePlayAudio() {
    setPlayingAudio(true);
    setTimeout(() => setPlayingAudio(false), 3000);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-10">
      <div className="bg-[#0F4A33] px-5 py-5">
        <button onClick={() => router.back()} className="text-[#7EE8BC] text-sm mb-3 block">← Kembali</button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold leading-tight">{product.title}</h1>
            <p className="text-[#A8D5C2] text-xs mt-1">{product.province}</p>
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-2 text-center flex-shrink-0">
            <p className="text-[#7EE8BC] text-xs font-semibold">Export Score</p>
            <p className="text-white text-2xl font-extrabold">{product.score}</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">

        {/* HARGA */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-700" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rekomendasi Harga AI</p>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-4xl font-extrabold text-[#0F4A33]">${product.price}</p>
            <p className="text-sm text-gray-400">/ lembar</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">Rentang: ${product.priceRange.min} – ${product.priceRange.max}</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
            <div className="bg-[#0F4A33] h-2 rounded-full" style={{ width: `${product.score}%` }} />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mt-2">{product.priceRationale}</p>
        </div>

        {/* NOTIFIKASI SUARA */}
        <button onClick={handlePlayAudio}
          className={`w-full rounded-xl p-4 flex items-center gap-3 transition-all ${playingAudio ? 'bg-green-700' : 'bg-[#0F4A33]'}`}>
          <div className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 ${playingAudio ? 'animate-pulse' : ''}`}>
            <Volume2 size={20} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-bold text-sm">{playingAudio ? 'Memutar ringkasan...' : 'Dengar Ringkasan Suara'}</p>
            <p className="text-white/60 text-xs">Notifikasi dalam Bahasa Jawa · 15 detik</p>
          </div>
          {playingAudio && (
            <div className="ml-auto flex gap-0.5 items-end h-6">
              {[3,5,4,6,3,5,4].map((h,i) => (
                <div key={i} className="w-1 bg-[#7EE8BC] rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}
        </button>

        {/* TRANSCRIPT */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Transkripsi Suara (Whisper AI)</p>
          <p className="text-xs text-gray-400 mb-2">Terdeteksi: <span className="font-semibold text-gray-600">{product.transcriptLang}</span></p>
          <p className="text-sm text-gray-700 italic leading-relaxed bg-gray-50 rounded-lg p-3">{product.transcript}</p>
        </div>

        {/* VISION ANALYSIS */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Analisis Foto (GPT-4o Vision)</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-400">Jenis Produk</p>
              <p className="text-xs font-semibold text-gray-800">{product.vision.type}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-400">Kondisi</p>
              <p className="text-xs font-semibold text-gray-800">{product.vision.condition}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[10px] text-gray-400">Kategori</p>
              <p className="text-xs font-semibold text-gray-800">{product.vision.category}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mb-2">Fitur Visual Terdeteksi</p>
          <div className="flex flex-wrap gap-1.5">
            {product.vision.features.map(f => (
              <span key={f} className="bg-green-50 text-green-800 text-[10px] font-semibold px-2 py-1 rounded-full border border-green-200">{f}</span>
            ))}
          </div>
        </div>

        {/* TARGET PASAR */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-green-700" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Pasar</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.markets.map(m => (
              <span key={m} className="bg-[#0F4A33] text-white text-xs font-semibold px-3 py-1.5 rounded-full">{m}</span>
            ))}
          </div>
        </div>

        {/* TABS — LISTINGS */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button onClick={() => setActiveTab('listings')}
              className={`flex-1 py-3 text-xs font-bold ${activeTab === 'listings' ? 'text-[#0F4A33] border-b-2 border-[#0F4A33]' : 'text-gray-400'}`}>
              Listing Multibahasa
            </button>
            <button onClick={() => setActiveTab('keywords')}
              className={`flex-1 py-3 text-xs font-bold ${activeTab === 'keywords' ? 'text-[#0F4A33] border-b-2 border-[#0F4A33]' : 'text-gray-400'}`}>
              Keywords SEO
            </button>
          </div>
          <div className="p-4">
            {activeTab === 'listings' && (
              <div className="flex flex-col gap-4">
                {product.listings.map(l => (
                  <div key={l.code} className="border-l-4 border-[#0F4A33] pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-[#0F4A33] text-white text-[10px] font-bold px-2 py-0.5 rounded">{l.code}</span>
                      <span className="text-xs text-gray-400">{l.lang}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{l.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{l.desc}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'keywords' && (
              <div className="flex flex-col gap-3">
                {product.listings.map(l => (
                  <div key={l.code}>
                    <span className="bg-[#0F4A33] text-white text-[10px] font-bold px-2 py-0.5 rounded mr-2">{l.code}</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {l.keywords.map(k => (
                        <span key={k} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full">{k}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}