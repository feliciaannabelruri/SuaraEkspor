'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Plus, Package, MessageSquare, BookOpen, ChevronRight, Users, X, Check } from 'lucide-react';
import { useMiddleman } from "../context/middleman-context";

const dummyProducts = [
  { id: '1', title: 'Batik Tulis Pekalongan', status: 'active', price: 45, stage: 'done' },
  { id: '2', title: 'Kopi Arabika Toraja', status: 'active', price: 18, stage: 'done' },
  { id: '3', title: 'Gerabah Kasongan', status: 'processing', price: null, stage: 'vision' },
];

export default function DashboardPage() {
  const { isMiddleman, setIsMiddleman, activeUMKM, setActiveUMKM, umkmList } = useMiddleman();
  const [showModal, setShowModal] = useState(false);

  const displayName = isMiddleman && activeUMKM ? activeUMKM.name : 'Pak Slamet · Batik Pekalongan';
  const displaySub = isMiddleman && activeUMKM
    ? `Dikelola oleh Anda · ${activeUMKM.category}`
    : null;

  function handleToggleMiddleman() {
    if (isMiddleman) {
      setIsMiddleman(false);
      setActiveUMKM(null);
    } else {
      setIsMiddleman(true);
      setShowModal(true);
    }
  }

  function handleSelectUMKM(umkm: typeof umkmList[0]) {
    setActiveUMKM(umkm);
    setShowModal(false);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24">

      {/* HEADER */}
      <div className="bg-[#0F4A33] px-5 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#7EE8BC] text-xs mb-1">SuaraEkspor</p>
            <h1 className="text-white text-xl font-bold">Dashboard Penjual</h1>
            <p className="text-[#A8D5C2] text-xs mt-0.5">{displayName}</p>
            {displaySub && (
              <p className="text-[#7EE8BC] text-xs mt-0.5">{displaySub}</p>
            )}
          </div>

          {/* DEMO TOGGLE */}
          <button
            onClick={handleToggleMiddleman}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all mt-1 ${
              isMiddleman
                ? 'bg-[#7EE8BC] text-[#0F4A33] border-[#7EE8BC] font-semibold'
                : 'bg-transparent text-[#7EE8BC] border-[#7EE8BC]/50'
            }`}
          >
            <Users size={13} />
            {isMiddleman ? 'Mode Middleman' : 'Coba Middleman'}
          </button>
        </div>

        {/* BANNER GANTI UMKM */}
        {isMiddleman && activeUMKM && (
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 w-full bg-[#0a3526] border border-[#7EE8BC]/30 rounded-xl px-4 py-2.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#7EE8BC] rounded-full flex items-center justify-center">
                <span className="text-[#0F4A33] text-xs font-bold">
                  {activeUMKM.name.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-white text-xs font-semibold">Mengelola: {activeUMKM.name}</p>
                <p className="text-[#A8D5C2] text-[10px]">Ketuk untuk ganti UMKM</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-[#7EE8BC]" />
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-5 pt-5">
        <Link href="/upload" className="w-full bg-[#0F4A33] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base mb-6">
          <Plus size={20} />
          {isMiddleman && activeUMKM ? `Tambah Produk untuk ${activeUMKM.name}` : 'Daftarkan Produk Baru'}
        </Link>

        <h2 className="text-sm font-bold text-gray-700 mb-3">
          Produk {isMiddleman && activeUMKM ? activeUMKM.name : 'Saya'} ({dummyProducts.length})
        </h2>

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

            <Link href="/whatsapp" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                  <MessageSquare size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">WhatsApp Integration</p>
                  <p className="text-gray-400 text-xs">Kelola pesan buyer via WA</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
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

      {/* MODAL PILIH UMKM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-[430px] rounded-2xl px-5 pt-5 pb-6 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Pilih UMKM yang Dikelola</h2>
              <button onClick={() => {
                if (!activeUMKM) {
                  setIsMiddleman(false);
                }
                setShowModal(false);
              }}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {umkmList.map((umkm) => (
                <button
                  key={umkm.id}
                  onClick={() => handleSelectUMKM(umkm)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    activeUMKM?.id === umkm.id
                      ? 'border-[#0F4A33] bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 bg-[#7EE8BC] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#0F4A33] font-bold text-sm">{umkm.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{umkm.name}</p>
                    <p className="text-gray-400 text-xs">{umkm.owner} · {umkm.category}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-gray-500">{umkm.productCount} produk</span>
                      <span className="text-xs text-[#0F4A33] font-medium">{umkm.chatCount} chat masuk</span>
                    </div>
                  </div>
                  {activeUMKM?.id === umkm.id && (
                    <Check size={16} className="text-[#0F4A33] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}