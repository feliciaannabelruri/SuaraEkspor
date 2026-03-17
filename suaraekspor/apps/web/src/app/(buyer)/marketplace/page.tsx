'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    apiClient.get(`/marketplace?lang=${lang}`).then(({ data }) => {
      setProducts(data.data ?? []);
    });
  }, [lang]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-green-900 px-5 py-5 sticky top-0 z-10">
        <h1 className="text-white text-xl font-bold">SuaraEkspor Marketplace</h1>
        <p className="text-green-300 text-xs mt-0.5">Authentic Indonesian Products</p>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="mt-3 bg-green-800 text-white text-sm rounded-lg px-3 py-1.5 outline-none">
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="ar">العربية</option>
          <option value="ja">日本語</option>
          <option value="de">Deutsch</option>
          <option value="id">Bahasa Indonesia</option>
        </select>
      </div>

      <div className="px-4 pt-4 pb-6 grid grid-cols-2 gap-3">
        {products.map((p) => {
          const listing = p.listings?.[0];
          return (
            <Link key={p.id} href={`/product/${p.id}?lang=${lang}`}
              className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <div className="w-full h-36 bg-gray-100">
                {p.photoUrls?.[0] && (
                  <img src={p.photoUrls[0]} className="w-full h-full object-cover" alt={listing?.title} />
                )}
              </div>
              <div className="p-3">
                <p className="text-gray-900 font-semibold text-xs line-clamp-2 leading-snug">
                  {listing?.title ?? 'Indonesian Product'}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{p.seller?.province ?? 'Indonesia'}</p>
                {p.recommendedPriceUsd && (
                  <p className="text-green-700 font-bold text-sm mt-1">${p.recommendedPriceUsd}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}