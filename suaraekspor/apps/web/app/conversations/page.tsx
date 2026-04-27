'use client';
// PATH: suaraekspor/apps/web/app/conversations/page.tsx
// Halaman daftar percakapan SELLER — semua chat dari buyer (REPLACE existing file)

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Package, Plus, BellRing, Filter, Search } from 'lucide-react';

interface Conversation {
  id: string;
  buyerName: string;
  buyerCountry: string;
  buyerFlag: string;
  product: string;
  lastMsg: string;
  aiSummary: string;
  time: string;
  unread: number;
  status: 'negotiating' | 'confirmed' | 'pending' | 'closed';
  value: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    buyerName: 'John Smith',
    buyerCountry: 'USA',
    buyerFlag: '🇺🇸',
    product: 'Batik Tulis Pekalongan',
    lastMsg: 'That sounds good. Can you do $200 for 5 pieces?',
    aiSummary: 'John lagi nawar harga $200 untuk 5 lembar. AI sudah counter $210. Tunggu konfirmasi.',
    time: '2m',
    unread: 2,
    status: 'negotiating',
    value: '$210',
  },
  {
    id: '2',
    buyerName: 'Tanaka Hiroshi',
    buyerCountry: 'Japan',
    buyerFlag: '🇯🇵',
    product: 'Kopi Arabika Toraja',
    lastMsg: 'Is this coffee available for bulk order? Minimum 10kg?',
    aiSummary: 'Tanaka minta kopi 10kg grosir. Tanya sertifikat organik. Perlu kirim dokumen.',
    time: '1j',
    unread: 1,
    status: 'pending',
    value: '$180',
  },
  {
    id: '3',
    buyerName: 'Sarah Mueller',
    buyerCountry: 'Germany',
    buyerFlag: '🇩🇪',
    product: 'Batik Tulis Pekalongan',
    lastMsg: 'Perfect! I will proceed with the order. Please send payment details.',
    aiSummary: 'Sarah setuju dengan harga. Minta detail pembayaran. Order hampir konfirmasi!',
    time: '3j',
    unread: 0,
    status: 'confirmed',
    value: '$135',
  },
  {
    id: '4',
    buyerName: 'Ahmed Al-Rashid',
    buyerCountry: 'UAE',
    buyerFlag: '🇦🇪',
    product: 'Kerajinan Rotan',
    lastMsg: 'We need minimum 50 sets for our hotel project.',
    aiSummary: 'Ahmed mau order 50 set furniture rotan untuk hotel. Peluang besar, follow up segera!',
    time: 'Kemarin',
    unread: 0,
    status: 'negotiating',
    value: '$2.500',
  },
  {
    id: '5',
    buyerName: 'Yuki Nakamura',
    buyerCountry: 'Japan',
    buyerFlag: '🇯🇵',
    product: 'Kerajinan Anyaman Bambu',
    lastMsg: 'Thank you for the information. I will get back to you.',
    aiSummary: 'Yuki lagi mikir-mikir. Sudah dapat info lengkap. Tunggu keputusan.',
    time: '2 hari',
    unread: 0,
    status: 'pending',
    value: '$90',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  negotiating: { label: 'Negosiasi', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  confirmed: { label: 'Dikonfirmasi ✓', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  pending: { label: 'Menunggu', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  closed: { label: 'Selesai', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
};

export default function ConversationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread' | 'negotiating' | 'confirmed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalUnread = CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0);

  const filtered = CONVERSATIONS.filter(c => {
    if (filter === 'unread') return c.unread > 0;
    if (filter === 'negotiating') return c.status === 'negotiating';
    if (filter === 'confirmed') return c.status === 'confirmed';
    if (searchQuery) return c.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.product.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24">
      {/* HEADER */}
      <div className="bg-[#0F4A33] px-5 py-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-white text-xl font-bold">Pesan dari Buyer</h1>
            <p className="text-[#A8D5C2] text-xs mt-0.5">AI menangani terjemahan & balasan otomatis</p>
          </div>
          <button onClick={() => router.push('/notifications')}
            className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <BellRing size={18} className="text-white" />
            {totalUnread > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">{totalUnread}</span>
              </div>
            )}
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mt-3">
          {[
            { label: 'Tidak Terbaca', value: totalUnread, color: 'bg-red-500' },
            { label: 'Negosiasi', value: CONVERSATIONS.filter(c => c.status === 'negotiating').length, color: 'bg-amber-500' },
            { label: 'Dikonfirmasi', value: CONVERSATIONS.filter(c => c.status === 'confirmed').length, color: 'bg-green-500' },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white text-lg font-extrabold">{s.value}</p>
              <p className="text-[#A8D5C2] text-[9px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="px-5 pt-4 pb-2">
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari buyer atau produk..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#0F4A33] bg-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: `Semua (${CONVERSATIONS.length})` },
            { key: 'unread', label: `Belum Dibaca (${totalUnread})` },
            { key: 'negotiating', label: 'Negosiasi' },
            { key: 'confirmed', label: 'Dikonfirmasi' },
          ].map(f => (
            <button key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                filter === f.key
                  ? 'bg-[#0F4A33] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONVERSATION LIST */}
      <div className="px-5 flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <MessageSquare size={40} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Tidak ada percakapan ditemukan</p>
          </div>
        )}

        {filtered.map(c => {
          const statusCfg = STATUS_CONFIG[c.status];
          return (
            <button key={c.id}
              onClick={() => router.push(`/conversations/${c.id}`)}
              className={`w-full bg-white rounded-xl p-4 border text-left transition-all active:scale-95 ${
                c.unread > 0 ? 'border-[#0F4A33]/30 shadow-sm' : 'border-gray-100'
              }`}>
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    c.unread > 0 ? 'bg-[#0F4A33] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {c.buyerFlag}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm">{c.buyerName}</p>
                      {c.unread > 0 && (
                        <div className="w-5 h-5 bg-[#0F4A33] rounded-full flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold">{c.unread}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{c.buyerCountry}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{c.time}</p>
                  <p className="text-sm font-bold text-[#0F4A33] mt-0.5">{c.value}</p>
                </div>
              </div>

              {/* Product tag */}
              <div className="flex items-center gap-1.5 mb-2">
                <Package size={10} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 font-medium">{c.product}</span>
                <div className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                  {statusCfg.label}
                </div>
              </div>

              {/* Last message */}
              <p className="text-xs text-gray-600 line-clamp-1 mb-2">{c.lastMsg}</p>

              {/* AI Summary */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <p className="text-[10px] font-bold text-amber-700 mb-0.5">📋 Ringkasan AI</p>
                <p className="text-[10px] text-amber-800 leading-relaxed">{c.aiSummary}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-white border-t border-gray-200 flex">
        <a href="/dashboard" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <Package size={20} />
          <span className="text-xs mt-1">Produk</span>
        </a>
        <a href="/upload" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <Plus size={20} />
          <span className="text-xs mt-1">Upload</span>
        </a>
        <a href="/conversations" className="flex-1 flex flex-col items-center py-3 text-[#0F4A33] relative">
          <MessageSquare size={20} />
          {totalUnread > 0 && (
            <div className="absolute top-2 right-5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">{totalUnread}</span>
            </div>
          )}
          <span className="text-xs mt-1">Pesan</span>
        </a>
      </nav>
    </div>
  );
}