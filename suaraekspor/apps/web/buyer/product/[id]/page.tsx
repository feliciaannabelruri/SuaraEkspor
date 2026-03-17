'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Globe } from 'lucide-react';

const product = {
  title: 'Handwoven Batik Pekalongan — Classic Parang Motif',
  seller: 'Pak Slamet · Pekalongan, Jawa Tengah',
  price: 45,
  priceRange: '38–52',
  desc: 'Authentic hand-drawn batik from Pekalongan, Indonesia. Features the classic Parang motif using natural dyes on premium mori fabric. Each piece is unique, crafted by skilled artisans with generations of expertise.',
  keywords: ['batik', 'indonesian textile', 'handmade', 'natural dye', 'parang motif'],
  markets: ['USA', 'Japan', 'Germany'],
};

export default function BuyerProductPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [lang, setLang] = useState('en');

  function handleSend() {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setMessage('');
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-10">
      <div className="bg-[#0F4A33] px-5 py-5">
        <button onClick={() => router.back()} className="text-[#7EE8BC] text-sm mb-3 block">← Back to Marketplace</button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-bold leading-tight">{product.title}</h1>
            <p className="text-[#A8D5C2] text-xs mt-1">{product.seller}</p>
          </div>
          <select value={lang} onChange={e => setLang(e.target.value)}
            className="bg-white/10 text-white text-xs rounded-lg px-2 py-1.5 outline-none border border-white/20">
            <option value="en">EN</option>
            <option value="zh">ZH</option>
            <option value="ar">AR</option>
            <option value="ja">JA</option>
            <option value="de">DE</option>
          </select>
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-4">
        {/* FOTO */}
        <div className="w-full h-56 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
          <span className="text-7xl">🧵</span>
        </div>

        {/* HARGA */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-3xl font-extrabold text-[#0F4A33]">${product.price}</p>
            <p className="text-xs text-gray-400">Range: ${product.priceRange}</p>
          </div>
          <div className="flex gap-1.5">
            {['EN','ZH','AR','JA','DE','ID'].map(l => (
              <span key={l} className="bg-green-50 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200">{l}</span>
            ))}
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

        {/* CONTACT SELLER */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Contact Seller</p>
          <p className="text-xs text-gray-400 mb-3">
            Message will be automatically translated. Seller will receive a voice notification in their local language.
          </p>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-bold text-sm">Message sent!</p>
              <p className="text-green-600 text-xs mt-1">AI is processing your message and will reply shortly.</p>
            </div>
          ) : (
            <>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Hi, I'm interested in ordering 5 pieces. What is the shipping cost to the US?"
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-600 resize-none"
              />
              <button onClick={handleSend}
                className="w-full bg-[#0F4A33] text-white font-bold py-3 rounded-xl mt-3 flex items-center justify-center gap-2 text-sm">
                <Send size={16} /> Send Message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}