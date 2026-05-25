'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useMiddleman } from "../context/middleman-context";
import Sidebar from '../../components/layout/Sidebar';
import MobileProfileMenu from '../../components/layout/MobileProfileMenu';

type Message = {
  id: string;
  channel: 'wa' | 'inapp';
  buyer: string;
  buyerCountry: string;
  originalText: string;
  translatedText: string;
  aiReply: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
};

const dummyMessages: Message[] = [
  {
    id: '1',
    channel: 'wa',
    buyer: 'Ahmad Faruq',
    buyerCountry: 'Malaysia',
    originalText: 'Hi, I am interested in your batik product. Can you tell me more about the price and shipping to Malaysia?',
    translatedText: 'Halo, saya tertarik dengan produk batik Anda. Bisakah Anda ceritakan lebih lanjut tentang harga dan pengiriman ke Malaysia?',
    aiReply: 'Hi Ahmad! Thank you for your interest. Our batik starts from $45/piece. We ship to Malaysia via JNE International, estimated 5-7 days. Would you like to order?',
    time: '10:32',
    status: 'pending',
  },
  {
    id: '2',
    channel: 'wa',
    buyer: 'Sophie Laurent',
    buyerCountry: 'Prancis',
    originalText: 'Bonjour! Est-ce que vous livrez en France? Quel est le délai de livraison?',
    translatedText: 'Halo! Apakah Anda mengirim ke Prancis? Berapa lama estimasi pengirimannya?',
    aiReply: 'Bonjour Sophie! Yes, we ship to France. Delivery takes 10-14 business days via EMS. Shipping cost starts from $15. Would you like to proceed?',
    time: '09:15',
    status: 'pending',
  },
  {
    id: '3',
    channel: 'inapp',
    buyer: 'Lim Wei',
    buyerCountry: 'Singapura',
    originalText: 'Do you have this in blue color? I want to buy 3 pieces.',
    translatedText: 'Apakah ada warna biru? Saya ingin beli 3 buah.',
    aiReply: 'Hi Lim Wei! Yes, we have blue color available. For 3 pieces, you get 10% discount. Total would be $121.50 including shipping. Shall I confirm your order?',
    time: '08:50',
    status: 'approved',
  },
  {
    id: '4',
    channel: 'wa',
    buyer: 'James Okonkwo',
    buyerCountry: 'Nigeria',
    originalText: 'Hello, what is the minimum order quantity? And do you accept PayPal?',
    translatedText: 'Halo, berapa minimum pemesanan? Dan apakah menerima PayPal?',
    aiReply: 'Hello James! Minimum order is 1 piece. We accept PayPal, bank transfer, and Western Union. Let me know if you have more questions!',
    time: 'Kemarin',
    status: 'rejected',
  },
];

