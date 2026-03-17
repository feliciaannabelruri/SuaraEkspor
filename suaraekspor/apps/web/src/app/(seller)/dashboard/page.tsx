'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Package, MessageSquare } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/products').then(({ data }) => {
      setProducts(data.data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <div className="bg-green-900 px-5 py-5">
        <p className="text-green-300 text-xs mb-1">SuaraEkspor</p>
        <h1 className="text-white text-xl font-bold">Dashboard Penjual</h1>
      </div>

      <div className="px-5 pt-5">
        <Link href="/upload"
          className="w-full bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base mb-6">
          <Plus size={20} /> Daftarkan Produk Baru
        </Link>

        <h2 className="text-sm font-bold text-gray-700 mb-3">Produk Saya ({products.length})</h2>

        {loading && <p className="text-gray-400 text-sm">Memuat...</p>}

        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                {p.photoUrls?.[0]
                  ? <img src={p.photoUrls[0]} className="w-full h-full object-cover rounded-lg" alt="" />
                  : <Package size={24} className="text-green-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {p.listings?.[0]?.title ?? p.visionAnalysis?.productType ?? 'Produk baru'}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {p.status === 'processing' ? `AI: ${p.aiPipelineStage}...` : p.status}
                </p>
              </div>
              {p.recommendedPriceUsd && (
                <span className="text-green-700 font-bold text-sm">${p.recommendedPriceUsd}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 max-w-[430px] w-full bg-white border-t border-gray-200 flex">
        <Link href="/dashboard" className="flex-1 flex flex-col items-center py-3 text-green-700">
          <Package size={22} /><span className="text-xs mt-1">Produk</span>
        </Link>
        <Link href="/upload" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <Plus size={22} /><span className="text-xs mt-1">Upload</span>
        </Link>
        <Link href="/conversations" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <MessageSquare size={22} /><span className="text-xs mt-1">Pesan</span>
        </Link>
      </nav>
    </div>
  );
}