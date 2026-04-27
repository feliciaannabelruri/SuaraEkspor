'use client';
// PATH: suaraekspor/apps/web/app/marketplace/[id]/page.tsx
// Halaman detail produk untuk BUYER — include Contact Seller + send message

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Globe, ChevronLeft, Star, Package, MessageCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

const LANGUAGES = ['EN', 'ZH', 'AR', 'JA', 'DE', 'ID'];

const productData: Record<string, {
  title: string; seller: string; province: string; price: number;
  priceRange: string; desc: string; keywords: string[];
  markets: string[]; score: number; emoji: string;
}> = {
  en: {
    title: 'Handwoven Batik Pekalongan — Classic Parang Motif',
    seller: 'Pak Slamet · Pekalongan, Jawa Tengah',
    province: 'Central Java, Indonesia',
    price: 45, priceRange: '38–52',
    desc: 'Authentic hand-drawn batik from Pekalongan, Indonesia. Features the classic Parang motif using natural dyes on premium mori fabric. Each piece is unique, crafted by skilled artisans with generations of expertise. Perfect for fashion designers, collectors, and cultural enthusiasts worldwide.',
    keywords: ['batik', 'indonesian textile', 'handmade', 'natural dye', 'parang motif'],
    markets: ['USA', 'Japan', 'Germany', 'UAE', 'Netherlands'],
    score: 87, emoji: '🧵',
  },
  zh: {
    title: '手工蜡染布 — 经典巴朗图案',
    seller: '斯拉梅特先生 · 北加浪岸，中爪哇',
    province: '中爪哇，印度尼西亚',
    price: 45, priceRange: '38–52',
    desc: '来自印度尼西亚梭罗的正宗手工蜡染布，采用天然染料，经典巴朗图案，高级莫里布料，每件独一无二。非常适合时装设计师、收藏家和全球文化爱好者。',
    keywords: ['蜡染', '印尼纺织品', '手工', '天然染料'],
    markets: ['China', 'Taiwan', 'Singapore'],
    score: 87, emoji: '🧵',
  },
  id: {
    title: 'Batik Tulis Pekalongan — Motif Parang Klasik',
    seller: 'Pak Slamet · Pekalongan, Jawa Tengah',
    province: 'Jawa Tengah, Indonesia',
    price: 45, priceRange: '38–52',
    desc: 'Batik tulis asli dari Pekalongan dengan motif parang klasik menggunakan pewarna alami pada kain mori premium. Setiap lembar dikerjakan oleh pengrajin berpengalaman dengan keahlian turun-temurun.',
    keywords: ['batik tulis', 'pekalongan', 'motif parang', 'pewarna alami'],
    markets: ['USA', 'Japan', 'Germany'],
    score: 87, emoji: '🧵',
  },
};

const SUGGESTED_MESSAGES = [
  'Hi, I\'m interested in ordering 5 pieces. What is the minimum order?',
  'Can you do custom colors or motifs?',
  'What are the shipping options to the US?',
  'Is this product available in bulk for wholesale?',
];

export default function BuyerProductPage() {
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAllLangs, setShowAllLangs] = useState(false);

  const product = productData[lang] ?? productData['en'];

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-10">
      {/* HEADER */}
      <div className="bg-[#0F4A33] px-5 py-5 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#7EE8BC] text-sm font-semibold">
            <ChevronLeft size={16} /> Marketplace
          </button>
          <div className="flex gap-1.5">
            {(showAllLangs ? LANGUAGES : LANGUAGES.slice(0, 3)).map(l => (
              <button key={l} onClick={() => setLang(l.toLowerCase())}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                  lang === l.toLowerCase()
                    ? 'bg-[#7EE8BC] text-[#0F4A33]'
                    : 'bg-white/10 text-white'
                }`}>{l}</button>
            ))}
            {!showAllLangs && (
              <button onClick={() => setShowAllLangs(true)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/10 text-white/60">+3</button>
            )}
          </div>
        </div>
        <h1 className="text-white text-base font-bold leading-tight">{product.title}</h1>
        <p className="text-[#A8D5C2] text-xs mt-1">{product.seller}</p>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">
        {/* FOTO */}
        <div className="w-full h-56 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <span className="text-8xl">{product.emoji}</span>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-gray-800">Export Score {product.score}</span>
          </div>
          <div className="absolute bottom-3 left-3 bg-[#0F4A33]/90 backdrop-blur-sm rounded-xl px-3 py-1.5">
            <p className="text-[10px] text-[#7EE8BC] font-bold">{product.province}</p>
          </div>
        </div>

        {/* HARGA + BAHASA */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-extrabold text-[#0F4A33]">${product.price}</p>
              <p className="text-xs text-gray-400 mt-0.5">Range: ${product.priceRange} / piece</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 mb-1.5">Available in</p>
              <div className="flex gap-1 flex-wrap justify-end">
                {LANGUAGES.map(l => (
                  <span key={l} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    lang === l.toLowerCase()
                      ? 'bg-[#0F4A33] text-white border-[#0F4A33]'
                      : 'bg-green-50 text-green-800 border-green-200'
                  }`}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* DESKRIPSI */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-green-700" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Description</p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{product.desc}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {product.keywords.map(k => (
              <span key={k} className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-full">{k}</span>
            ))}
          </div>
        </div>

        {/* TARGET MARKETS */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-green-700" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ships To</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.markets.map(m => (
              <span key={m} className="bg-[#0F4A33]/10 text-[#0F4A33] text-xs font-semibold px-3 py-1.5 rounded-full">{m}</span>
            ))}
          </div>
        </div>

        {/* TRUST BADGE */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
          <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-800">AI-Powered Communication</p>
            <p className="text-[10px] text-emerald-600 leading-relaxed">Your message will be instantly translated. Seller receives a voice notification in their local language.</p>
          </div>
        </div>

        {/* CONTACT SELLER */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={16} className="text-[#0F4A33]" />
            <p className="text-sm font-bold text-gray-800">Contact Seller</p>
          </div>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <CheckCircle2 size={36} className="text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-bold text-sm">Message Sent!</p>
              <p className="text-green-600 text-xs mt-1 leading-relaxed">AI is translating your message and notifying the seller. You'll receive a reply shortly.</p>
              <button onClick={() => router.push('/marketplace/conversations/1')}
                className="mt-4 w-full bg-[#0F4A33] text-white font-bold py-3 rounded-xl text-sm">
                View Conversation →
              </button>
            </div>
          ) : (
            <>
              {/* Suggested messages */}
              <div className="mb-3">
                <p className="text-[10px] text-gray-400 font-semibold mb-2">QUICK MESSAGES</p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTED_MESSAGES.map((msg, i) => (
                    <button key={i} onClick={() => setMessage(msg)}
                      className={`text-left text-xs px-3 py-2 rounded-xl border transition-all ${
                        message === msg
                          ? 'border-[#0F4A33] bg-green-50 text-[#0F4A33] font-semibold'
                          : 'border-gray-200 text-gray-600 bg-gray-50'
                      }`}>
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-gray-400 font-semibold mb-2">OR TYPE YOUR OWN</p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your message in any language..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0F4A33] resize-none transition-colors"
              />
              <button onClick={handleSend} disabled={!message.trim() || sending}
                className="w-full bg-[#0F4A33] text-white font-bold py-3.5 rounded-xl mt-3 flex items-center justify-center gap-2 text-sm disabled:opacity-50 transition-all active:scale-95">
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending & Translating...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send Message
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-2">Message auto-translated · Seller notified via voice</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}