export default function WhatsAppPage() {
  const pathname = usePathname();
  const { isMiddleman, activeUMKM, handleToggleMiddleman } = useMiddleman();
  const [isConnected, setIsConnected] = useState(true);
  const [messages, setMessages] = useState(dummyMessages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'wa' | 'inapp' | 'pending'>('all');

  function handleApprove(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m));
    setEditingId(null);
  }

  function handleReject(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
  }

  function handleEdit(msg: Message) {
    setEditingId(msg.id);
    setEditText(msg.aiReply);
  }

  function handleSaveEdit(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, aiReply: editText, status: 'approved' } : m));
    setEditingId(null);
  }

  const filtered = messages.filter(m => {
    if (activeFilter === 'wa') return m.channel === 'wa';
    if (activeFilter === 'inapp') return m.channel === 'inapp';
    if (activeFilter === 'pending') return m.status === 'pending';
    return true;
  });

  const pendingCount = messages.filter(m => m.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-[#FDF0E8] text-[#1c1b1b] font-body-md overflow-x-hidden">
      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="w-full md:w-[calc(100%-14rem)] md:ml-56 min-h-screen bg-[#FDF0E8] flex flex-col relative pb-24 md:pb-10">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-sm font-bold text-gray-800">WhatsApp</h1>
            <p className="text-xs text-gray-500">Sinkronisasi</p>
          </div>
          <div className="flex items-center gap-4">
            {/* STATUS KONEKSI WA */}
            <div className="bg-white border border-gray-200 rounded-md py-1.5 px-2.5 sm:px-3 flex items-center gap-2 sm:gap-4 shadow-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="relative inline-flex items-center cursor-pointer" onClick={() => setIsConnected(!isConnected)}>
                  <input type="checkbox" className="sr-only peer" checked={isConnected} readOnly />
                  <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#0F4A33]"></div>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-700 uppercase tracking-wider">{isConnected ? 'Connected' : 'Offline'}</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-gray-200"></div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></span>
                <span className="text-[10px] text-gray-500 font-medium">Terakhir: 2 mnt lalu</span>
              </div>
            </div>
            <MobileProfileMenu />
          </div>
        </header>

        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-20 md:pb-12 max-w-[1440px] mx-auto w-full flex-1 space-y-6">
          
          {/* HEADER ROW */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="text-[10px] text-gray-500 font-medium mb-1">Admin : WhatsApp</div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">WhatsApp Integration</h1>
              <p className="text-xs md:text-sm text-gray-500">Sinkronisasi pesan global otomatis dengan teknologi AI.</p>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E5D5CB] p-4 rounded-xl flex items-center gap-3 hover:border-[#0F4A33] transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#c5eadf] flex items-center justify-center text-[#0F4A33]">
                <span className="material-symbols-outlined text-[20px]">pending_actions</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{pendingCount}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Menunggu</p>
              </div>
            </div>
            <div className="bg-white border border-[#E5D5CB] p-4 rounded-xl flex items-center gap-3 hover:border-[#0F4A33] transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#ffdbca] flex items-center justify-center text-[#9c4400]">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{messages.filter(m => m.channel === 'wa').length}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Pesan WA</p>
              </div>
            </div>
            <div className="bg-white border border-[#E5D5CB] p-4 rounded-xl flex items-center gap-3 hover:border-[#0F4A33] transition-all shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#b0f2b7] flex items-center justify-center text-[#0F4A33]">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-gray-800">{messages.filter(m => m.status === 'approved').length}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Disetujui</p>
              </div>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-2">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1">
              {(['all', 'pending', 'wa', 'inapp'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm whitespace-nowrap border transition-colors ${
                    activeFilter === f
                      ? 'bg-[#0F4A33] text-white border-[#0F4A33]'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' ? 'Semua' : f === 'pending' ? 'Pending' : f === 'wa' ? 'WhatsApp' : 'In-App'}
                </button>
              ))}
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-64 flex-shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Cari percakapan..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#0F4A33] text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="bg-[#FDF0E8] overflow-hidden flex flex-col">

            {/* INBOX */}
            <div className="p-4 md:p-6 bg-[#FDF0E8] flex flex-col gap-4">
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-30">chat_bubble</span>
                  <p className="text-sm font-bold">Tidak ada pesan</p>
                </div>
              )}

              {filtered.map((msg) => (
                <div key={msg.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${msg.status === 'rejected' ? 'opacity-60' : ''}`}>
                  
                  {/* Header */}
                  <div className="p-4 md:p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#c5eadf] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#0F4A33] font-bold text-[16px]">{msg.buyer.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-[15px] font-bold text-gray-800 leading-tight">{msg.buyer}</h4>
                            {msg.status === 'pending' && <span className="px-2 py-0.5 bg-[#e5e2e1] text-[#1c1b1b] rounded-full text-[9px] font-bold uppercase tracking-wider">High Priority</span>}
                            <span className="px-2 py-0.5 bg-[#b0f2b7] text-[#00280d] rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">bolt</span> AI Translated
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[#414846] mt-1">
                            <span className="material-symbols-outlined text-[12px]">public</span>
                            <span className="text-[11px] font-medium">{msg.buyerCountry} &bull; {msg.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[9px] font-bold text-[#414846] uppercase tracking-widest mb-0.5">Conversation ID</span>
                        <span className="text-[13px] font-bold text-[#01261f]">#{msg.channel.toUpperCase()}-9823{msg.id}</span>
                      </div>
                    </div>

                    {/* Content Grid (Responsive) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">PESAN ASLI</p>
                        <p className="text-sm italic text-gray-700">"{msg.originalText}"</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2">TERJEMAHAN AI</p>
                        <p className="text-sm text-gray-800">"{msg.translatedText}"</p>
                      </div>
                      <div className="bg-[#f0faf5] p-4 rounded-lg border-l-4 border-[#0F4A33] flex flex-col">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#0F4A33] mb-2">BALASAN AI (SARAN)</p>
                        {editingId === msg.id ? (
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="w-full text-sm text-gray-800 bg-white border border-[#0F4A33]/30 rounded-lg p-2.5 resize-none focus:outline-none focus:border-[#0F4A33] flex-1 min-h-[80px]"
                          />
                        ) : (
                          <p className="text-sm text-gray-800">"{msg.aiReply}"</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  {msg.status === 'pending' && (
                    <div className="px-4 py-3 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-3">
                      <div className="flex gap-4 w-full md:w-auto order-2 md:order-1 justify-center md:justify-start">
                        {editingId !== msg.id && (
                          <>
                            <button onClick={() => handleEdit(msg)} className="flex items-center gap-1.5 text-gray-500 hover:text-[#0F4A33] font-bold text-[13px] transition-colors">
                              <span className="material-symbols-outlined text-[16px]">edit_note</span> Edit Respon
                            </button>
                            <button onClick={() => handleReject(msg.id)} className="flex items-center gap-1.5 text-red-500 hover:text-red-600 font-bold text-[13px] transition-colors">
                              <span className="material-symbols-outlined text-[16px]">close</span> Tolak
                            </button>
                          </>
                        )}
                      </div>
                      
                      <div className="w-full md:w-auto order-1 md:order-2">
                        {editingId === msg.id ? (
                          <button onClick={() => handleSaveEdit(msg.id)} className="w-full md:w-auto bg-[#0F4A33] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                            <span className="material-symbols-outlined text-[16px]">send</span> Simpan & Kirim
                          </button>
                        ) : (
                          <button onClick={() => handleApprove(msg.id)} className="w-full md:w-auto bg-[#0F4A33] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">send</span> Approve & Kirim
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {msg.status === 'approved' && (
                    <div className="px-5 py-3 bg-gray-50 flex items-center justify-center md:justify-start gap-1.5 text-green-700">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <p className="text-[11px] font-bold uppercase tracking-wider">Telah Disetujui & Terkirim</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM NAV MOBILE */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#01261f] border-t border-[#83a69c]/10 flex z-50 pb-safe shadow-lg">
          {[
            { label: 'Produk', href: '/dashboard', icon: 'inventory_2' },
            { label: 'Upload', href: '/upload', icon: 'upload_file' },
            { label: 'Pesan', href: '/conversations', icon: 'forum' },
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
                {item.label === 'Pesan' && (
                  <span className="absolute top-2.5 right-6 w-2 h-2 bg-red-500 rounded-full border border-[#01261f]"></span>
                )}
                <span className={`text-[9px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}