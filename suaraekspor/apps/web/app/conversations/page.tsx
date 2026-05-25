'use client';
// PATH: suaraekspor/apps/web/app/conversations/page.tsx
// Halaman daftar percakapan SELLER — semua chat dari buyer (REPLACE existing file)

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';
import { MessageSquare, Package, Plus, BellRing, Filter, Search, SearchIcon } from 'lucide-react';
import { useMiddleman } from "../context/middleman-context";

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
    value: '$1,050',
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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  negotiating: { label: 'Negosiasi', bg: 'bg-[#fe802f]', text: 'text-white' },
  confirmed: { label: 'Dikonfirmasi', bg: 'bg-[#0F4A33]', text: 'text-white' },
  pending: { label: 'Menunggu', bg: 'bg-gray-200', text: 'text-gray-700' },
  closed: { label: 'Selesai', bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function ConversationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<'all' | 'unread' | 'negotiating' | 'confirmed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();

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
    <div className="flex min-h-screen bg-[#fdf0e8] text-[#1c1b1b] font-body-md overflow-x-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-[#fdf0e8] flex flex-col relative pb-24 md:pb-10">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">Pesan</h1>
            <p className="text-xs text-gray-500">Kotak Masuk</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/notifications')} className="relative p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-gray-500 text-[18px]">notifications</span>
              {totalUnread > 0 && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-[8px] font-bold leading-none">{totalUnread}</span>
                </div>
              )}
            </button>
            <MobileProfileMenu />
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="px-4 md:px-8 max-w-[1440px] w-full mx-auto pt-4 md:pt-8 pb-20 md:pb-12">
          
          {/* Top App Bar (Header) */}
          <header className="flex justify-between items-start pb-4 text-gray-900 sticky top-0 z-30">
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : Pesan</div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Pesan dari Buyer</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">AI menangani terjemahan & balasan otomatis</p>
          </div>
        </header>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 mt-1">
            <div className="bg-white border border-[#E5D5CB] p-4 rounded-xl flex items-center gap-3 hover:border-[#0F4A33] transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#c5eadf] flex items-center justify-center text-[#0F4A33]">
                <span className="material-symbols-outlined text-[20px]">mark_email_unread</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{totalUnread}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Tidak Terbaca</p>
              </div>
            </div>
            <div className="bg-white border border-[#E5D5CB] p-4 rounded-xl flex items-center gap-3 hover:border-[#0F4A33] transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#ffdbca] flex items-center justify-center text-[#9c4400]">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{CONVERSATIONS.filter(c => c.status === 'negotiating').length}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Negosiasi</p>
              </div>
            </div>
            <div className="bg-white border border-[#E5D5CB] p-4 rounded-xl flex items-center gap-3 hover:border-[#0F4A33] transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#b0f2b7] flex items-center justify-center text-[#0F4A33]">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{CONVERSATIONS.filter(c => c.status === 'confirmed').length}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Dikonfirmasi</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-1">
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1">
              {[
                { key: 'all', label: `Semua (${CONVERSATIONS.length})` },
                { key: 'unread', label: `Belum Dibaca (${totalUnread})` },
                { key: 'negotiating', label: 'Negosiasi' },
                { key: 'confirmed', label: 'Dikonfirmasi' },
              ].map(f => (
                <button key={f.key}
                  onClick={() => setFilter(f.key as typeof filter)}
                  className={`flex-shrink-0 text-[10px] md:text-xs font-bold px-4 md:px-5 py-1.5 md:py-2 rounded-full transition-all border ${filter === f.key
                      ? 'bg-[#0F4A33] text-white border-[#0F4A33]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#0F4A33]/30'
                    }`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 shadow-sm rounded-full py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-[#0F4A33] focus:border-transparent outline-none transition-all"
                placeholder="Cari buyer atau produk..."
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-10 md:py-16 bg-white rounded-xl border border-gray-200">
                <span className="material-symbols-outlined text-gray-300 text-4xl md:text-5xl mb-2">forum</span>
                <p className="text-gray-400 text-xs md:text-sm font-medium">Tidak ada percakapan ditemukan</p>
              </div>
            )}

            {filtered.map(c => {
              const statusCfg = STATUS_CONFIG[c.status];
              return (
                <div key={c.id}
                  onClick={() => router.push(`/conversations/${c.id}`)}
                  className={`bg-white rounded-xl p-4 md:p-5 border cursor-pointer hover:border-[#0F4A33] hover:shadow-md transition-all shadow-sm group ${c.unread > 0 ? 'border-[#0F4A33]/50 ring-1 ring-[#0F4A33]/20' : 'border-gray-200'}`}>
                  
                  <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-5">
                    <div className="flex gap-3 flex-1">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#fdf0e8] border border-gray-100 flex items-center justify-center text-lg md:text-2xl flex-shrink-0 relative">
                        {c.buyerFlag}
                        {c.unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-500 rounded-full text-white text-[8px] md:text-[9px] font-bold flex items-center justify-center border-2 border-white">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[14px] md:text-[16px] text-gray-900 leading-tight group-hover:text-[#0F4A33] transition-colors">{c.buyerName}</h3>
                          <span className="bg-[#F5E6DD] text-[#773200] px-1.5 py-0.5 md:py-1 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px] md:text-[12px]">public</span> {c.buyerCountry}
                          </span>
                          <span className="md:hidden ml-auto text-[9px] text-gray-400 font-medium">{c.time}</span>
                        </div>
                        <p className="text-[#fe802f] font-bold text-[10px] md:text-[11px] mb-1.5 truncate">{c.product}</p>
                        <p className="text-gray-600 text-xs md:text-sm line-clamp-2 italic mb-3 leading-relaxed">"{c.lastMsg}"</p>

                        {/* AI Summary Box */}
                        <div className="bg-[#FFFCEB] border-l-4 border-[#fe802f] p-2.5 md:p-3 rounded-r-lg flex gap-2 items-start">
                          <span className="material-symbols-outlined text-[#fe802f] text-base md:text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                          <p className="text-gray-800 text-[10px] md:text-[11px] leading-relaxed">
                            <span className="font-bold text-[#fe802f]">AI Summary:</span> {c.aiSummary}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Right Column (Value & Status) */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:min-w-[100px] pt-3 md:pt-0 border-t border-gray-100 md:border-none mt-2 md:mt-0">
                      <div className="hidden md:block text-right mb-3">
                        <p className="text-[9px] text-gray-400 font-bold tracking-wider mb-0.5">PROPOSED PRICE</p>
                        <p className="text-[#fe802f] font-extrabold text-xl leading-none">{c.value}</p>
                      </div>
                      
                      {/* Mobile Value Display */}
                      <div className="md:hidden">
                        <p className="text-[8px] text-gray-400 font-bold tracking-wider mb-0.5">VALUE</p>
                        <p className="text-[#0F4A33] font-extrabold text-base leading-none">{c.value}</p>
                      </div>

                      <span className={`${statusCfg.bg} ${statusCfg.text} px-3 py-1 md:py-1.5 rounded-full font-bold text-[9px] md:text-[10px] uppercase tracking-wider`}>
                        {statusCfg.label}
                      </span>

                      <div className="hidden md:block mt-auto text-right">
                        <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase mb-0.5">LAST ACTIVITY</p>
                        <p className="text-gray-900 font-bold text-xs">{c.time} ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM NAV (MOBILE ONLY) */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#01261f] border-t border-[#83a69c]/10 flex pb-safe z-50 shadow-lg">
          {[
            { label: 'Produk', href: '/dashboard', icon: 'inventory_2' },
            { label: 'Upload', href: '/upload', icon: 'upload_file' },
            { label: 'Pesan', href: '/conversations', icon: 'forum', badge: totalUnread },
            { label: 'WhatsApp', href: '/whatsapp', icon: 'chat' },
            { label: 'Panduan', href: '/panduan', icon: 'menu_book' }
          ].map((item) => {
            const isActive = item.href === '/dashboard' 
              ? (pathname === '/dashboard' || (pathname && pathname.startsWith('/product')))
              : (pathname === item.href || (pathname && pathname.startsWith(item.href)));
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex-1 flex flex-col items-center py-2.5 transition-colors relative ${
                  isActive ? 'text-[#fe802f]' : 'text-[#83a69c] opacity-80 hover:opacity-100'
                }`}
              >
                <span 
                  className="material-symbols-outlined text-[20px]" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute top-2 right-4 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center border border-[#01261f]">
                    {item.badge}
                  </span>
                ) : null}
                <span className={`text-[9px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}