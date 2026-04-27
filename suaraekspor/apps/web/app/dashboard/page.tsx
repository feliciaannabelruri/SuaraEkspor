'use client';
import Link from 'next/link';
import { Plus, Package, MessageSquare, BookOpen, ChevronRight } from 'lucide-react';

const dummyProducts = [
  { id: '1', title: 'Batik Tulis Pekalongan', status: 'active', price: 45, stage: 'done' },
  { id: '2', title: 'Kopi Arabika Toraja', status: 'active', price: 18, stage: 'done' },
  { id: '3', title: 'Gerabah Kasongan', status: 'processing', price: null, stage: 'vision' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24">
      <div className="bg-[#0F4A33] px-5 py-5">
        <p className="text-[#7EE8BC] text-xs mb-1">SuaraEkspor</p>
        <h1 className="text-white text-xl font-bold">Dashboard Penjual</h1>
        <p className="text-[#A8D5C2] text-xs mt-0.5">Pak Slamet · Batik Pekalongan</p>
      </div>

      <div className="px-5 pt-5">
        <Link href="/upload" className="w-full bg-[#0F4A33] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base mb-6">
          <Plus size={20} /> Daftarkan Produk Baru
        </Link>

        <h2 className="text-sm font-bold text-gray-700 mb-3">Produk Saya ({dummyProducts.length})</h2>

        <div className="flex flex-col gap-3">
          {dummyProducts.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {p.status === 'processing' ? `AI: ${p.stage}...` : 'Aktif di marketplace'}
                </p>
              </div>
              {p.price && <span className="text-green-700 font-bold text-sm">${p.price}</span>}
            </Link>
          ))}
        </div>

        {/* TAMBAHAN MENU */}
        <div className="mt-6">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Menu</h2>
          <div className="flex flex-col gap-2">
            <Link href="/panduan" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                  <BookOpen size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Panduan Ekspor</p>
                  <p className="text-gray-400 text-xs">Regulasi, pembayaran, pengiriman</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          </div>
        </div>

      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-white border-t border-gray-200 flex">
        <Link href="/dashboard" className="flex-1 flex flex-col items-center py-3 text-[#0F4A33]">
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