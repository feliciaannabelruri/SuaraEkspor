'use client';
import { useState } from 'react';
import Link from 'next/link';

const dummyProducts = [
  { id: '1', title: 'Handwoven Batik Pekalongan — Traditional Javanese Motif', province: 'Jawa Tengah', price: 45, lang: 'EN' },
  { id: '2', title: 'Toraja Arabica Coffee — Single Origin 250g', province: 'Sulawesi Selatan', price: 18, lang: 'EN' },
  { id: '3', title: 'Kasongan Ceramic Pot — Handmade Yogyakarta', province: 'Yogyakarta', price: 32, lang: 'EN' },
  { id: '4', title: 'NTT Hand-woven Tenun Ikat Fabric', province: 'Nusa Tenggara Timur', price: 65, lang: 'EN' },
];

export default function MarketplacePage() {
  const [lang, setLang] = useState('en');

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#0F4A33] px-5 py-5 sticky top-0 z-10">
        <h1 className="text-white text-xl font-bold">SuaraEkspor Marketplace</h1>
        <p className="text-[#A8D5C2] text-xs mt-0.5">Authentic Indonesian Products</p>
        <select value={lang} onChange={(e) => setLang(e.target.value)}
          className="mt-3 bg-[#1B6B4A] text-white text-sm rounded-lg px-3 py-1.5 outline-none border border-green-700">
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="ar">العربية</option>
          <option value="ja">日本語</option>
          <option value="de">Deutsch</option>
          <option value="id">Bahasa Indonesia</option>
        </select>
      </div>

      <div className="px-4 pt-4 pb-6 grid grid-cols-2 gap-3">
        {dummyProducts.map((p) => (
          <Link key={p.id} href={`/product/${p.id}`}
            className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="w-full h-36 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <span className="text-4xl">🏺</span>
            </div>
            <div className="p-3">
              <p className="text-gray-900 font-semibold text-xs line-clamp-2 leading-snug">{p.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">{p.province}</p>
              <p className="text-green-700 font-bold text-sm mt-1">${p.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}